import React, { useState } from "react";
import { exportForEdit } from "../../service/bulkService";
import UploadWizard from "./UploadWizard";

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

export default function EditWizard({ category }) {
  const [phase, setPhase]       = useState("export"); // "export" | "upload"
  const [filters, setFilters]   = useState({ subcategory_name: "", type: "", search: "" });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const meta = CATEGORY_META[category] || CATEGORY_META.Flowers;

  const handleExport = async () => {
    setExporting(true); setExportError("");
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      await exportForEdit(category, clean);
    } catch (e) {
      setExportError(e.message || "Export failed");
    } finally { setExporting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 ${meta.light} ${meta.border} border-2`}>
        <h1 className="text-2xl font-bold text-gray-800">{meta.emoji} {category} — Bulk Edit</h1>
        <p className="text-sm text-gray-500 mt-1">
          Step 1: Export existing products → Step 2: Edit the file → Step 3: Re-upload.
          Only changed fields will be updated (matched by SKU).
        </p>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[["export","⬇ Step 1 — Export"], ["upload","⬆ Step 2 — Re-Upload"]].map(([v,l]) => (
          <button key={v} onClick={() => setPhase(v)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${phase === v ? `${meta.accent} text-white shadow` : "text-gray-600 hover:text-gray-800"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Phase: Export ─────────────────────────────────────────────── */}
      {phase === "export" && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-700">Filter products to export</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subcategory</label>
              <select value={filters.subcategory_name}
                onChange={e => setFilters(p => ({ ...p, subcategory_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="">All subcategories</option>
                {(SUBCATEGORIES[category] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={filters.type}
                onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="">All types</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search by name / SKU</label>
              <input value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                placeholder="Search…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
          </div>

          {exportError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">❌ {exportError}</p>
          )}

          <div className="flex items-center gap-3">
            <button onClick={handleExport} disabled={exporting}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white ${meta.accent} disabled:opacity-50`}>
              {exporting ? "Exporting…" : "⬇ Export for Edit (.xlsx)"}
            </button>
            <button onClick={() => setPhase("upload")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Skip → Go to Upload
            </button>
          </div>

          <div className={`rounded-xl p-4 ${meta.light} border ${meta.border} text-sm text-gray-600`}>
            <strong>How it works:</strong>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Click "Export for Edit" to download existing products as XLSX.</li>
              <li>Edit the file — modify any optional columns. <strong>Do not change the SKU.</strong></li>
              <li>Switch to "Step 2 — Re-Upload" and upload the edited file.</li>
              <li>Each row is matched by SKU and updated in the database.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── Phase: Re-upload ──────────────────────────────────────────── */}
      {phase === "upload" && (
        <UploadWizard category={category} mode="edit" />
      )}
    </div>
  );
}
