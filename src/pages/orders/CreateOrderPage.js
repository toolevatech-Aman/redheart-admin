import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Trash2, UserPlus, Check, Copy, X, PackagePlus } from "lucide-react";
import PaymentActions from "./PaymentActions";
import {
  searchCustomers, fetchCustomer, createCustomer, searchProducts, previewManualOrder, createManualOrder,
} from "../../service/manualOrder";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const todayIst = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;

// Same delivery options and prices as the website's delivery picker.
const HOURS = ["10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00"];
const OPTIONS = [
  { id: "standard", title: "Standard delivery", price: 49, slots: ["9:00 - 13:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 21:00", "20:00 - 22:00"] },
  { id: "express", title: "30-60 min express", price: 69, slots: ["30-60 Minutes from order"] },
  { id: "fixed", title: "Fixed time delivery", price: 199, slots: HOURS },
  { id: "midnight", title: "Midnight delivery", price: 249, slots: ["23:00 - 00:00"] },
  { id: "courier", title: "Courier / other", price: 0, slots: ["Courier delivery"] },
];
const CHANNELS = ["Phone call", "WhatsApp", "Instagram", "Walk-in", "Other"];
const PAY_CHANNELS = ["UPI", "Bank transfer", "Cash", "Card machine", "Other"];
const EMPTY_ADDR = { firstName: "", lastName: "", street: "", city: "", state: "", postalCode: "", phone: "" };

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400 bg-white";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

// A label wired to its control (for screen readers and clicking the label).
const Field = ({ label, className, children }) => {
  const id = React.useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>{label}</label>
      {React.cloneElement(children, { id })}
    </div>
  );
};

const Section = ({ n, title, children, hint }) => (
  <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-4">
    <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] flex items-center justify-center">{n}</span>{title}
    </h3>
    {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}
    <div className={hint ? "" : "mt-3"}>{children}</div>
  </section>
);

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [customer, setCustomer] = useState(null);
  const [custQuery, setCustQuery] = useState("");
  const [custResults, setCustResults] = useState([]);
  const [newCust, setNewCust] = useState(null); // { name, phone, email } while the quick form is open
  const [custError, setCustError] = useState("");

  const [items, setItems] = useState([]);
  const [prodQuery, setProdQuery] = useState("");
  const [prodResults, setProdResults] = useState([]);

  const [addr, setAddr] = useState(EMPTY_ADDR);
  const [optionId, setOptionId] = useState("standard");
  const [slot, setSlot] = useState(OPTIONS[0].slots[0]);
  const [date, setDate] = useState(todayIst());
  const [shipping, setShipping] = useState("49");

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [waive, setWaive] = useState(false);

  const [payMode, setPayMode] = useState("PAYMENT_LINK");
  const [payChannel, setPayChannel] = useState("UPI");
  const [payRef, setPayRef] = useState("");
  const [orderChannel, setOrderChannel] = useState("WhatsApp");
  const [orderNote, setOrderNote] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewMsg, setPreviewMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [createdMeta, setCreatedMeta] = useState({ phone: "", linkError: "" });
  const [copied, setCopied] = useState(false);
  const token = useRef("");
  const newToken = () => { token.current = (window.crypto?.randomUUID?.() || `t-${Date.now()}-${Math.random().toString(36).slice(2)}`); };
  if (!token.current) newToken();

  const option = OPTIONS.find((o) => o.id === optionId);
  const setA = (k, v) => setAddr((a) => ({ ...a, [k]: v }));

  // ── customer: from ?customerId= (the Users page button) ──────────────────
  const customerIdParam = params.get("customerId");
  useEffect(() => {
    if (!customerIdParam) return;
    fetchCustomer(customerIdParam).then((r) => r.success && pickCustomer(r.data)).catch(() => setCustError("Could not load that customer"));
  }, [customerIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (customer || custQuery.trim().length < 2) { setCustResults([]); return undefined; }
    const t = setTimeout(() => { searchCustomers(custQuery.trim()).then((r) => setCustResults(r.data || [])).catch(() => setCustResults([])); }, 300);
    return () => clearTimeout(t);
  }, [custQuery, customer]);

  useEffect(() => {
    if (prodQuery.trim().length < 2) { setProdResults([]); return undefined; }
    const t = setTimeout(() => { searchProducts(prodQuery.trim()).then((r) => setProdResults(r.data || [])).catch(() => setProdResults([])); }, 300);
    return () => clearTimeout(t);
  }, [prodQuery]);

  function pickCustomer(c) {
    setCustomer(c); setCustQuery(""); setCustResults([]); setNewCust(null); setCustError("");
    const def = (c.addresses || []).find((a) => a.isDefault) || (c.addresses || [])[0];
    if (def) applyAddress(def);
    else setAddr((a) => ({ ...a, firstName: a.firstName || (c.name || "").split(" ")[0] || "", lastName: a.lastName || (c.name || "").split(" ").slice(1).join(" "), phone: a.phone || String(c.phone || "").replace(/\D/g, "").slice(-10) }));
  }
  function applyAddress(a) {
    setAddr({ firstName: a.firstName || "", lastName: a.lastName || "", street: a.street || "", city: a.city || "", state: a.state || "", postalCode: a.postalCode || "", phone: String(a.phone || "").replace(/\D/g, "").slice(-10) });
  }
  async function saveNewCustomer() {
    setCustError("");
    try {
      const r = await createCustomer(newCust);
      pickCustomer(r.data);
    } catch (err) { setCustError(apiMessage(err, "Could not add the customer")); }
  }

  // ── items ────────────────────────────────────────────────────────────────
  function addProduct(p) {
    const v = p.variations?.[0];
    setItems((list) => [...list, {
      key: `${p.product_id}-${Date.now()}`, product: p,
      variantId: v?._id || "", quantity: 1,
      price: String(v ? v.selling_price : p.selling_price), addOnQty: {},
    }]);
    setProdQuery(""); setProdResults([]);
  }
  const updateItem = (key, patch) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const chooseVariant = (it, variantId) => {
    const v = it.product.variations.find((x) => x._id === variantId);
    updateItem(it.key, { variantId, price: String(v ? v.selling_price : it.product.selling_price) });
  };

  // ── delivery ─────────────────────────────────────────────────────────────
  const chooseOption = (id) => {
    const o = OPTIONS.find((x) => x.id === id);
    setOptionId(id); setSlot(o.slots[0]); setShipping(String(o.price));
  };

  // ── payload + live preview (the server does all the maths) ──────────────
  const payload = useMemo(() => ({
    customerId: customer?.userId,
    items: items.map((i) => ({
      productId: i.variantId || i.product.product_id,
      quantity: Number(i.quantity), price: i.price,
      addOns: Object.entries(i.addOnQty).filter(([, q]) => Number(q) > 0).map(([id, q]) => ({ _id: id, quantity: Number(q) })),
    })),
    shippingAddress: addr, shippingCharges: shipping, deliveryDate: date, deliverySlot: slot,
    coupon, discount, discountReason, waiveSurcharges: waive,
  }), [customer, items, addr, shipping, date, slot, coupon, discount, discountReason, waive]);

  useEffect(() => {
    if (!customer || !items.length) { setPreview(null); setPreviewMsg(""); return undefined; }
    let live = true;
    const t = setTimeout(async () => {
      try {
        const r = await previewManualOrder(payload);
        if (live) { setPreview(r.data); setPreviewMsg(""); }
      } catch (err) { if (live) { setPreview(null); setPreviewMsg(apiMessage(err, "Could not price this order")); } }
    }, 500);
    return () => { live = false; clearTimeout(t); };
  }, [payload, customer, items.length]);

  async function submit() {
    setError("");
    if (!customer) return setError("Choose a customer first");
    if (!items.length) return setError("Add at least one product");
    if (payMode === "PAYMENT_LINK" && !window.confirm(`Create this order and a payment link for ${inr(preview?.total)}?`)) return;
    if (payMode === "COD" && !window.confirm(`Create this order as Cash on Delivery for ${inr(preview?.total)}?`)) return;
    if (payMode === "PAID_OFFLINE" && !window.confirm(`Mark this order as already PAID (${payChannel}) for ${inr(preview?.total)}?`)) return;
    setSaving(true);
    try {
      const r = await createManualOrder({
        ...payload, paymentMode: payMode, paymentChannel: payChannel, paymentReference: payRef,
        orderChannel, orderNote, adminNote, clientToken: token.current,
      });
      setCreatedMeta({ phone: customer?.phone || "", linkError: r.paymentLinkError || "" });
      setCreated(r.data);
    } catch (err) { setError(apiMessage(err, "Could not create the order")); }
    setSaving(false);
  }

  function reset() {
    setCustomer(null); setItems([]); setAddr(EMPTY_ADDR); chooseOption("standard"); setDate(todayIst());
    setCoupon(""); setDiscount(""); setDiscountReason(""); setWaive(false); setPayMode("PAYMENT_LINK"); setPayRef("");
    setOrderNote(""); setAdminNote(""); setPreview(null); setError(""); setCreated(null); setCreatedMeta({ phone: "", linkError: "" }); newToken();
    navigate("/orders/new", { replace: true });
  }

  // ── success screen ───────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="p-4 md:p-6 max-w-xl mx-auto">
        <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-gray-900">Order created</h2>
          <p className="mt-2 font-mono text-sm text-gray-800 flex items-center justify-center gap-2">
            {created.orderId}
            <button onClick={() => { navigator.clipboard?.writeText(created.orderId); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-gray-400 hover:text-gray-700" title="Copy order ID">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-1">{inr(created.totalPrice)} · {created.paymentStatus === "PAID" ? "Paid" : created.paymentStatus === "PENDING" ? "Awaiting payment" : "Cash on delivery"} · {created.cartItems?.length} item{created.cartItems?.length === 1 ? "" : "s"}</p>
          <div className="text-left">
            <PaymentActions order={created} phone={createdMeta.phone} initialError={createdMeta.linkError} onUpdated={(o) => setCreated((c) => ({ ...c, ...o }))} />
          </div>
          <div className="flex gap-2 justify-center mt-5">
            <button onClick={() => navigate("/orders")} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">View in Orders</button>
            <button onClick={reset} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">Create another order</button>
          </div>
        </div>
      </div>
    );
  }

  const canCreate = !!(customer && items.length && preview && !saving);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/orders")} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create order</h2>
          <p className="text-xs text-gray-400">For orders that come in by phone, WhatsApp or Instagram. Prices, surcharges and totals are worked out by the server.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* 1 · customer */}
          <Section n="1" title="Customer">
            {customer ? (
              <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{customer.name || "No name"}</p>
                  <p className="text-xs text-gray-500">{customer.phone} {customer.email && `· ${customer.email}`}</p>
                </div>
                <button onClick={() => setCustomer(null)} className="text-xs text-rose-600 hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Change</button>
              </div>
            ) : newCust ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Name"><input className={inputCls} value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} /></Field>
                <Field label="Phone (10 digits)"><input className={inputCls} value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} /></Field>
                <Field label="Email (optional)"><input className={inputCls} value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} /></Field>
                <div className="md:col-span-3 flex gap-2">
                  <button onClick={saveNewCustomer} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">Add customer</button>
                  <button onClick={() => setNewCust(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input className={`${inputCls} pl-9`} placeholder="Search by name, phone or email…" value={custQuery} onChange={(e) => setCustQuery(e.target.value)} />
                </div>
                {custResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                    {custResults.map((c) => (
                      <button key={c.userId} onClick={() => pickCustomer(c)} className="w-full text-left px-4 py-2.5 hover:bg-rose-50">
                        <p className="text-sm font-medium text-gray-900">{c.name || "No name"}</p>
                        <p className="text-xs text-gray-500">{c.phone} {c.email && `· ${c.email}`}</p>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setNewCust({ name: "", phone: custQuery.replace(/\D/g, "").length >= 10 ? custQuery : "", email: "" })}
                  className="mt-3 text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> New customer (name and phone)</button>
              </div>
            )}
            {custError && <p className="text-xs text-red-600 mt-2">{custError}</p>}
          </Section>

          {/* 2 · items */}
          <Section n="2" title="Products">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input className={`${inputCls} pl-9`} placeholder="Search products by name or SKU…" value={prodQuery} onChange={(e) => setProdQuery(e.target.value)} />
            </div>
            {prodResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                {prodResults.map((p) => (
                  <button key={p.product_id} onClick={() => addProduct(p)} className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-rose-50">
                    <img src={p.image} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-900 truncate">{p.name}</p><p className="text-xs text-gray-500">{p.category} · {p.sku}</p></div>
                    <span className="text-sm font-semibold text-gray-700">{inr(p.selling_price)}</span>
                    <PackagePlus className="w-4 h-4 text-rose-500" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 space-y-3">
              {items.length === 0 && <p className="text-xs text-gray-400 italic">No products yet. Search above and click to add.</p>}
              {items.map((it) => (
                <div key={it.key} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <img src={it.product.image} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{it.product.name}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {it.product.variations?.length > 0 && (
                          <Field className="col-span-2" label="Variant"><select className={inputCls} value={it.variantId} onChange={(e) => chooseVariant(it, e.target.value)}>
                              {it.product.variations.map((v) => <option key={v._id} value={v._id}>{v.variant_name} · {inr(v.selling_price)}</option>)}
                            </select></Field>
                        )}
                        <Field label="Price each (₹)"><input type="number" min="0" className={inputCls} value={it.price} onChange={(e) => updateItem(it.key, { price: e.target.value })} /></Field>
                        <Field label="Quantity"><input type="number" min="1" max="100" className={inputCls} value={it.quantity} onChange={(e) => updateItem(it.key, { quantity: e.target.value })} /></Field>
                      </div>
                      {it.product.add_ons?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {it.product.add_ons.map((a) => {
                            const on = Number(it.addOnQty[a._id]) > 0;
                            return (
                              <label key={a._id} className={`flex items-center gap-1.5 text-xs border rounded-full px-3 py-1 cursor-pointer ${on ? "border-rose-300 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
                                <input type="checkbox" checked={on} onChange={(e) => updateItem(it.key, { addOnQty: { ...it.addOnQty, [a._id]: e.target.checked ? 1 : 0 } })} />
                                {a.name} +{inr(a.selling_price)}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <button onClick={() => setItems((l) => l.filter((x) => x.key !== it.key))} className="text-gray-400 hover:text-red-600" title="Remove"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 3 · delivery */}
          <Section n="3" title="Delivery">
            {customer?.addresses?.length > 0 && (
              <Field className="mb-3" label="Use a saved address"><select className={inputCls} defaultValue="" onChange={(e) => { const a = customer.addresses.find((x) => String(x._id) === e.target.value); if (a) applyAddress(a); }}>
                  <option value="">Choose…</option>
                  {customer.addresses.map((a) => <option key={a._id} value={a._id}>{a.label || "address"}: {a.firstName}, {a.street}, {a.city} {a.postalCode}</option>)}
                </select></Field>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Receiver first name"><input className={inputCls} value={addr.firstName} onChange={(e) => setA("firstName", e.target.value)} /></Field>
              <Field label="Last name"><input className={inputCls} value={addr.lastName} onChange={(e) => setA("lastName", e.target.value)} /></Field>
              <Field className="md:col-span-2" label="Address"><input className={inputCls} value={addr.street} onChange={(e) => setA("street", e.target.value)} placeholder="House / street / area / landmark" /></Field>
              <Field label="City"><input className={inputCls} value={addr.city} onChange={(e) => setA("city", e.target.value)} /></Field>
              <Field label="State"><input className={inputCls} value={addr.state} onChange={(e) => setA("state", e.target.value)} /></Field>
              <Field label="Pin code"><input className={inputCls} inputMode="numeric" maxLength={6} value={addr.postalCode} onChange={(e) => setA("postalCode", e.target.value.replace(/\D/g, ""))} /></Field>
              <Field label="Receiver phone"><input className={inputCls} inputMode="numeric" value={addr.phone} onChange={(e) => setA("phone", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
              <Field className="md:col-span-2" label="Delivery type"><select className={inputCls} value={optionId} onChange={(e) => chooseOption(e.target.value)}>
                  {OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.title} ({inr(o.price)})</option>)}
                </select></Field>
              <Field label="Date"><input type="date" min={todayIst()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              <Field label="Time slot"><select className={inputCls} value={slot} onChange={(e) => setSlot(e.target.value)}>
                  {option.slots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select></Field>
              <Field label="Delivery charge (₹)"><input type="number" min="0" className={inputCls} value={shipping} onChange={(e) => setShipping(e.target.value)} /></Field>
            </div>
          </Section>

          {/* 4 · charges */}
          <Section n="4" title="Coupon and discount" hint="Pin-code surcharges are added automatically. Any discount or waiver needs a reason.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Coupon code (optional)"><input className={inputCls} value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} /></Field>
              <Field label="Extra discount (₹)"><input type="number" min="0" className={inputCls} value={discount} onChange={(e) => setDiscount(e.target.value)} /></Field>
              <Field label="Reason (for discount / waiver)"><input className={inputCls} value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} placeholder="e.g. regular customer" /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-3"><input type="checkbox" checked={waive} onChange={(e) => setWaive(e.target.checked)} /> Waive the pin-code surcharges for this order</label>
          </Section>

          {/* 5 · payment */}
          <Section n="5" title="Payment and notes">
            <div className="flex flex-wrap gap-2">
              {[["PAYMENT_LINK", "Payment link"], ["COD", "Cash on delivery"], ["PAID_OFFLINE", "Already paid"]].map(([v, l]) => (
                <button key={v} onClick={() => setPayMode(v)} className={`px-4 py-2 text-sm rounded-lg border ${payMode === v ? "border-rose-400 bg-rose-50 text-rose-700 font-semibold" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>{l}</button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{payMode === "PAYMENT_LINK" ? "The customer pays online (UPI, card, net banking) from a link you share. The order is marked paid automatically." : payMode === "COD" ? "Payment is collected on delivery." : "The money has already been received."}</p>
            {payMode === "PAID_OFFLINE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Field label="Received by"><select className={inputCls} value={payChannel} onChange={(e) => setPayChannel(e.target.value)}>{PAY_CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Reference / UTR (optional)"><input className={inputCls} value={payRef} onChange={(e) => setPayRef(e.target.value)} /></Field>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <Field label="Order came from"><select className={inputCls} value={orderChannel} onChange={(e) => setOrderChannel(e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Gift message / delivery note"><textarea rows={2} className={inputCls} value={orderNote} onChange={(e) => setOrderNote(e.target.value)} /></Field>
              <Field label="Internal note (staff only)"><textarea rows={2} className={inputCls} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} /></Field>
            </div>
          </Section>
        </div>

        {/* summary */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 lg:sticky lg:top-20">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Order summary</h3>
            {!preview ? (
              <p className="text-xs text-gray-400">{previewMsg || "Choose a customer, add products and fill the delivery address to see the price."}</p>
            ) : (
              <div className="text-sm space-y-1.5">
                {preview.lines.map((l, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-gray-600 truncate">{l.quantity} × {l.name}{l.variant_name ? ` (${l.variant_name})` : ""}{l.priceEdited && <em className="text-amber-600 not-italic text-[10px] ml-1">price edited</em>}</span>
                    <span className="text-gray-900">{inr(l.lineTotal)}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <Row label="Products" value={inr(preview.subtotal)} />
                <Row label="Delivery" value={inr(preview.shipping)} />
                {preview.couponDiscount > 0 && <Row label={`Coupon ${preview.coupon}`} value={`− ${inr(preview.couponDiscount)}`} green />}
                {preview.adminDiscount > 0 && <Row label="Extra discount" value={`− ${inr(preview.adminDiscount)}`} green />}
                {preview.pincodeSurcharge > 0 && <Row label="Location surcharge" value={inr(preview.pincodeSurcharge)} />}
                {preview.deliverySurcharge > 0 && <Row label="Extra delivery charge" value={inr(preview.deliverySurcharge)} />}
                {preview.surchargesWaived && <p className="text-[11px] text-amber-600">Surcharges waived</p>}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2"><span>Total</span><span>{inr(preview.total)}</span></div>
                {preview.warnings?.map((w) => <p key={w} className="text-xs text-amber-600 mt-1">⚠ {w}</p>)}
              </div>
            )}
            {previewMsg && preview && <p className="text-xs text-amber-600 mt-2">{previewMsg}</p>}
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <button disabled={!canCreate} onClick={submit}
              className="w-full mt-4 px-4 py-2.5 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? "Creating…" : payMode === "PAYMENT_LINK" ? "Create order and payment link" : payMode === "COD" ? "Create order (COD)" : "Create order (paid)"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Row = ({ label, value, green }) => (
  <div className="flex justify-between"><span className="text-gray-600">{label}</span><span className={green ? "text-green-600" : "text-gray-900"}>{value}</span></div>
);

export default CreateOrderPage;
