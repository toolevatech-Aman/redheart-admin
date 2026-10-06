import React, { useEffect, useState } from "react";
import { Truck, RefreshCw, Trash2, Pencil } from "lucide-react";
import {
  fetchDeliverySurcharges, fetchDeliveryInsights, saveDeliverySurchargesBulk,
  saveDeliverySurcharge, removeDeliverySurcharge,
} from "../../service/deliverySurcharge";

const EMPTY = { pinCode: "", amount: "", note: "", isActive: true };
const parsePins = (text) => [...new Set(text.split(/[\s,;]+/).map((t) => t.trim().toUpperCase()).filter(Boolean))];
const isValidPin = (t) => t === "ALL" || /^\d{6}$/.test(t);
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const DeliverySurchargePage = () => {
  const [rows, setRows] = useState([]);
  const [insights, setInsights] = useState([]);
  const [baseline, setBaseline] = useState(49);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, i] = await Promise.all([fetchDeliverySurcharges(), fetchDeliveryInsights()]);
      setRows(r.success ? r.data : []);
      setInsights(i.success ? i.data : []);
      if (i.baseline) setBaseline(i.baseline);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching delivery surcharges");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const ruleFor = (pin) => rows.find((r) => r.pinCode === pin);

  const handleSave = async (e) => {
    e.preventDefault();
    const pins = parsePins(form.pinCode);
    if (!pins.length) return alert("Enter at least one pin code, or ALL");
    const invalid = pins.filter((t) => !isValidPin(t));
    if (invalid.length) return alert(`These aren't valid 6-digit pin codes: ${invalid.slice(0, 5).join(", ")}${invalid.length > 5 ? "…" : ""}`);
    const amt = Number(form.amount);
    if (form.amount === "" || !Number.isFinite(amt) || amt < 0) return alert("Enter the extra delivery amount in ₹");
    if (pins.includes("ALL") && !window.confirm(`This adds ${inr(amt)} to the delivery charge on EVERY order, on top of any pin code's own surcharge. Continue?`)) return;
    setSaving(true);
    try {
      if (editing) await saveDeliverySurcharge(pins[0], { amount: amt, note: form.note, isActive: form.isActive });
      else await saveDeliverySurchargesBulk({ pinCodes: pins, amount: amt, note: form.note, isActive: form.isActive });
      setForm(EMPTY);
      setEditing(false);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save delivery surcharge");
    }
    setSaving(false);
  };

  const handleEdit = (r) => {
    setForm({ pinCode: r.pinCode, amount: String(r.amount), note: r.note || "", isActive: r.isActive });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (r) => {
    try { await saveDeliverySurcharge(r.pinCode, { amount: r.amount, note: r.note, isActive: !r.isActive }); await load(); }
    catch { alert("Failed to update status"); }
  };

  const handleDelete = async (r) => {
    const msg = r.pinCode === "ALL"
      ? "Remove the sitewide delivery surcharge? It stops applying to all orders immediately."
      : `Remove the delivery surcharge for pin code ${r.pinCode}?`;
    if (!window.confirm(msg)) return;
    try { await removeDeliverySurcharge(r.pinCode); await load(); }
    catch { alert("Failed to remove delivery surcharge"); }
  };

  const applySuggestion = (i) => {
    setForm({ pinCode: i.pinCode, amount: String(i.suggestedSurcharge), note: "", isActive: true });
    setEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sorted = [...rows].sort((a, b) => (a.pinCode === "ALL" ? -1 : b.pinCode === "ALL" ? 1 : 0));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-rose-500" /> Delivery Surcharge
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Extra delivery charge (flat ₹) for pin codes that cost more to deliver to. A pin code's own rule and the ALL rule add together. Shown at checkout with a note.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Pin codes (many allowed) or ALL</label>
          <textarea
            value={form.pinCode}
            onChange={(e) => set("pinCode", e.target.value)}
            disabled={editing}
            rows={3}
            placeholder={"335526, 486889\n(comma, space or new line)  —  or type ALL for every pin code"}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-gray-50"
          />
          {!editing && form.pinCode.trim() && (
            <p className="text-[11px] text-gray-400 mt-1">{parsePins(form.pinCode).length} entr{parsePins(form.pinCode).length === 1 ? "y" : "ies"}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Extra delivery charge (₹)</label>
          <input
            type="number" min="0" max="5000" step="any"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="e.g. 100"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Note shown to the customer (optional)</label>
          <input
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Leave blank for the default: delivery to this location costs more"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <div className="md:col-span-4 flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Active
          </label>
          <div className="flex gap-2">
            {(editing || form.pinCode) && (
              <button type="button" onClick={() => { setForm(EMPTY); setEditing(false); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                {editing ? "Cancel" : "Clear"}
              </button>
            )}
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving…" : editing ? "Update surcharge" : "Add surcharge"}
            </button>
          </div>
        </div>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <h3 className="text-sm font-bold text-gray-800 mb-2">Active rules</h3>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {loading && !rows.length ? (
          <p className="text-center py-10 text-gray-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No delivery surcharges yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Pin code</th>
                  <th className="px-5 py-3">Extra delivery</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.pinCode} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-bold text-gray-800">
                      {r.pinCode === "ALL" ? <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">ALL PIN CODES</span> : r.pinCode}
                    </td>
                    <td className="px-5 py-3 text-gray-700">+ {inr(r.amount)}</td>
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

      <h3 className="text-sm font-bold text-gray-800 mb-1">What vendors have charged us per pin code</h3>
      <p className="text-xs text-gray-400 mb-2">
        From delivered orders where a vendor's delivery cost was recorded. Suggested = average vendor delivery cost minus the standard {inr(baseline)} delivery fee.
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {insights.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No vendor delivery-cost history yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Pin code</th>
                  <th className="px-5 py-3">Delivered orders</th>
                  <th className="px-5 py-3">Avg vendor delivery cost</th>
                  <th className="px-5 py-3">Suggested surcharge</th>
                  <th className="px-5 py-3">Your rule</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {insights.map((i) => {
                  const rule = ruleFor(i.pinCode);
                  return (
                    <tr key={i.pinCode} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono font-bold text-gray-800">{i.pinCode}</td>
                      <td className="px-5 py-3 text-gray-600">{i.deliveredOrders}</td>
                      <td className="px-5 py-3 text-gray-600">{inr(i.avgVendorDeliveryCost)}</td>
                      <td className="px-5 py-3 text-gray-600">{i.suggestedSurcharge > 0 ? `+ ${inr(i.suggestedSurcharge)}` : "—"}</td>
                      <td className="px-5 py-3 text-gray-600">{rule ? `+ ${inr(rule.amount)}${rule.isActive ? "" : " (off)"}` : "—"}</td>
                      <td className="px-5 py-3">
                        {i.suggestedSurcharge > 0 && (
                          <button onClick={() => applySuggestion(i)} className="text-xs font-semibold text-rose-600 hover:underline">Use suggestion</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverySurchargePage;
