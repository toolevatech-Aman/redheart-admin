import React, { useState, useEffect, useCallback } from "react";
import CityModal from "./CityModal";
import {
  getCities,
  addCitiesBulk,
  updateCity,
  deleteCity,
} from "../../service/cityPageService";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "Flowers", label: "Flowers", emoji: "🌸", accent: "red"   },
  { key: "Cakes",   label: "Cakes",   emoji: "🎂", accent: "amber" },
  { key: "Plants",  label: "Plants",  emoji: "🌿", accent: "green" },
];

const ACCENT = {
  red: {
    tab:     "bg-red-600 text-white",
    tabOff:  "text-gray-600 hover:text-red-600 hover:bg-red-50",
    btn:     "bg-red-600 hover:bg-red-700 text-white",
    outline: "border border-red-400 text-red-600 hover:bg-red-50",
  },
  amber: {
    tab:     "bg-amber-500 text-white",
    tabOff:  "text-gray-600 hover:text-amber-600 hover:bg-amber-50",
    btn:     "bg-amber-500 hover:bg-amber-600 text-white",
    outline: "border border-amber-400 text-amber-600 hover:bg-amber-50",
  },
  green: {
    tab:     "bg-green-600 text-white",
    tabOff:  "text-gray-600 hover:text-green-600 hover:bg-green-50",
    btn:     "bg-green-600 hover:bg-green-700 text-white",
    outline: "border border-green-400 text-green-600 hover:bg-green-50",
  },
};

// ── Truncation helper ─────────────────────────────────────────────────────────
function truncate(str, len) {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const CityPageManager = () => {
  const [activeCategory, setActiveCategory] = useState("Flowers");
  const [cities,         setCities]         = useState([]);
  const [loading,        setLoading]        = useState(false);

  // Bulk upload state
  const [bulkInput,      setBulkInput]      = useState("");
  const [bulkResult,     setBulkResult]     = useState(null);
  const [bulkLoading,    setBulkLoading]    = useState(false);
  const [uploadOpen,     setUploadOpen]     = useState(false);

  // Modal state
  const [editingCity,    setEditingCity]    = useState(null);

  // Derive accent config for active category
  const categoryMeta = CATEGORIES.find((c) => c.key === activeCategory);
  const accent       = ACCENT[categoryMeta.accent];

  // ── Load cities ────────────────────────────────────────────────────────────
  const loadCities = useCallback(async (cat) => {
    setLoading(true);
    try {
      const res = await getCities(cat);
      setCities(res.data || []);
    } catch (err) {
      console.error("loadCities error", err);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities(activeCategory);
    setBulkResult(null);
    setBulkInput("");
  }, [activeCategory, loadCities]);

  // ── Tab change ─────────────────────────────────────────────────────────────
  const handleTabChange = (cat) => {
    setActiveCategory(cat);
    setEditingCity(null);
  };

  // ── Bulk add ───────────────────────────────────────────────────────────────
  const handleBulkAdd = async () => {
    const cityNames = bulkInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (cityNames.length === 0) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await addCitiesBulk(activeCategory, cityNames);
      const { added = [], skipped = [], errors = [] } = res.data;
      setBulkResult({ added, skipped, errors });
      if (added.length > 0) {
        await loadCities(activeCategory);
      }
      setBulkInput("");
    } catch (err) {
      setBulkResult({ error: err?.response?.data?.message || "Failed to add cities" });
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (city) => {
    if (!window.confirm(`Delete "${city.cityName}" from ${city.category}?`)) return;
    try {
      await deleteCity(city._id);
      setCities((prev) => prev.filter((c) => c._id !== city._id));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // ── Save from modal ────────────────────────────────────────────────────────
  const handleSave = async (id, formData) => {
    try {
      await updateCity(id, formData);
      await loadCities(activeCategory);
      setEditingCity(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">City Page SEO</h1>
        <p className="text-sm text-gray-500 mt-1">Manage SEO meta tags, footer content, and FAQ schema for city landing pages.</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6">
        {CATEGORIES.map((cat) => {
          const a = ACCENT[cat.accent];
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleTabChange(cat.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm
                ${isActive ? a.tab : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 " + a.tabOff}`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          onClick={() => setUploadOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Upload City List</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${uploadOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {uploadOpen && (
          <div className="px-5 pb-5 space-y-3 border-t border-gray-100">
            <textarea
              rows={3}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Enter cities: Bangalore, Mumbai, New Delhi, Vidya Nagar"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-y"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={handleBulkAdd}
                disabled={bulkLoading || !bulkInput.trim()}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${accent.btn}`}
              >
                {bulkLoading ? "Adding…" : "Add Cities"}
              </button>

              {bulkResult && !bulkResult.error && (
                <p className="text-sm text-gray-600">
                  {bulkResult.added.length > 0 && (
                    <span className="text-green-600 font-medium">✅ {bulkResult.added.length} added</span>
                  )}
                  {bulkResult.skipped.length > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">⚠ {bulkResult.skipped.length} already exist</span>
                  )}
                  {bulkResult.errors.length > 0 && (
                    <span className="ml-2 text-red-600 font-medium">❌ {bulkResult.errors.length} errors</span>
                  )}
                </p>
              )}
              {bulkResult?.error && (
                <p className="text-sm text-red-600">{bulkResult.error}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* City table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : cities.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No cities added for {activeCategory} yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Page</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-56">URL</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Meta Title</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Meta Description</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cities.map((city) => (
                    <tr key={city._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-gray-800 whitespace-nowrap">
                        {city.cityName}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-gray-500 break-all">{city.url}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs">
                        <span title={city.metaTitle}>{truncate(city.metaTitle, 60)}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-sm">
                        <span title={city.metaDescription}>{truncate(city.metaDescription, 80)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingCity(city)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${accent.outline}`}
                          >
                            Edit SEO
                          </button>
                          <button
                            onClick={() => handleDelete(city)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            aria-label="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {cities.length} {cities.length === 1 ? "city" : "cities"}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingCity && (
        <CityModal
          city={editingCity}
          onClose={() => setEditingCity(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CityPageManager;
