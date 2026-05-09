import React, { useState, useEffect } from "react";

// ── Tab IDs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "meta",    label: "META TAGS" },
  { id: "footer",  label: "FOOTER CONTENT" },
  { id: "faq",     label: "FAQ SCHEMA" },
];

// ── JSON-LD builder ───────────────────────────────────────────────────────────
function buildJsonLd(faqs) {
  const entities = faqs
    .filter((f) => f.question.trim() || f.answer.trim())
    .map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    }));
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entities,
    },
    null,
    2
  );
}

// ── CityModal ─────────────────────────────────────────────────────────────────
const CityModal = ({ city, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("meta");
  const [saving, setSaving]       = useState(false);

  const [form, setForm] = useState({
    metaTitle:       "",
    h1:              "",
    metaDescription: "",
    url:             "",
    canonicalUrl:    "",
    metaKeyword:     "",
    footerContent:   "",
    faqs:            [],
  });

  // Initialise form from city prop
  useEffect(() => {
    if (city) {
      setForm({
        metaTitle:       city.metaTitle       || "",
        h1:              city.h1              || "",
        metaDescription: city.metaDescription || "",
        url:             city.url             || "",
        canonicalUrl:    city.canonicalUrl    || "",
        metaKeyword:     city.metaKeyword     || "",
        footerContent:   city.footerContent   || "",
        faqs:            city.faqs && city.faqs.length > 0
                           ? city.faqs.map((f) => ({ question: f.question || "", answer: f.answer || "" }))
                           : [],
      });
    }
  }, [city]);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── FAQ handlers ──────────────────────────────────────────────────────────
  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const updateFaq = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const removeFaq = (index) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(city._id, {
        metaTitle:       form.metaTitle,
        metaDescription: form.metaDescription,
        h1:              form.h1,
        canonicalUrl:    form.canonicalUrl,
        metaKeyword:     form.metaKeyword,
        footerContent:   form.footerContent,
        faqs:            form.faqs,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit SEO — {city?.cityName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{city?.category} &nbsp;·&nbsp; <span className="font-mono">{city?.url}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
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

          {/* ── TAB 1: META TAGS ── */}
          {activeTab === "meta" && (
            <div className="space-y-4">
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
                  value={form.url}
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Keyword Tag</label>
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

          {/* ── TAB 2: FOOTER CONTENT ── */}
          {activeTab === "footer" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Footer Content (HTML)</label>
                <textarea
                  rows={10}
                  value={form.footerContent}
                  onChange={(e) => handleChange("footerContent", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-y"
                  placeholder="<h2>About Flower Delivery in...</h2>"
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

          {/* ── TAB 3: FAQ SCHEMA ── */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">FAQs</p>

              {form.faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                    aria-label="Remove FAQ"
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

export default CityModal;
