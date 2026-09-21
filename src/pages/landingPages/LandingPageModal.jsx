import React, { useState, useEffect, useCallback, useRef } from "react";
import { getPreviewCount } from "../../service/landingPageService";

const SITE_URL = "https://www.redheart.in";
const CATEGORIES = ["Flowers", "Cakes", "Plants"];

const slugify = (s) =>
  (s || "").toString().trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

const TABS = ["Query", "Meta Tags", "Page Content", "FAQ Schema"];

const LandingPageModal = ({ page, onClose, onSave }) => {
  const isNew = !page;
  const [activeTab, setActiveTab] = useState("Query");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: page?.title || "",
    slug:  page?.slug  || "",
    status: page?.status || "draft",
    query: {
      keyword:       page?.query?.keyword       || "",
      category_name: page?.query?.category_name || "",
      minPrice:      page?.query?.minPrice ?? "",
      maxPrice:      page?.query?.maxPrice ?? "",
    },
    h1:              page?.h1              || "",
    metaTitle:       page?.metaTitle       || "",
    metaDescription: page?.metaDescription || "",
    metaKeywords:    page?.metaKeywords    || "",
    heroImage:       page?.heroImage       || "",
    seoContent:      page?.seoContent      || "",
    faqs:            page?.faqs?.length ? page.faqs.map((f) => ({ question: f.question || "", answer: f.answer || "" })) : [],
  });

  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [previewCount, setPreviewCount] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef(null);

  // Auto-derive slug from title until the admin manually edits the slug field.
  useEffect(() => {
    if (!slugEdited) setForm((f) => ({ ...f, slug: slugify(f.title) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  // Live "N products currently match this query" preview, debounced.
  const fetchPreview = useCallback(async (query) => {
    setPreviewLoading(true);
    try {
      const res = await getPreviewCount({
        keyword: query.keyword || undefined,
        category_name: query.category_name || undefined,
        minPrice: query.minPrice || undefined,
        maxPrice: query.maxPrice || undefined,
      });
      setPreviewCount(res.data?.total ?? null);
    } catch {
      setPreviewCount(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPreview(form.query), 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.query.keyword, form.query.category_name, form.query.minPrice, form.query.maxPrice]);

  const updateQuery = (patch) => setForm((f) => ({ ...f, query: { ...f.query, ...patch } }));

  const addFaq = () => setForm((f) => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }));
  const updateFaq = (i, patch) =>
    setForm((f) => {
      const faqs = [...f.faqs];
      faqs[i] = { ...faqs[i], ...patch };
      return { ...f, faqs };
    });
  const removeFaq = (i) => setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Internal title is required"); return; }
    if (!form.slug.trim()) { setError("URL slug is required"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(page?._id, {
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status,
        query: {
          keyword: form.query.keyword.trim(),
          category_name: form.query.category_name || "",
          minPrice: form.query.minPrice === "" ? undefined : Number(form.query.minPrice),
          maxPrice: form.query.maxPrice === "" ? undefined : Number(form.query.maxPrice),
        },
        h1: form.h1.trim(),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        metaKeywords: form.metaKeywords.trim(),
        canonicalUrl: `${SITE_URL}/lp/${form.slug.trim()}`,
        heroImage: form.heroImage.trim(),
        seoContent: form.seoContent,
        faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">{isNew ? "Create Landing Page" : "Edit Landing Page"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-gray-400">
              /lp/{form.slug || "(auto from title)"}
            </span>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.status === "live"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "live" : "draft" }))}
              />
              Active (live on the storefront)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Internal Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="1 HP Water Pump"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL Slug (optional — auto-generated from title)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })); }}
                placeholder="1-hp-water-pump"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-5 border-b border-gray-200 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-bold uppercase tracking-wide ${
                  activeTab === tab ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Query tab ─────────────────────────────────────────────────── */}
          {activeTab === "Query" && (
            <div>
              <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 font-medium">
                {previewLoading ? "Checking…" : previewCount != null ? `${previewCount} products currently match this query` : "—"}
              </div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">Search Keyword</label>
              <input
                type="text"
                value={form.query.keyword}
                onChange={(e) => updateQuery({ keyword: e.target.value })}
                placeholder="1 HP water pump"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select
                    value={form.query.category_name}
                    onChange={(e) => updateQuery({ category_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  >
                    <option value="">Any category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    value={form.query.minPrice}
                    onChange={(e) => updateQuery({ minPrice: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    value={form.query.maxPrice}
                    onChange={(e) => updateQuery({ maxPrice: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Meta Tags tab ─────────────────────────────────────────────── */}
          {activeTab === "Meta Tags" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">H1</label>
                <input
                  type="text"
                  value={form.h1}
                  onChange={(e) => setForm((f) => ({ ...f, h1: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title</label>
                  <span className={`text-xs ${form.metaTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>{form.metaTitle.length}/60</span>
                </div>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Description</label>
                  <span className={`text-xs ${form.metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>{form.metaDescription.length}/160</span>
                </div>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={form.metaKeywords}
                  onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Canonical URL (preview)</label>
                <p className="font-mono text-xs text-gray-500 break-all">{SITE_URL}/lp/{form.slug || "…"}</p>
              </div>
            </div>
          )}

          {/* ── Page Content tab ──────────────────────────────────────────── */}
          {activeTab === "Page Content" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={form.heroImage}
                  onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))}
                  placeholder="https://…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Content</label>
                <textarea
                  value={form.seoContent}
                  onChange={(e) => setForm((f) => ({ ...f, seoContent: e.target.value }))}
                  rows={8}
                  placeholder="Free-text content shown below the product grid…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
            </div>
          )}

          {/* ── FAQ Schema tab ────────────────────────────────────────────── */}
          {activeTab === "FAQ Schema" && (
            <div>
              {form.faqs.map((faq, i) => (
                <div key={i} className="mb-3 p-3 border border-gray-200 rounded-lg relative">
                  <button
                    onClick={() => removeFaq(i)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(i, { question: e.target.value })}
                    placeholder="Question"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, { answer: e.target.value })}
                    placeholder="Answer"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                  />
                </div>
              ))}
              <button
                onClick={addFaq}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                + Add FAQ
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPageModal;
