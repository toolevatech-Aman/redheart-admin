import React, { useState } from "react";
import { exportProducts } from "../../service/bulkService";

const CATEGORY_META = {
  Flowers: { emoji: "🌸", accent: "bg-red-600",   light: "bg-red-50",   border: "border-red-200" },
  Cakes:   { emoji: "🎂", accent: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200" },
  Plants:  { emoji: "🌿", accent: "bg-green-600", light: "bg-green-50", border: "border-green-200" },
};

const SUBCATEGORIES = {
  Flowers: ["Roses","Lillies","Carnation","Roses and Carnation","Roses and Lily"],
  Cakes:   ["Black Forest Cakes","Chocolate Cakes","Red Velvet Cakes","Ferrero Rocher Cakes","Pinata cake"],
  Plants:  ["Snake Plant","Money Plant","Jade Plant","Peace Lily Plant","Syngonium","Bonsai"],
};

const TYPES = ["Hot Pick","Best Seller","New Arrival","Bouquet"];

export default function ExportPanel({ category }) {
  const [filters, setFilters]   = useState({ subcategory_name: "", type: "", search: "", is_active: "", is_featured: "" });
  const [format, setFormat]     = useState("xlsx");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const meta = CATEGORY_META[category] || CATEGORY_META.Flowers;

  const handleExport = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      await exportProducts(category, clean, format);
      setSuccess(`✅ ${category} products exported as .${format}`);
    } catch (e) {
      setError(e.message || "Export failed");
    } finally { setLoading(false); }
  };

  const F = ({ label, children }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );

  const selectClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 ${meta.light} ${meta.border} border-2`}>
        <h1 className="text-2xl font-bold text-gray-800">{meta.emoji} {category} — Export Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Filter and export {category.toLowerCase()} products as XLSX or CSV.
          All schema fields including empty ones are included as columns.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-700">Export Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <F label="Subcategory">
            <select value={filters.subcategory_name}
              onChange={e => setFilters(p => ({ ...p, subcategory_name: e.target.value }))}
              className={selectClass}>
              <option value="">All subcategories</option>
              {(SUBCATEGORIES[category] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </F>
          <F label="Type">
            <select value={filters.type}
              onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
              className={selectClass}>
              <option value="">All types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </F>
          <F label="Search by name / SKU">
            <input value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Search…" className={selectClass} />
          </F>
          <F label="Status">
            <select value={filters.is_active}
              onChange={e => setFilters(p => ({ ...p, is_active: e.target.value }))}
              className={selectClass}>
              <option value="">All (active + hidden)</option>
              <option value="true">Active only</option>
              <option value="false">Hidden only</option>
            </select>
          </F>
          <F label="Featured">
            <select value={filters.is_featured}
              onChange={e => setFilters(p => ({ ...p, is_featured: e.target.value }))}
              className={selectClass}>
              <option value="">All</option>
              <option value="true">Featured only</option>
              <option value="false">Non-featured only</option>
            </select>
          </F>
          <F label="Export Format">
            <div className="flex gap-3 mt-1">
              {["xlsx","csv"].map(f => (
                <label key={f} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-semibold transition-all
                  ${format === f ? `${meta.accent} text-white border-transparent` : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  <input type="radio" value={f} checked={format === f} onChange={() => setFormat(f)} className="hidden" />
                  {f === "xlsx" ? "📊 XLSX" : "📄 CSV"}
                </label>
              ))}
            </div>
          </F>
        </div>

        {error   && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">❌ {error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2">{success}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleExport} disabled={loading}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold text-white ${meta.accent} disabled:opacity-50`}>
            {loading ? "Exporting…" : `⬇ Export ${format.toUpperCase()}`}
          </button>
          <button onClick={() => setFilters({ subcategory_name:"",type:"",search:"",is_active:"",is_featured:"" })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Clear Filters
          </button>
        </div>
      </div>

      {/* What gets exported */}
      <div className={`rounded-xl p-4 ${meta.light} border ${meta.border} text-sm text-gray-600`}>
        <strong>Export includes all columns:</strong> name, sku, quantity, costing_price, original_price, selling_price,
        description, short_summary, categorization fields, product_attributes, media URLs, care &amp; logistics,
        availability flags — plus _id, product_id, slug for reference.
      </div>
    </div>
  );
}
