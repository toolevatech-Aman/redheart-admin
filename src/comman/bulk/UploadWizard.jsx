import React, { useState, useRef } from "react";
import { uploadAndValidate, confirmImport, downloadErrorReport, downloadTemplate } from "../../service/bulkService";
import ImportHistory from "./ImportHistory";

const STEPS = ["Upload File", "Validation Preview", "Confirm", "Result"];

const CATEGORY_META = {
  Flowers: { emoji: "🌸", color: "red",   accent: "bg-red-600",   light: "bg-red-50",   border: "border-red-200" },
  Cakes:   { emoji: "🎂", color: "amber", accent: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200" },
  Plants:  { emoji: "🌿", color: "green", accent: "bg-green-600", light: "bg-green-50", border: "border-green-200" },
};

export default function UploadWizard({ category, mode = "upload" }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);   // { jobId, summary, errors, canProceed }
  const [result, setResult] = useState(null);     // { inserted, updated, failed, total }
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef();
  const meta = CATEGORY_META[category] || CATEGORY_META.Flowers;

  const resetAll = () => { setStep(0); setFile(null); setPreview(null); setResult(null); setError(""); };

  // ── Step 1: Upload & validate ─────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return setError("Please select a file.");
    setLoading(true); setError("");
    try {
      const data = await uploadAndValidate(category, file);
      setPreview(data);
      setStep(1);
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Upload failed";
      const missing = e.response?.data?.missing;
      setError(missing ? `${msg} — Missing columns: ${missing.join(", ")}` : msg);
    } finally { setLoading(false); }
  };

  // ── Step 2: Confirm import ────────────────────────────────────────────────
  const handleConfirm = async () => {
    setLoading(true); setError("");
    try {
      const data = await confirmImport(preview.jobId);
      setResult(data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Confirm failed");
    } finally { setLoading(false); }
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 ${meta.light} ${meta.border} border-2`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {meta.emoji} {category} {mode === "edit" ? "Bulk Edit Upload" : "Bulk Upload"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload a <span className="font-medium">.xlsx</span> or <span className="font-medium">.csv</span> file.
              Mandatory fields are highlighted yellow in the template.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadTemplate(category)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              ⬇ Download Template
            </button>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              🕓 History
            </button>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${i === step ? `${meta.accent} text-white shadow` : i < step ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"}`}>
              <span className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">{i + 1}</span>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-gray-400" : "bg-gray-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-start gap-2">
          <span>❌</span><span>{error}</span>
        </div>
      )}

      {/* ── STEP 0: File drop ──────────────────────────────────────────── */}
      {step === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center space-y-4 hover:border-gray-400 transition"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{ background: dragging ? "#f9f9f9" : undefined }}
        >
          <div className="text-5xl">{meta.emoji}</div>
          <p className="text-gray-600 font-medium">
            {file ? `✅ Selected: ${file.name}` : "Drag & drop your file here, or click to browse"}
          </p>
          <p className="text-xs text-gray-400">Supported: .xlsx, .csv · Max 20 MB</p>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
            onChange={e => setFile(e.target.files[0])} />
          <div className="flex justify-center gap-3">
            <button onClick={() => inputRef.current.click()}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Browse File
            </button>
            <button onClick={handleUpload} disabled={!file || loading}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white ${meta.accent} disabled:opacity-50`}>
              {loading ? "Validating…" : "Upload & Validate"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Validation preview ─────────────────────────────────── */}
      {step === 1 && preview && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Rows",   value: preview.summary.total,   color: "text-gray-800" },
              { label: "✅ Valid",      value: preview.summary.valid,   color: "text-green-600" },
              { label: "❌ Invalid",   value: preview.summary.invalid, color: "text-red-600" },
              { label: "Pass Rate",    value: preview.summary.passRate, color: "text-blue-600" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-500 mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Error table */}
          {preview.errors?.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-red-50 border-b border-red-200">
                <h3 className="font-semibold text-red-700 text-sm">Row Errors (preview — first 100)</h3>
                {preview.jobId && (
                  <button onClick={() => downloadErrorReport(preview.jobId)}
                    className="text-xs text-red-600 underline hover:text-red-800">
                    ⬇ Download Full Error Report
                  </button>
                )}
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold border-b">Row</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold border-b">SKU</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold border-b">Name</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold border-b">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.errors.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-red-50"}>
                        <td className="px-3 py-2 text-gray-500">{r.rowNum}</td>
                        <td className="px-3 py-2 font-mono text-gray-700">{r.data?.sku || "—"}</td>
                        <td className="px-3 py-2 text-gray-700 max-w-xs truncate">{r.data?.name || "—"}</td>
                        <td className="px-3 py-2 text-red-600">
                          {r.errors.map((e, ei) => <div key={ei}>• {e.message}</div>)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={resetAll} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              ← Start Over
            </button>
            {preview.canProceed ? (
              <button onClick={() => setStep(2)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white ${meta.accent}`}>
                Continue with {preview.summary.valid} valid rows →
              </button>
            ) : (
              <p className="text-sm text-red-600 self-center">No valid rows — fix errors and re-upload.</p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Confirm ────────────────────────────────────────────── */}
      {step === 2 && preview && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
          <div className="text-5xl">📋</div>
          <h2 className="text-xl font-bold text-gray-800">Ready to Import</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            <span className="font-bold text-green-600">{preview.summary.valid} valid rows</span> will be written to the database.
            {preview.summary.invalid > 0 && (
              <> <span className="text-red-500">{preview.summary.invalid} invalid rows</span> will be skipped.</>
            )}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={handleConfirm} disabled={loading}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold text-white ${meta.accent} disabled:opacity-50`}>
              {loading ? "Importing…" : "✅ Confirm Import"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Result ─────────────────────────────────────────────── */}
      {step === 3 && result && (
        <div className="bg-white border border-green-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-gray-800">Import Complete!</h2>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">{result.inserted}</p>
              <p className="text-xs text-gray-500">New Products</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
              <p className="text-xs text-gray-500">Updated</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-500">{result.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>
          <button onClick={resetAll}
            className={`mt-4 px-8 py-2.5 rounded-lg text-sm font-bold text-white ${meta.accent}`}>
            Upload More
          </button>
        </div>
      )}

      {/* Import History panel */}
      {showHistory && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Import History — {category}</h3>
            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <ImportHistory category={category} />
        </div>
      )}
    </div>
  );
}
