import React, { useEffect, useState } from "react";
import { MapPin, RefreshCw, Trash2, Pencil } from "lucide-react";
import { fetchSurcharges, saveSurcharge, removeSurcharge } from "../../service/pincodeSurcharge";

const EMPTY = { pinCode: "", value: "", note: "", isActive: true };

const PincodeSurchargePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSurcharges();
      setRows(res.success ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching pin code surcharges");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    const pin = form.pinCode.trim();
    if (!/^\d{6}$/.test(pin)) return alert("Enter a valid 6-digit pin code");
    const pct = Number(form.value);
    if (!Number.isFinite(pct) || pct <= 0) return alert("Enter a surcharge percentage greater than 0");
    setSaving(true);
    try {
      await saveSurcharge(pin, { type: "percent", value: pct, note: form.note, isActive: form.isActive });
      setForm(EMPTY);
      setEditing(false);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save surcharge");
    }
    setSaving(false);
  };

  const handleEdit = (r) => {
    setForm({ pinCode: r.pinCode, value: String(r.value), note: r.note || "", isActive: r.isActive });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (r) => {
    try {
      await saveSurcharge(r.pinCode, { type: r.type, value: r.value, note: r.note, isActive: !r.isActive });
      await load();
    } catch (err) { alert("Failed to update status"); }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Remove the surcharge for pin code ${r.pinCode}?`)) return;
    try { await removeSurcharge(r.pinCode); await load(); }
    catch (err) { alert("Failed to remove surcharge"); }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-500" /> Pin Code Surcharge
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Add a % on the product value for remote pin codes where products cost more. Shown at checkout with a note to the customer.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Pin code</label>
          <input
            value={form.pinCode}
            onChange={(e) => set("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={editing}
            placeholder="e.g. 194101"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Surcharge on product value (%)</label>
          <input
            type="number" min="0" max="500" step="any"
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="e.g. 100 (doubles the price)"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Note shown to the customer (optional)</label>
          <input
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Leave blank for the default: products cost more here because they are not readily available"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <div className="md:col-span-4 flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Active
          </label>
          <div className="flex gap-2">
            {editing && (
              <button type="button" onClick={() => { setForm(EMPTY); setEditing(false); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            )}
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving…" : editing ? "Update surcharge" : "Add surcharge"}
            </button>
          </div>
        </div>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && !rows.length ? (
          <p className="text-center py-12 text-gray-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No pin code surcharges yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Pin code</th>
                  <th className="px-5 py-3">Surcharge</th>
                  <th className="px-5 py-3">Example (₹1,500 product)</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.pinCode} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-bold text-gray-800">{r.pinCode}</td>
                    <td className="px-5 py-3 text-gray-700">{r.type === "flat" ? `₹${r.value}` : `${r.value}%`}</td>
                    <td className="px-5 py-3 text-gray-500">
                      ₹{(r.type === "flat" ? 1500 + r.value : Math.round(1500 + (1500 * r.value) / 100)).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-[260px] truncate" title={r.note}>{r.note || "Default note"}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleToggle(r)} className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(r)} title="Edit" className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(r)} title="Remove" className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PincodeSurchargePage;
