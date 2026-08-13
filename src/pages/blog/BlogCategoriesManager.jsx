import React, { useState, useEffect, useCallback } from "react";
import {
  fetchBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory,
  fetchBlogSubcategories, createBlogSubcategory, updateBlogSubcategory, deleteBlogSubcategory,
} from "../../service/blogService";

const toSlug = (str) =>
  (str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";

export default function BlogCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "" });
  const [editingCatId, setEditingCatId] = useState(null);

  const [subForm, setSubForm] = useState({ name: "", slug: "" });
  const [editingSubId, setEditingSubId] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchBlogCategories();
      setCategories(data);
      if (!selectedCategory && data.length) setSelectedCategory(data[0]._id);
    } catch {
      setMessage({ type: "error", text: "Failed to load categories." });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubcategories = useCallback(async (categoryId) => {
    if (!categoryId) return setSubcategories([]);
    try {
      const data = await fetchBlogSubcategories(categoryId);
      setSubcategories(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load subcategories." });
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadSubcategories(selectedCategory); }, [selectedCategory, loadSubcategories]);

  const resetCatForm = () => { setCatForm({ name: "", slug: "", description: "" }); setEditingCatId(null); };
  const resetSubForm = () => { setSubForm({ name: "", slug: "" }); setEditingSubId(null); };

  const submitCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const payload = { ...catForm, slug: toSlug(catForm.slug || catForm.name) };
    try {
      if (editingCatId) {
        await updateBlogCategory(editingCatId, payload);
        setMessage({ type: "success", text: "Category updated." });
      } else {
        await createBlogCategory(payload);
        setMessage({ type: "success", text: "Category created." });
      }
      resetCatForm();
      loadCategories();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save category." });
    }
  };

  const submitSubcategory = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !selectedCategory) return;
    const payload = { ...subForm, slug: toSlug(subForm.slug || subForm.name), category: selectedCategory };
    try {
      if (editingSubId) {
        await updateBlogSubcategory(editingSubId, payload);
        setMessage({ type: "success", text: "Subcategory updated." });
      } else {
        await createBlogSubcategory(payload);
        setMessage({ type: "success", text: "Subcategory created." });
      }
      resetSubForm();
      loadSubcategories(selectedCategory);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save subcategory." });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Subcategories must be removed first.")) return;
    try {
      await deleteBlogCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      loadCategories();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to delete category." });
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await deleteBlogSubcategory(id);
      loadSubcategories(selectedCategory);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete subcategory." });
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">Blog Categories</h2>
      <p className="text-sm text-gray-500 mb-6">
        Categories build the post URL (<code className="bg-gray-100 px-1 rounded">redheart.in/blog/&#123;category&#125;/&#123;post-slug&#125;</code>).
        Subcategories are for the /blog hub &amp; filtering only — not part of the URL.
      </p>

      {message && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Categories</h3>
          <form onSubmit={submitCategory} className="space-y-3 mb-5 border-b border-gray-100 pb-5">
            <input className={inputCls} placeholder="Category name (e.g. Flower Guides)" value={catForm.name}
              onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value, slug: f.slug || toSlug(e.target.value) }))} />
            <input className={inputCls} placeholder="Slug (auto from name)" value={catForm.slug}
              onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} />
            <input className={inputCls} placeholder="Description (optional)" value={catForm.description}
              onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="flex gap-2">
              <button type="submit" className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                {editingCatId ? "Update Category" : "+ Add Category"}
              </button>
              {editingCatId && (
                <button type="button" onClick={resetCatForm} className="text-sm text-gray-500 px-2">Cancel</button>
              )}
            </div>
          </form>

          <div className="space-y-1">
            {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm ${selectedCategory === cat._id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50 border border-transparent"}`}
              >
                <div>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <span className="text-gray-400 ml-2">/{cat.slug}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={(e) => { e.stopPropagation(); setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || "" }); setEditingCatId(cat._id); }} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Subcategories {selectedCategory && <span className="text-gray-400 font-normal">— {categories.find((c) => c._id === selectedCategory)?.name}</span>}
          </h3>
          {!selectedCategory ? (
            <p className="text-sm text-gray-400 mt-4">Select a category on the left first.</p>
          ) : (
            <>
              <form onSubmit={submitSubcategory} className="space-y-3 mb-5 mt-4 border-b border-gray-100 pb-5">
                <input className={inputCls} placeholder="Subcategory name (e.g. Mumbai)" value={subForm.name}
                  onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value, slug: f.slug || toSlug(e.target.value) }))} />
                <input className={inputCls} placeholder="Slug (auto from name)" value={subForm.slug}
                  onChange={(e) => setSubForm((f) => ({ ...f, slug: e.target.value }))} />
                <div className="flex gap-2">
                  <button type="submit" className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                    {editingSubId ? "Update Subcategory" : "+ Add Subcategory"}
                  </button>
                  {editingSubId && (
                    <button type="button" onClick={resetSubForm} className="text-sm text-gray-500 px-2">Cancel</button>
                  )}
                </div>
              </form>

              <div className="space-y-1">
                {subcategories.length === 0 && <p className="text-sm text-gray-400">No subcategories yet.</p>}
                {subcategories.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800">{sub.name}</span>
                      <span className="text-gray-400 ml-2">/{sub.slug}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => { setSubForm({ name: sub.name, slug: sub.slug }); setEditingSubId(sub._id); }} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteSubcategory(sub._id)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
