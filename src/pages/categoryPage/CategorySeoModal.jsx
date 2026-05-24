import React, { useState, useEffect, useRef } from "react";
import { Get } from "../../service/axiosService";

const TABS = [
  { id: "meta",    label: "META TAGS" },
  { id: "footer",  label: "FOOTER CONTENT" },
  { id: "faq",     label: "FAQ SCHEMA" },
  { id: "pinned",  label: "PINNED PRODUCTS" },
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
    null,
    2
  );
}

const CategorySeoModal = ({ page, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("meta");
  const [saving,    setSaving]    = useState(false);

  // Pinned products search state
  const [pinSearch,    setPinSearch]    = useState("");
  const [pinResults,   setPinResults]   = useState([]);
  const [pinSearching, setPinSearching] = useState(false);
  const searchDebounce = useRef(null);

  const [form, setForm] = useState({
    h1:              "",
    metaTitle:       "",
    metaDescription: "",
    canonicalUrl:    "",
    metaKeyword:     "",
    footerContent:   "",
    faqs:            [],
    pinnedProducts:  [],
  });

  useEffect(() => {
    if (page) {
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
    }
  }, [page]);

  // Search products for pinning
  useEffect(() => {
    if (!pinSearch.trim()) { setPinResults([]); return; }
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setPinSearching(true);
      try {
        const res = await Get(`/products?searchField=${encodeURIComponent(pinSearch)}&limit=8`);
        setPinResults(res.data?.products || []);
      } catch { setPinResults([]); }
      finally { setPinSearching(false); }
    }, 350);
  }, [pinSearch]);

  const addPinnedProduct = (product) => {
    setForm(prev => {
      if (prev.pinnedProducts.find(p => p.productId === product._id)) return prev;
      const nextPos = prev.pinnedProducts.length > 0
        ? Math.max(...prev.pinnedProducts.map(p => p.position)) + 1
        : 1;
      return {
        ...prev,
        pinnedProducts: [
          ...prev.pinnedProducts,
          {
            productId: product._id,
            position:  nextPos,
            name:      product.name,
            image:     product.media?.primary_image_url || "",
          },
        ],
      };
    });
    setPinSearch("");
    setPinResults([]);
  };

  const removePinnedProduct = (productId) =>
    setForm(prev => ({
      ...prev,
      pinnedProducts: prev.pinnedProducts.filter(p => p.productId !== productId),
    }));

  const updatePinnedPosition = (productId, pos) =>
    setForm(prev => ({
      ...prev,
      pinnedProducts: prev.pinnedProducts.map(p =>
        p.productId === productId ? { ...p, position: Number(pos) } : p
      ),
    }));

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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Normalise positions: sort by current position, then re-number 1,2,3…
      const sorted = [...form.pinnedProducts].sort((a, b) => a.position - b.position);
      const renumbered = sorted.map((p, i) => ({ ...p, position: i + 1 }));
      await onSave(page._id, {
        h1:              form.h1,
        metaTitle:       form.metaTitle,
        metaDescription: form.metaDescription,
        canonicalUrl:    form.canonicalUrl,
        metaKeyword:     form.metaKeyword,
        footerContent:   form.footerContent,
        faqs:            form.faqs,
        pinnedProducts:  renumbered,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit SEO — {page?.defaultH1 || page?.pageKey}</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{page?.url}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-6 py-3 text-xs font-bold tracking-wider border-b-2 transition-colors ${
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
                <input
                  type="text"
                  value={form.h1}
                  onChange={(e) => handleChange("h1", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  placeholder="H1 heading..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  placeholder="Meta title..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-y"
                  placeholder="Meta description..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL</label>
                <input
                  type="text"
                  value={page?.url || ""}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={form.canonicalUrl}
                  onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  placeholder="https://www.redheart.in/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  value={form.metaKeyword}
                  onChange={(e) => handleChange("metaKeyword", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  placeholder="keyword1, keyword2, ..."
                />
              </div>
            </div>
          )}

          {/* FOOTER CONTENT */}
          {activeTab === "footer" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Footer Content (HTML)</label>
                <textarea
                  rows={10}
                  value={form.footerContent}
                  onChange={(e) => handleChange("footerContent", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-y"
                  placeholder="<h2>About...</h2>"
                />
                <p className="text-xs text-gray-400 mt-1">Supports: H2–H6, tables, links, images, lists</p>
              </div>
              {form.footerContent && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Preview</p>
                  <div
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: form.footerContent }}
                  />
                </div>
              )}
            </div>
          )}

          {/* PINNED PRODUCTS */}
          {activeTab === "pinned" && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Pin specific products to always appear at the top of this page. Assign a position number — lower = higher up.
              </p>

              {/* Search */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Search & Add Product</label>
                <input
                  type="text"
                  value={pinSearch}
                  onChange={e => setPinSearch(e.target.value)}
                  placeholder="Type product name..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
                {(pinResults.length > 0 || pinSearching) && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {pinSearching && <p className="px-4 py-3 text-sm text-gray-400">Searching…</p>}
                    {!pinSearching && pinResults.map(product => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => addPinnedProduct(product)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                      >
                        {product.media?.primary_image_url && (
                          <img src={product.media.primary_image_url} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.categorization?.category_name} · ₹{product.selling_price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pinned list */}
              {form.pinnedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">No pinned products yet. Search above to add.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pinned ({form.pinnedProducts.length})</p>
                  {[...form.pinnedProducts]
                    .sort((a, b) => a.position - b.position)
                    .map(p => (
                    <div key={p.productId} className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                      {/* Position badge / input */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-0.5">Pos</span>
                        <input
                          type="number"
                          min={1}
                          value={p.position}
                          onChange={e => updatePinnedPosition(p.productId, e.target.value)}
                          className="w-12 text-center border border-gray-300 rounded text-sm font-bold text-red-600 py-1 focus:outline-none focus:ring-1 focus:ring-red-300"
                        />
                      </div>
                      {/* Image */}
                      {p.image && (
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      )}
                      {/* Name */}
                      <p className="flex-1 text-sm text-gray-700 truncate">{p.name}</p>
                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removePinnedProduct(p.productId)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xl leading-none flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, "question", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                      placeholder="Enter question..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Answer</label>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-y"
                      placeholder="Enter answer..."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaq}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add FAQ
              </button>
              {form.faqs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Generated JSON-LD Schema</p>
                  <textarea
                    readOnly
                    rows={12}
                    value={buildJsonLd(form.faqs)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 text-gray-600 resize-y"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySeoModal;
