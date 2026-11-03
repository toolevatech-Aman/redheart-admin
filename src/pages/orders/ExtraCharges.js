import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { addExtraCharge, removeExtraCharge } from "../../service/order";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;
const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }) : "");

// Money the customer paid on top of the order (not recorded when it was placed).
// Adding it raises the order total, so revenue and analytics include it.
// `onUpdated({ totalPrice, extraAmount, extraCharges })` gets the new figures.
const ExtraCharges = ({ order, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const charges = order.extraCharges || [];
  const canAdd = !["PENDING", "FAILED"].includes(order.paymentStatus) && order.orderStatus !== "Cancelled";

  const apply = (r) => onUpdated({ orderId: order.orderId, totalPrice: r.data.totalPrice, extraAmount: r.data.extraAmount, extraCharges: r.data.extraCharges });

  const add = async () => {
    setError("");
    const n = Number(amount);
    if (!(n > 0)) return setError("Enter the amount received");
    if (!reason.trim()) return setError("Add a short reason");
    if (!window.confirm(`Add ${inr(n)} to this order? The order total becomes ${inr(Number(order.totalPrice || 0) + n)}.`)) return;
    setBusy(true);
    try {
      apply(await addExtraCharge(order.orderId, { amount: n, reason: reason.trim() }));
      setAmount(""); setReason(""); setOpen(false);
    } catch (err) { setError(apiMessage(err, "Could not add. Try again.")); }
    setBusy(false);
  };

  const remove = async (c) => {
    if (!window.confirm(`Remove the extra ${inr(c.amount)} (${c.reason || "no reason"})? The order total goes down by that amount.`)) return;
    setBusy(true); setError("");
    try { apply(await removeExtraCharge(order.orderId, c._id)); } catch (err) { setError(apiMessage(err, "Could not remove. Try again.")); }
    setBusy(false);
  };

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 text-sm">Extra amount received</h4>
        {canAdd && !open && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {charges.length === 0 && !open && <p className="text-xs text-gray-400 mt-1">Nothing added.{!canAdd ? " Available once the order is paid." : ""}</p>}

      {charges.map((c) => (
        <div key={c._id} className="flex items-center justify-between text-sm text-gray-600 mt-1.5">
          <span className="min-w-0">
            <span className="font-medium text-gray-800">+{inr(c.amount)}</span> · {c.reason}
            <span className="text-[11px] text-gray-400"> · {fmt(c.addedAt)}</span>
          </span>
          <button onClick={() => remove(c)} disabled={busy} title="Remove" className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}

      {open && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input type="number" min="1" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ₹"
            className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          <input type="text" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. extra delivery, add-on in cash)"
            className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={add} disabled={busy} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold disabled:opacity-50">{busy ? "Saving…" : "Add to order"}</button>
          <button onClick={() => { setOpen(false); setError(""); }} className="px-2 py-1.5 text-xs text-gray-500">Cancel</button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
};

export default ExtraCharges;
