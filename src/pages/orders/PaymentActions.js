import React, { useState } from "react";
import { Copy, Check, MessageCircle, RefreshCw, Link2, BadgeCheck } from "lucide-react";
import { createPaymentLink, refreshPayment, markOrderPaid } from "../../service/manualOrder";

const PAY_CHANNELS = ["UPI", "Bank transfer", "Cash", "Card machine", "Other"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }) : "");

const waShare = (phone, order) => {
  const digits = String(phone || "").replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  const text = `Hi! Here is the secure payment link for your RedHeart order ${order.orderId} (${inr(order.totalPrice)}):\n${order.paymentLinkUrl}\n\nThe link is valid for 3 days. Thank you!`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
};

// Payment controls for a staff-created order that is still waiting for money.
// `onUpdated(orderFields)` receives the refreshed order after any action.
const PaymentActions = ({ order, phone, onUpdated, initialError = "" }) => {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(initialError ? { type: "error", text: initialError } : null);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [channel, setChannel] = useState("UPI");
  const [reference, setReference] = useState("");

  if (order.source !== "manual" || order.paymentStatus !== "PENDING") return null;
  const hasLink = !!order.paymentLinkUrl && order.paymentLinkStatus === "created";
  const linkGone = !!order.paymentLinkUrl && ["expired", "cancelled"].includes(order.paymentLinkStatus);

  const run = async (name, fn) => {
    setBusy(name); setMsg(null);
    try { await fn(); } catch (err) { setMsg({ type: "error", text: apiMessage(err, "Something went wrong. Try again.") }); }
    setBusy("");
  };

  const makeLink = () => run("link", async () => {
    const r = await createPaymentLink(order.orderId);
    onUpdated(r.data.order);
    setMsg({ type: "ok", text: "Payment link ready." });
  });
  const check = () => run("check", async () => {
    const r = await refreshPayment(order.orderId);
    onUpdated(r.data);
    setMsg(r.paid ? { type: "ok", text: "Payment received. The order is now marked paid." }
      : { type: "info", text: r.status === "expired" ? "The link has expired. Create a new one." : r.status === "cancelled" ? "The link was cancelled." : "Not paid yet." });
  });
  const markPaid = () => run("paid", async () => {
    if (!window.confirm(`Mark this order as paid (${channel}) for ${inr(order.totalPrice)}? The payment link will stop working.`)) return;
    const r = await markOrderPaid(order.orderId, { channel, reference });
    onUpdated(r.data);
    setPaying(false);
  });
  const copy = () => { navigator.clipboard?.writeText(order.paymentLinkUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const btn = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-50";
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Awaiting payment · {inr(order.totalPrice)}</span>
        {hasLink && order.paymentLinkExpiresAt && <span className="text-[11px] text-gray-500">link valid till {fmtDateTime(order.paymentLinkExpiresAt)}</span>}
        {linkGone && <span className="text-[11px] text-red-600">link {order.paymentLinkStatus}</span>}
      </div>

      {hasLink && (
        <div className="mt-2 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <a href={order.paymentLinkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate">{order.paymentLinkUrl}</a>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {hasLink && (
          <>
            <button onClick={copy} className={`${btn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy link"}
            </button>
            <a href={waShare(phone, order)} target="_blank" rel="noopener noreferrer" className={`${btn} border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}>
              <MessageCircle className="w-3.5 h-3.5" /> Send on WhatsApp
            </a>
          </>
        )}
        {order.paymentLinkUrl && (
          <button disabled={!!busy} onClick={check} className={`${btn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
            <RefreshCw className={`w-3.5 h-3.5 ${busy === "check" ? "animate-spin" : ""}`} /> Check payment
          </button>
        )}
        <button disabled={!!busy} onClick={makeLink} className={`${btn} border-rose-200 bg-white text-rose-600 hover:bg-rose-50`}>
          <Link2 className="w-3.5 h-3.5" /> {order.paymentLinkUrl ? "New link" : "Create payment link"}
        </button>
        <button disabled={!!busy} onClick={() => setPaying((v) => !v)} className={`${btn} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
          <BadgeCheck className="w-3.5 h-3.5" /> Mark as paid
        </button>
      </div>

      {paying && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <div>
            <label htmlFor={`ch-${order.orderId}`} className="block text-[11px] font-semibold text-gray-600 mb-1">Received by</label>
            <select id={`ch-${order.orderId}`} value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              {PAY_CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`rf-${order.orderId}`} className="block text-[11px] font-semibold text-gray-600 mb-1">Reference / UTR (optional)</label>
            <input id={`rf-${order.orderId}`} value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <button disabled={!!busy} onClick={markPaid} className="px-3 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50">
            {busy === "paid" ? "Saving…" : "Confirm paid"}
          </button>
        </div>
      )}

      {msg && <p className={`mt-2 text-xs ${msg.type === "error" ? "text-red-600" : msg.type === "ok" ? "text-green-700" : "text-gray-600"}`}>{msg.text}</p>}
    </div>
  );
};

export default PaymentActions;
