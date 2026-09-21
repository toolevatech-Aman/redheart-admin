import React, { useState, useEffect, useCallback } from "react";
import LandingPageModal from "./LandingPageModal";
import BulkCreateModal from "./BulkCreateModal";
import {
  getLandingPages, createLandingPage, updateLandingPage, deleteLandingPage,
} from "../../service/landingPageService";

const SITE_URL = "https://www.redheart.in";

function truncate(str, len) {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function queryLabel(query) {
  if (!query) return "—";
  const parts = [];
  if (query.keyword) parts.push(query.keyword);
  if (query.category_name) parts.push(`category: ${query.category_name}`);
  return parts.join(" · ") || "All products";
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

const LandingPagesManager = () => {
  const [pages,        setPages]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [editingPage,  setEditingPage]  = useState(null); // null = closed, {} = new, {...} = edit
  const [showBulk,     setShowBulk]     = useState(false);

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLandingPages();
      setPages(res.data?.data || []);
    } catch (err) {
      console.error("loadPages error", err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);

  const filtered = search.trim()
    ? pages.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.slug?.toLowerCase().includes(search.toLowerCase())
      )
    : pages;

  const handleSave = async (id, formData) => {
    if (id) {
      await updateLandingPage(id, formData);
    } else {
      await createLandingPage(formData);
    }
    await loadPages();
    setEditingPage(null);
  };

  const handleDelete = async (page) => {
    if (!window.confirm(`Delete landing page "${page.title}"? This can't be undone.`)) return;
    try {
      await deleteLandingPage(page._id);
      await loadPages();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleBulkCreated = async () => {
    setShowBulk(false);
    await loadPages();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            SEO pages built from a saved search + filter query — like a targeted /lp/1-hp-water-pump page that stays live-current.
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or slug…"
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBulk(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            ⇉ Bulk-Create from List
          </button>
          <button
            onClick={() => setEditingPage({})}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 shadow-sm"
          >
            + New Landing Page
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Page</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Query</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Meta Title</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">FAQs</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                        No landing pages yet.
                      </td>
                    </tr>
                  )}
                  {filtered.map((page) => (
                    <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800 text-sm">{page.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500 break-all">/lp/{page.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <span title={queryLabel(page.query)}>{truncate(queryLabel(page.query), 40)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {page.status === "live" ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">✓ Live</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <span title={page.metaTitle}>{truncate(page.metaTitle, 45)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {page.faqs?.length > 0
                          ? <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">{page.faqs.length}</span>
                          : <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 font-medium">None</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`${SITE_URL}/lp/${page.slug}`}
                            target="_blank" rel="noreferrer"
                            className="p-1.5 text-gray-500 hover:text-gray-800"
                            title="View live"
                          >
                            ↗
                          </a>
                          <button
                            onClick={() => setEditingPage(page)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(page)}
                            className="px-2 py-1.5 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {pages.length} pages
            </div>
          </>
        )}
      </div>

      {editingPage && (
        <LandingPageModal
          page={editingPage._id ? editingPage : null}
          onClose={() => setEditingPage(null)}
          onSave={handleSave}
        />
      )}
      {showBulk && (
        <BulkCreateModal
          onClose={() => setShowBulk(false)}
          onCreated={handleBulkCreated}
        />
      )}
    </div>
  );
};

export default LandingPagesManager;
