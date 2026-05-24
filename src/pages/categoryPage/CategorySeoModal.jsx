import React, { useState, useEffect, useRef, useCallback } from "react";
import { Get } from "../../service/axiosService";

const TABS = [
  { id: "meta",      label: "META TAGS" },
  { id: "footer",    label: "FOOTER CONTENT" },
  { id: "faq",       label: "FAQ SCHEMA" },
  { id: "sequence",  label: "PRODUCT SEQUENCE" },
];

function buildJsonLd(faqs) {
  const entities = faqs
    .filter((f) => f.question.trim() || f.answer.trim())
    .map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    }));
  return JSON.stringify(
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: entities },
    null, 2
  );
}

// ── Drag-and-drop list item ────────────────────────────────────────────────────
function SortableItem({ item, index, onDragStart, onDragOver, onDrop, onRemove, isPinned }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors cursor-grab active:cursor-grabbing select-none
        ${isPinned ? "border-red-200 bg-red-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
    >
      {/* Drag handle */}
      <span className="text-gray-300 flex-shrink-0">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
        </svg>
      </span>
      {/* Position badge */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
        ${isPinned ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}>
        {index + 1}
      </span>
      {/* Image */}
      {item.image && (
        <img src={item.image} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
      )}
      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-gray-400">{item.category}</p>
      </div>
      {/* Pin indicator */}
      {isPinned && (
        <span className="text-xs font-semibold text-red-500 flex-shrink-0">PINNED</span>
      )}
      {/* Remove from sequence */}
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        title="Remove from sequence"
        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
const CategorySeoModal = ({ page, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("meta");
  const [saving,    setSaving]    = useState(false);

  // Sequence tab state
  const [allProducts,     setAllProducts]     = useState([]);   // all products for this page
  const [sequenced,       setSequenced]       = useState([]);   // ordered list shown in UI
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsLoaded,  setProductsLoaded]  = useState(false);
  const [seqSearch,       setSeqSearch]       = useState("");
  const dragIndexRef = useRef(null);

  const [form, setForm] = useState({
    h1: "", metaTitle: "", metaDescription: "",
    canonicalUrl: "", metaKeyword: "", footerContent: "",
    faqs: [], pinnedProducts: [],
  });

  // ── Load form from page prop ───────────────────────────────────────────────
  useEffect(() => {
    if (!page) return;
    setForm({
      h1:              page.h1              || page.defaultH1 || "",
      metaTitle:       page.metaTitle       || "",
      metaDescription: page.metaDescription || "",
      canonicalUrl:    page.canonicalUrl    || "",
      metaKeyword:     page.metaKeyword     || "",
      footerContent:   page.footerContent   || "",
      faqs:            page.faqs?.length
        ? page.faqs.map((f) => ({ question: f.question || "", answer: f.answer || "" }))
        : [],
      pinnedProducts:  page.pinnedProducts?.length
        ? [...page.pinnedProducts].sort((a, b) => a.position - b.position)
        : [],
    });
    setProductsLoaded(false);
    setSequenced([]);
    setAllProducts([]);
  }, [page]);

  // ── Fetch all products for this page when sequence tab opens ──────────────
  const loadPageProducts = useCallback(async () => {
    if (!page?.pageKey || productsLoaded) return;
    setLoadingProducts(true);
    try {
      const res = await Get(`/products/for-page?pageKey=${encodeURIComponent(page.pageKey)}`);
      const products = res.data?.products || [];
      setAllProducts(products);

      // Build sequenced list:
      // 1. Start with pinned products in their saved order
      // 2. Fill remaining slots with non-pinned products
      const pinnedMap = {};
      (page.pinnedProducts || []).forEach(p => { pinnedMap[p.productId] = p; });
      const pinnedSorted = [...(page.pinnedProducts || [])].sort((a, b) => a.position - b.position);

      // Convert all products to sequencer items
      const toItem = (p, overrideName) => ({
        productId: p._id?.toString() || p.productId,
        name:      p.name || overrideName || "",
        image:     p.media?.primary_image_url || p.image || "",
        category:  p.categorization?.category_name || "",
      });

      // Pinned items first (by position), then rest
      const pinnedIds   = new Set(pinnedSorted.map(p => p.productId));
      const pinnedItems = pinnedSorted.map(p => {
        const full = products.find(pr => pr._id?.toString() === p.productId);
        return full ? toItem(full) : { productId: p.productId, name: p.name, image: p.image, category: "" };
      });
      const restItems   = products
        .filter(p => !pinnedIds.has(p._id?.toString()))
        .map(p => toItem(p));

      setSequenced([...pinnedItems, ...restItems]);
      setProductsLoaded(true);
    } catch (err) {
      console.error("Failed to load page products", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [page, productsLoaded]);

  useEffect(() => {
    if (activeTab === "sequence") loadPageProducts();
  }, [activeTab, loadPageProducts]);

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  const handleDragStart = (index) => { dragIndexRef.current = index; };

  const handleDragOver = (index) => {
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setSequenced(prev => {
      const arr  = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(index, 0, moved);
      dragIndexRef.current = index;
      return arr;
    });
  };

  const handleDrop = () => { dragIndexRef.current = null; };

  const removeFromSequence = (productId) =>
    setSequenced(prev => prev.filter(p => p.productId !== productId));

  // ── Filtered view for search ───────────────────────────────────────────────
  const displayedSequence = seqSearch.trim()
    ? sequenced.filter(p => p.name.toLowerCase().includes(seqSearch.toLowerCase()))
    : sequenced;

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert sequenced list to pinnedProducts with position numbers
      const pinnedProducts = sequenced.map((p, i) => ({
        productId: p.productId,
        position:  i + 1,
        name:      p.name,
        image:     p.image,
      }));
      await onSave(page._id, {
        h1:              form.h1,
        metaTitle:       form.metaTitle,
        metaDescription: form.metaDescription,
        canonicalUrl:    form.canonicalUrl,
        metaKeyword:     form.metaKeyword,
        footerContent:   form.footerContent,
        faqs:            form.faqs,
        pinnedProducts,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addFaq = () =>
    setForm((prev) => ({ ...prev, faqs: [...prev.faqs, { question: "", answer: "" }] }));

  const updateFaq = (index, field, value) =>
    setForm((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });

  const removeFaq = (index) =>
    setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));

  // Which products are currently "pinned" (top N = saved pinnedProducts count)
  const savedPinnedCount = (page?.pinnedProducts || []).length;
  const pinnedIds = new Set((page?.pinnedProducts || []).map(p => p.productId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit SEO — {page?.defaultH1 || page?.pageKey}</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{page?.url}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-6 py-3 text-xs font-bold tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* META TAGS */}
          {activeTab === "meta" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">H1 Tag</label>
                <input type="text" value={form.h1} onChange={(e) => handleChange("h1", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="H1 heading..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => handleChange("metaTitle", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Meta title..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Description</label>
                <textarea rows={3} value={form.metaDescription} onChange={(e) => handleChange("metaDescription", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-y"
                  placeholder="Meta description..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL</label>
                <input type="text" value={page?.url || ""} readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 font-mono cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Canonical URL</label>
                <input type="text" value={form.canonicalUrl} onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="https://www.redheart.in/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Keywords</label>
                <input type="text" value={form.metaKeyword} onChange={(e) => handleChange("metaKeyword", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="keyword1, keyword2, ..." />
              </div>
            </div>
          )}

          {/* FOOTER CONTENT */}
          {activeTab === "footer" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Footer Content (HTML)</label>
                <textarea rows={10} value={form.footerContent} onChange={(e) => handleChange("footerContent", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 resize-y"
                  placeholder="<h2>About...</h2>" />
                <p className="text-xs text-gray-400 mt-1">Supports: H2–H6, tables, links, images, lists</p>
              </div>
              {form.footerContent && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Preview</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: form.footerContent }} />
                </div>
              )}
            </div>
          )}

          {/* FAQ SCHEMA */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">FAQs</p>
              {form.faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                  <button type="button" onClick={() => removeFaq(index)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Question</label>
                    <input type="text" value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                      placeholder="Enter question..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Answer</label>
                    <textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-y"
                      placeholder="Enter answer..." />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addFaq}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add FAQ
              </button>
              {form.faqs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Generated JSON-LD Schema</p>
                  <textarea readOnly rows={12} value={buildJsonLd(form.faqs)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 text-gray-600 resize-y" />
                </div>
              )}
            </div>
          )}

          {/* PRODUCT SEQUENCE */}
          {activeTab === "sequence" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Product Sequence</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Drag to reorder. Products shown here appear in this exact order on the page.
                    <span className="text-red-500 font-medium"> Red = previously pinned.</span>
                  </p>
                </div>
                {productsLoaded && (
                  <span className="text-xs text-gray-400 whitespace-nowrap">{sequenced.length} products</span>
                )}
              </div>

              {/* Search within sequence */}
              {productsLoaded && sequenced.length > 0 && (
                <input
                  type="text"
                  value={seqSearch}
                  onChange={e => setSeqSearch(e.target.value)}
                  placeholder="Filter by name..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              )}

              {loadingProducts && (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Loading products for this page…
                </div>
              )}

              {!loadingProducts && productsLoaded && sequenced.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-10">No products found for this page.</p>
              )}

              {!loadingProducts && productsLoaded && displayedSequence.length > 0 && (
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {displayedSequence.map((item, idx) => {
                    const realIndex = sequenced.findIndex(p => p.productId === item.productId);
                    return (
                      <SortableItem
                        key={item.productId}
                        item={item}
                        index={realIndex}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onRemove={removeFromSequence}
                        isPinned={pinnedIds.has(item.productId)}
                      />
                    );
                  })}
                </div>
              )}

              {!loadingProducts && productsLoaded && sequenced.length > 0 && (
                <p className="text-xs text-gray-400 text-center">
                  Drag products to set their display order. Changes are saved when you click Save Changes.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySeoModal;
