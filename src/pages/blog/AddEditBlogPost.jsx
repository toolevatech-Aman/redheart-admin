import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchBlogCategories, fetchBlogSubcategories, createBlogCategory,
  fetchBlogPostById, createBlogPost, updateBlogPost,
} from "../../service/blogService";
import RichHtmlEditor from "../../comman/RichHtmlEditor/RichHtmlEditor";

const toSlug = (str) =>
  (str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const csvToArray = (str) => (str || "").split(",").map((s) => s.trim()).filter(Boolean);
const arrayToCsv = (arr) => (arr || []).join(", ");

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
const PRODUCT_CATEGORIES = ["Flowers", "Cakes", "Plants"];
const FIXED_PAGES = ["home", "surprise-for-her", "shayari", "quotes"];

// Mirrors the relevant subset of redheart-nextjs's lib/interlinkMap.js —
// keep in sync manually if that file's PRODUCT_CROSSLINKS / category base
// slugs change. Only used to *suggest* links, not to render them live.
const CATEGORY_BASE_SLUG = { Flowers: "florist-near-me", Cakes: "order-cake-online", Plants: "plants-online" };
const PRODUCT_CROSSLINKS = {
  Flowers: { surprise: "/valentine-surprise", shayari: "/shayari/love-shayari", quotes: "/quotes/romantic-quotes" },
  Cakes:   { surprise: "/birthday-surprise",  shayari: "/shayari/birthday-shayari", quotes: "/quotes/birthday-quotes" },
  Plants:  { surprise: "/good-morning-surprise", shayari: "/shayari/good-morning-shayari", quotes: "/quotes/good-morning-quotes" },
};

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
function Field({ label, required, hint, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const initialForm = {
  title: "", slug: "", slugTouched: false,
  category: "", additionalCategories: [], subcategory: "",
  coverImage: "", excerpt: "", content: "",
  authorName: "", status: "draft",
  metaTitle: "", metaDescription: "",
  tagPages: [], tagCategories: [], tagSubcategories: "", tagOccasions: "", tagRelationships: "",
};

export default function AddEditBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [cities, setCities] = useState([]); // [{category, citySlug}]
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadCategories = useCallback(async () => {
    const data = await fetchBlogCategories();
    setCategories(data);
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      const cats = await loadCategories();
      if (isEdit) {
        const post = await fetchBlogPostById(id);
        setForm({
          title: post.title, slug: post.slug, slugTouched: true,
          category: post.category?._id || "",
          additionalCategories: (post.additionalCategories || []).map((c) => c._id || c),
          subcategory: post.subcategory?._id || "",
          coverImage: post.coverImage || "", excerpt: post.excerpt || "", content: post.content || "",
          authorName: post.authorName || "", status: post.status,
          metaTitle: post.metaTitle || "", metaDescription: post.metaDescription || "",
          tagPages: post.tags?.pages || [],
          tagCategories: post.tags?.categories || [],
          tagSubcategories: arrayToCsv(post.tags?.subcategories),
          tagOccasions: arrayToCsv(post.tags?.occasions),
          tagRelationships: arrayToCsv(post.tags?.relationships),
        });
        setCities(post.tags?.cities || []);
      } else if (cats.length) {
        setForm((f) => ({ ...f, category: cats[0]._id }));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!form.category) return setSubcategories([]);
    fetchBlogSubcategories(form.category).then(setSubcategories).catch(() => setSubcategories([]));
  }, [form.category]);

  const set = (key) => (e) => {
    const val = e?.target?.value ?? e;
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "title" && !f.slugTouched) next.slug = toSlug(val);
      if (key === "slug") next.slugTouched = true;
      return next;
    });
  };

  const toggleArrayVal = (key, val) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val] }));

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const cat = await createBlogCategory({ name: newCatName, slug: toSlug(newCatName) });
      const cats = await loadCategories();
      setForm((f) => ({ ...f, category: cat._id }));
      setNewCatName(""); setShowNewCat(false);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create category." });
    }
  };

  // ── Table of Contents — scanned live from the H2/H3 tags in content ──────
  const toc = useMemo(() => {
    const matches = [...form.content.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi)];
    return matches.map((m) => ({ level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, "").trim() }));
  }, [form.content]);

  const hasStrayH1 = /<h1[^>]*>/i.test(form.content);

  // ── Interlink suggestions — derived from this post's own category/city tags ─
  const suggestions = useMemo(() => {
    const out = [];
    form.tagCategories.forEach((cat) => {
      const base = CATEGORY_BASE_SLUG[cat];
      if (base) out.push({ label: `${cat} category page`, url: `/${base}` });
      const cross = PRODUCT_CROSSLINKS[cat];
      if (cross) {
        out.push({ label: `${cat} → Surprise page`, url: cross.surprise });
        out.push({ label: `${cat} → Shayari`, url: cross.shayari });
        out.push({ label: `${cat} → Quotes`, url: cross.quotes });
      }
    });
    cities.forEach((c) => {
      const base = CATEGORY_BASE_SLUG[c.category];
      if (base && c.citySlug) out.push({ label: `${c.category} in ${c.citySlug}`, url: `/${base}/${c.citySlug}` });
    });
    // de-dupe by url
    return out.filter((s, i) => out.findIndex((o) => o.url === s.url) === i);
  }, [form.tagCategories, cities]);

  const insertLink = (url, label) => {
    const anchor = `<a href="${url}">${label}</a>`;
    setForm((f) => ({ ...f, content: f.content + (f.content.endsWith("\n") ? "" : "\n") + anchor + "\n" }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    slug: toSlug(form.slug),
    category: form.category,
    additionalCategories: form.additionalCategories,
    subcategory: form.subcategory || null,
    coverImage: form.coverImage,
    excerpt: form.excerpt,
    content: form.content,
    authorName: form.authorName.trim(),
    status: form.status,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    tags: {
      pages: form.tagPages,
      categories: form.tagCategories,
      subcategories: csvToArray(form.tagSubcategories),
      occasions: csvToArray(form.tagOccasions),
      relationships: csvToArray(form.tagRelationships),
      cities: cities.filter((c) => c.category && c.citySlug),
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.category || !form.authorName.trim()) {
      setMessage({ type: "error", text: "Title, Slug, Category and Author Name are required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (isEdit) await updateBlogPost(id, buildPayload());
      else await createBlogPost(buildPayload());
      setMessage({ type: "success", text: `Post ${isEdit ? "updated" : "created"} successfully.` });
      if (!isEdit) setTimeout(() => navigate("/blog-posts"), 800);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save post." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{isEdit ? "Edit Blog Post" : "Add Blog Post"}</h2>
          <p className="text-sm text-gray-500 mt-1">
            URL: <code className="bg-gray-100 px-1 rounded">redheart.in/blog/{categories.find((c) => c._id === form.category)?.slug || "{category}"}/{form.slug || "{slug}"}</code>
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Basic Info">
          <Field label="Title (rendered as the page's H1)" required className="sm:col-span-2">
            <input className={inputCls} value={form.title} onChange={set("title")} placeholder="The Ultimate Flower Guide for Mumbai" />
          </Field>
          <Field label="Slug" required hint="Auto from title; editable."><input className={inputCls} value={form.slug} onChange={set("slug")} /></Field>
          <Field label="Author Name" required><input className={inputCls} value={form.authorName} onChange={set("authorName")} /></Field>

          <Field label="Primary Category" required hint="Drives this post's URL.">
            <div className="flex gap-2">
              <select className={inputCls} value={form.category} onChange={set("category")}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => setShowNewCat((s) => !s)} className="shrink-0 text-sm px-3 rounded-lg border border-gray-300 hover:bg-gray-50">+ New</button>
            </div>
            {showNewCat && (
              <div className="flex gap-2 mt-2">
                <input className={inputCls} placeholder="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <button type="button" onClick={handleAddCategory} className="shrink-0 text-sm px-3 rounded-lg bg-red-600 text-white">Create</button>
              </div>
            )}
          </Field>
          <Field label="Additional Categories" hint="Also list this post under these categories' /blog hub pages — doesn't change the URL.">
            <div className="flex flex-wrap gap-2">
              {categories.filter((c) => c._id !== form.category).length === 0 && (
                <span className="text-xs text-gray-400">No other categories yet.</span>
              )}
              {categories.filter((c) => c._id !== form.category).map((c) => (
                <label key={c._id} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${form.additionalCategories.includes(c._id) ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-600"}`}>
                  <input type="checkbox" className="hidden" checked={form.additionalCategories.includes(c._id)}
                    onChange={() => setForm((f) => ({ ...f, additionalCategories: f.additionalCategories.includes(c._id) ? f.additionalCategories.filter((v) => v !== c._id) : [...f.additionalCategories, c._id] }))} />
                  {c.name}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Subcategory" hint="Hub/filtering only — not part of the URL.">
            <select className={inputCls} value={form.subcategory} onChange={set("subcategory")}>
              <option value="">None</option>
              {subcategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </Field>

          <Field label="Cover Image URL" className="sm:col-span-2"><input className={inputCls} value={form.coverImage} onChange={set("coverImage")} placeholder="https://..." /></Field>
          <Field label="Excerpt" hint="Shown in Related Blog cards" className="sm:col-span-2">
            <textarea className={inputCls} rows={2} value={form.excerpt} onChange={set("excerpt")} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={set("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </Section>

        <Section title="SEO">
          <Field label="Meta Title"><input className={inputCls} value={form.metaTitle} onChange={set("metaTitle")} /></Field>
          <Field label="Meta Description"><input className={inputCls} value={form.metaDescription} onChange={set("metaDescription")} /></Field>
        </Section>

        {/* Content + TOC + Interlinking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Content</h3>
            <p className="text-xs text-gray-500 mb-3">
              Raw HTML. The title above is the page's only H1 — do not add another <code>&lt;h1&gt;</code> here.
              Use <code>&lt;h2&gt;</code> for main sections, <code>&lt;h3&gt;</code>/<code>&lt;h4&gt;</code> for points under them.
            </p>
            {hasStrayH1 && (
              <div className="mb-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ⚠ Found an &lt;h1&gt; inside the content — remove it. The title field is the only H1 on this page.
              </div>
            )}
            <RichHtmlEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Write the post here — use the Heading button for section titles, and the link button to interlink to other pages."
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Table of Contents (live preview)</h3>
              {toc.length === 0 ? (
                <p className="text-xs text-gray-400">Add H2/H3 headings to see the outline here.</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {toc.map((item, i) => (
                    <li key={i} style={{ marginLeft: (item.level - 2) * 14 }} className="text-gray-600 truncate">
                      {item.level === 2 ? "•" : "–"} {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Interlink Suggestions</h3>
              <p className="text-xs text-gray-500 mb-3">Based on this post's category &amp; city tags below.</p>
              {suggestions.length === 0 ? (
                <p className="text-xs text-gray-400">Set category/city tags to see suggestions.</p>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <div className="text-gray-700 font-medium truncate">{s.label}</div>
                        <div className="text-gray-400 truncate">{s.url}</div>
                      </div>
                      <button type="button" onClick={() => insertLink(s.url, s.label)} className="shrink-0 px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">Insert</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cross-page tags */}
        <Section title="Cross-Page Tags" subtitle="Where this post also surfaces as a 'Related Blog' card elsewhere on the site.">
          <Field label="Pages" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {FIXED_PAGES.map((p) => (
                <label key={p} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${form.tagPages.includes(p) ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-600"}`}>
                  <input type="checkbox" className="hidden" checked={form.tagPages.includes(p)} onChange={() => toggleArrayVal("tagPages", p)} />
                  {p}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Product Categories" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((c) => (
                <label key={c} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${form.tagCategories.includes(c) ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-600"}`}>
                  <input type="checkbox" className="hidden" checked={form.tagCategories.includes(c)} onChange={() => toggleArrayVal("tagCategories", c)} />
                  {c}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Product Subcategories" hint="Comma-separated"><input className={inputCls} value={form.tagSubcategories} onChange={set("tagSubcategories")} placeholder="Roses, Lilies" /></Field>
          <Field label="Occasions" hint="Comma-separated"><input className={inputCls} value={form.tagOccasions} onChange={set("tagOccasions")} placeholder="Birthday, Anniversary" /></Field>
          <Field label="Relationships" hint="Comma-separated"><input className={inputCls} value={form.tagRelationships} onChange={set("tagRelationships")} placeholder="Wife, Mother" /></Field>

          <Field label="Cities" className="sm:col-span-2"
            hint='Type "India" as the city for a category to match every city page under that category, instead of just one.'>
            <div className="space-y-2">
              {cities.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className={inputCls} value={c.category} onChange={(e) => setCities((rows) => rows.map((r, idx) => idx === i ? { ...r, category: e.target.value } : r))}>
                    <option value="">Category…</option>
                    {PRODUCT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input className={inputCls} placeholder="city-slug (e.g. mumbai, or India for all)" value={c.citySlug} onChange={(e) => setCities((rows) => rows.map((r, idx) => idx === i ? { ...r, citySlug: e.target.value } : r))} />
                  <button type="button" onClick={() => setCities((rows) => rows.filter((_, idx) => idx !== i))} className="text-red-500 text-sm px-2">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setCities((rows) => [...rows, { category: "", citySlug: "" }])} className="text-sm text-red-600 font-medium">+ Add City</button>
            </div>
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Update Post" : "Create Post"}
          </button>
          <button type="button" onClick={() => navigate("/blog-posts")} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </form>
    </div>
  );
}
