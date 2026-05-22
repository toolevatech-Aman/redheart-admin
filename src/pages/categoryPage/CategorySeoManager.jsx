import React, { useState, useEffect, useCallback } from "react";
import CategorySeoModal from "./CategorySeoModal";
import {
  getCategoryPages,
  updateCategoryPage,
  seedCategoryPages,
} from "../../service/categorySeoService";
import { PAGE_H1_MAP } from "../../utils/urlTaxonomy";
import { PAGE_META_MAP } from "../../utils/pageMeta";

// ── Dynamically built from PAGE_H1_MAP + PAGE_META_MAP ───────────────────────
// Adding a new entry to either taxonomy file automatically adds it here.
const ALL_PAGES = Object.entries(PAGE_H1_MAP).map(([pageKey, defaultH1]) => {
  const parts          = pageKey.split("/");
  const categorySlug   = parts[0];
  const subcategorySlug = parts[1] || "";
  const meta           = PAGE_META_MAP[pageKey] || {};
  return {
    pageKey,
    categorySlug,
    subcategorySlug,
    url:             `/${pageKey}`,
    defaultH1,
    metaTitle:       meta.title       || "",
    metaDescription: meta.description || "",
  };
});

// ── Category root breadcrumb config ──────────────────────────────────────────
const CATEGORY_ROOTS = {
  "florist-near-me":          { label: "Flowers",      url: "/florist-near-me"         },
  "flowers":                  { label: "Flowers",      url: "/florist-near-me"         },
  "order-cake-online":        { label: "Cakes",        url: "/order-cake-online"       },
  "cakes":                    { label: "Cakes",        url: "/order-cake-online"       },
  "plants-online":            { label: "Plants",       url: "/plants-online"           },
  "plants":                   { label: "Plants",       url: "/plants-online"           },
  "birthday-gifts-delivery":  { label: "Birthday",     url: "/birthday-gifts-delivery" },
  "birthday":                 { label: "Birthday",     url: "/birthday-gifts-delivery" },
  "anniversary-gifts-delivery":{ label: "Anniversary", url: "/anniversary-gifts-delivery" },
  "anniversary":              { label: "Anniversary",  url: "/anniversary-gifts-delivery" },
  "wedding-gifts-online":     { label: "Wedding",      url: "/wedding-gifts-online"    },
  "wedding":                  { label: "Wedding",      url: "/wedding-gifts-online"    },
  "gift-hampers":             { label: "Hampers",      url: "/gift-hampers"            },
  "hampers":                  { label: "Hampers",      url: "/gift-hampers"            },
};

function buildDefaultBreadcrumb(pageKey, defaultH1, categorySlug, subcategorySlug, url) {
  const home = { label: "Home", url: "/" };
  const root = CATEGORY_ROOTS[categorySlug];

  if (!subcategorySlug) {
    // Top-level page: Home > Category
    return [home, { label: root?.label || defaultH1, url }];
  }

  // Sub-page: Home > Category > Subcategory
  const catCrumb = root
    ? { label: root.label, url: root.url }
    : { label: categorySlug, url: `/${categorySlug}` };

  return [home, catCrumb, { label: defaultH1, url }];
}

// ── Default keywords from H1 + common delivery terms ─────────────────────────
function buildDefaultKeywords(h1, categorySlug) {
  const base   = h1.toLowerCase();
  const brand  = "redheart";
  const suffix = ["online", "india", "same day delivery", "free delivery", brand];
  const terms  = [base, ...suffix.map((s) => `${base} ${s}`)];

  // Add category-specific extras
  if (categorySlug.includes("flower") || categorySlug.includes("florist")) {
    terms.push("flower bouquet", "send flowers online", "fresh flowers delivery");
  } else if (categorySlug.includes("cake") || categorySlug.includes("order-cake")) {
    terms.push("order cake online", "custom cakes", "midnight cake delivery");
  } else if (categorySlug.includes("plant")) {
    terms.push("indoor plants", "buy plants online", "gift plants");
  } else if (categorySlug.includes("birthday")) {
    terms.push("birthday gifts online", "birthday delivery", "birthday surprise");
  } else if (categorySlug.includes("anniversary")) {
    terms.push("anniversary gifts", "anniversary surprise", "romantic gifts");
  } else if (categorySlug.includes("wedding")) {
    terms.push("wedding gifts", "wedding flowers", "wedding decoration");
  } else if (categorySlug.includes("hamper")) {
    terms.push("gift hampers", "luxury hampers", "personalised hampers");
  }

  return [...new Set(terms)].slice(0, 10).join(", ");
}

// ── Default FAQs based on category ───────────────────────────────────────────
function buildDefaultFaqs(h1, categorySlug) {
  const topic = h1;

  if (categorySlug.includes("flower") || categorySlug.includes("florist")) {
    return [
      { question: `Can I get ${topic} with same day delivery?`, answer: `Yes! RedHeart offers same day and midnight ${topic.toLowerCase()} across 430+ cities in India.` },
      { question: `What is the starting price for ${topic}?`, answer: `${topic} starts from ₹399 at RedHeart. We offer a wide range of bouquets to suit every budget.` },
      { question: `How fresh are the flowers at RedHeart?`, answer: `All flowers at RedHeart are sourced fresh daily from certified growers and delivered within hours of cutting.` },
    ];
  } else if (categorySlug.includes("cake") || categorySlug.includes("order-cake")) {
    return [
      { question: `Can I order ${topic} with same day delivery?`, answer: `Yes! RedHeart offers same day and midnight ${topic.toLowerCase()} across 430+ cities in India.` },
      { question: `What is the starting price for ${topic}?`, answer: `${topic} starts from ₹599 at RedHeart. We offer a wide variety of flavours and custom designs.` },
      { question: `Can I customise my cake at RedHeart?`, answer: `Yes, RedHeart offers customised cakes with personalised messages, photos, and designs for all occasions.` },
    ];
  } else if (categorySlug.includes("plant")) {
    return [
      { question: `Can I get ${topic} with home delivery?`, answer: `Yes! RedHeart delivers ${topic.toLowerCase()} right to your doorstep across India with safe, secure packaging.` },
      { question: `What is the starting price for ${topic}?`, answer: `${topic} starts from ₹299 at RedHeart. We offer a wide range of indoor and outdoor plants.` },
      { question: `Are the plants at RedHeart healthy and well-rooted?`, answer: `Yes, all plants at RedHeart are healthy, well-rooted, and come in premium pots with care instructions.` },
    ];
  } else {
    return [
      { question: `Can I get ${topic} with same day delivery?`, answer: `Yes! RedHeart offers same day and midnight ${topic.toLowerCase()} across 430+ cities in India.` },
      { question: `What is the starting price for ${topic}?`, answer: `${topic} starts from ₹299 at RedHeart. We offer a wide range of options to suit every budget.` },
      { question: `Does RedHeart deliver ${topic} across India?`, answer: `Yes, RedHeart delivers ${topic.toLowerCase()} to 430+ cities across India with same day and midnight delivery options.` },
    ];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function truncate(str, len) {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const CategorySeoManager = () => {
  const [pages,       setPages]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [seeding,     setSeeding]     = useState(false);
  const [seedResult,  setSeedResult]  = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [search,      setSearch]      = useState("");

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategoryPages();
      setPages(res.data?.data || []);
    } catch (err) {
      console.error("loadPages error", err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);

  // Merge DB data with ALL_PAGES list so every page is visible
  const mergedPages = ALL_PAGES.map((p) => {
    const saved = pages.find((s) => s.pageKey === p.pageKey);
    return saved ? saved : { ...p, _id: null };
  });

  const filtered = search.trim()
    ? mergedPages.filter(
        (p) =>
          p.pageKey.toLowerCase().includes(search.toLowerCase()) ||
          (p.defaultH1 || "").toLowerCase().includes(search.toLowerCase())
      )
    : mergedPages;

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const payload = ALL_PAGES.map((p) => ({
        ...p,
        h1:              p.defaultH1 || "",
        metaTitle:       p.metaTitle || "",
        metaDescription: p.metaDescription || "",
        canonicalUrl:    `https://www.redheart.in${p.url}`,
        metaKeyword:     buildDefaultKeywords(p.defaultH1, p.categorySlug),
        footerContent:   "",
        faqs:            buildDefaultFaqs(p.defaultH1, p.categorySlug),
        breadcrumb:      buildDefaultBreadcrumb(p.pageKey, p.defaultH1, p.categorySlug, p.subcategorySlug, p.url),
      }));
      const res = await seedCategoryPages(payload);
      setSeedResult(`✅ ${res.data.message}`);
      await loadPages();
    } catch (err) {
      setSeedResult(`❌ ${err?.response?.data?.message || "Seed failed"}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async (id, formData) => {
    try {
      await updateCategoryPage(id, formData);
      await loadPages();
      setEditingPage(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  const savedCount   = pages.length;
  const unsavedCount = ALL_PAGES.length - savedCount;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Page SEO</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage SEO meta tags, H1, footer content, and FAQs for all category and subcategory pages.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
              ✓ {savedCount} saved in DB
            </span>
            {unsavedCount > 0 && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">
                ⚠ {unsavedCount} not yet seeded
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-60"
          >
            {seeding ? "Seeding…" : "🌱 Seed All Pages"}
          </button>
          {seedResult && <p className="text-xs text-gray-600">{seedResult}</p>}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by page key or name…"
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Page</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-52">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">H1 Tag</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Meta Title</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Meta Description</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Keywords</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">FAQs</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Footer</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((page, idx) => (
                    <tr key={page.pageKey || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800 text-xs">{page.defaultH1 || page.pageKey}</div>
                        {!page._id && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-medium">not seeded</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500 break-all">{page.url}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">
                        <span title={page.h1 || page.defaultH1}>{truncate(page.h1 || page.defaultH1, 35)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <span title={page.metaTitle}>{truncate(page.metaTitle, 50)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        <span title={page.metaDescription}>{truncate(page.metaDescription, 55)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {page.metaKeyword
                          ? <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">✓ Set</span>
                          : <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-medium">Empty</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {page.faqs?.length > 0
                          ? <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">✓ {page.faqs.length}</span>
                          : <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-medium">Empty</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {page.footerContent?.trim()
                          ? <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">✓ Set</span>
                          : <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">— None</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditingPage(page)}
                          disabled={!page._id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={!page._id ? "Seed pages first to enable editing" : "Edit SEO"}
                        >
                          Edit SEO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} pages
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <CategorySeoModal
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CategorySeoManager;
