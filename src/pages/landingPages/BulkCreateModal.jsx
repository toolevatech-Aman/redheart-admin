import React, { useState } from "react";
import { bulkCreateLandingPages } from "../../service/landingPageService";

const BulkCreateModal = ({ onClose, onCreated }) => {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const keywords = text.split("\n").map((k) => k.trim()).filter(Boolean);

  const handleCreate = async () => {
    if (keywords.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await bulkCreateLandingPages(keywords);
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Bulk create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Bulk-Create Landing Pages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-3">
            One keyword per line. Each becomes a draft landing page (search = that keyword, no filters yet, inactive)
            — open each one afterward to refine filters, write SEO content, and activate it.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={"1 HP water pump\nA4 80 GSM copier paper\nheavy duty floor cleaner"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
          />
          <p className="text-xs text-gray-400 mt-1">{keywords.length} keyword{keywords.length === 1 ? "" : "s"}</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || keywords.length === 0}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Pages"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateModal;
