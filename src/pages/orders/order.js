import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Phone, Mail, MapPin, Copy, Check, ChevronDown, ChevronUp,
  Package, IndianRupee, Truck, Clock, RefreshCw, MessageCircle, User, Bell, BellOff, X,
} from "lucide-react";
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from "../../service/order";
import AssignVendorModal from "./AssignVendorModal";

const POLL_MS = 20000;

// Two-note chime synthesized via Web Audio API — no external sound file to host.
function playChime(ctx) {
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.15;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  } catch { /* ignore — audio isn't critical */ }
}

const STATUS_OPTIONS = ["Pending", "Accepted", "InTransit", "Out Of Delivery", "Delivered", "Cancelled"];

const STATUS_STYLES = {
  Pending:           "bg-amber-50 text-amber-700 border-amber-200",
  Accepted:          "bg-blue-50 text-blue-700 border-blue-200",
  InTransit:         "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Out Of Delivery": "bg-purple-50 text-purple-700 border-purple-200",
  Delivered:         "bg-green-50 text-green-700 border-green-200",
  Cancelled:         "bg-red-50 text-red-600 border-red-200",
};

const PAGE_SIZE = 20;

// ── Date helpers ─────────────────────────────────────────────────────────────
const fmtDeliveryDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const fmtDateTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };

const deliveryBadge = (order) => {
  if (!order.deliveryDate) return null;
  const d = new Date(order.deliveryDate);
  if (isNaN(d)) return null;
  const today = startOfToday();
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const done = ["Delivered", "Cancelled"].includes(order.orderStatus);
  if (dd.getTime() === today.getTime() && !done)
    return <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-green-600 text-white rounded-full">Today</span>;
  if (dd < today && !done)
    return <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white rounded-full">Overdue</span>;
  return null;
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const waLink = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}`;
};

// ── Component ────────────────────────────────────────────────────────────────
const AdminOrdersFull = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [updatingId, setUpdatingId]   = useState(null);
  const [expanded, setExpanded]       = useState([]);
  const [copiedId, setCopiedId]       = useState(null);
  const [vendorModalOrder, setVendorModalOrder] = useState(null);

  // Filters
  const [query, setQuery]             = useState("");
  const [statusFilter, setStatus]     = useState("All");
  const [payFilter, setPayFilter]     = useState("All");
  const [visible, setVisible]         = useState(PAGE_SIZE);

  // New-order alerts (toast + chime)
  const [toasts, setToasts]           = useState([]);
  const [soundOn, setSoundOn]         = useState(true);
  const seenIdsRef  = useRef(null); // null until first load, so existing orders never alert
  const audioCtxRef = useRef(null);
  const soundOnRef  = useRef(true); // mirrors soundOn — the poll interval's closure would otherwise never see toggle updates
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  const pushToast = (order) => {
    const id = order._id || Math.random();
    setToasts((prev) => [...prev, { id, order }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 8000);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchOrders = async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    setError(null);
    try {
      const response = await fetchAllOrdersAdmin();
      if (response.success) {
        const incoming = response.data;
        if (seenIdsRef.current) {
          const newOnes = incoming.filter((o) => !seenIdsRef.current.has(o._id));
          if (newOnes.length > 0) {
            newOnes.forEach(pushToast);
            if (soundOnRef.current) playChime(audioCtxRef.current);
          }
        }
        seenIdsRef.current = new Set(incoming.map((o) => o._id));
        setOrders(incoming);
      } else setError("Failed to fetch orders");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching orders");
    }
    if (!isPoll) setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Unlock the AudioContext on the first user gesture — browsers block audio
    // that isn't triggered by interaction until then.
    const unlock = () => {
      if (!audioCtxRef.current) {
        try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* ignore */ }
      }
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);

    const interval = setInterval(() => fetchOrders(true), POLL_MS);
    return () => { clearInterval(interval); document.removeEventListener("click", unlock); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatusAdmin(orderId, newStatus);
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      } else alert("Failed to update status");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating status");
    }
    setUpdatingId(null);
  };

  const toggle = (id) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const copyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "All" && o.orderStatus !== statusFilter) return false;
      if (payFilter !== "All" && (o.paymentMode || "").toLowerCase() !== payFilter.toLowerCase()) return false;
      if (!q) return true;
      const hay = [
        o.orderId,
        o.user?.name, o.user?.email, o.user?.phone,
        o.shippingAddress?.firstName, o.shippingAddress?.lastName,
        o.shippingAddress?.phone, o.shippingAddress?.city,
        ...(o.cartItems || []).map((c) => c.name),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [orders, query, statusFilter, payFilter]);

  const stats = useMemo(() => {
    const today = startOfToday().getTime();
    let revenue = 0, pending = 0, deliverToday = 0, overdue = 0;
    for (const o of orders) {
      if (o.orderStatus !== "Cancelled") revenue += Number(o.totalPrice || 0);
      if (o.orderStatus === "Pending") pending++;
      if (o.deliveryDate) {
        const dd = new Date(o.deliveryDate); dd.setHours(0, 0, 0, 0);
        const done = ["Delivered", "Cancelled"].includes(o.orderStatus);
        if (dd.getTime() === today && !done) deliverToday++;
        if (dd.getTime() < today && !done) overdue++;
      }
    }
    return { total: orders.length, revenue, pending, deliverToday, overdue };
  }, [orders]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading orders…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={() => fetchOrders()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* New-order toast stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(({ id, order }) => (
          <div key={id} className="bg-white border-2 border-rose-200 rounded-xl shadow-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Bell className="w-4 h-4" /> New Order!
              </div>
              <button onClick={() => dismissToast(id)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-mono text-gray-800 mt-1">{order.orderId}</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.firstName || order.user?.name || "Customer"} · {inr(order.totalPrice)}
            </p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn((v) => !v)}
            title={soundOn ? "New-order sound alert: on" : "New-order sound alert: off"}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg ${soundOn ? "border-rose-200 bg-rose-50 text-rose-600" : "border-gray-300 hover:bg-gray-50"}`}
          >
            {soundOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "text-gray-700" },
          { label: "Revenue", value: inr(stats.revenue), icon: IndianRupee, color: "text-emerald-600" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600" },
          { label: "Deliver Today", value: stats.deliverToday, icon: Truck, color: "text-green-600" },
          { label: "Overdue", value: stats.overdue, icon: Clock, color: "text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search order ID, customer, phone, product, city…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setVisible(PAGE_SIZE); }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={payFilter}
          onChange={(e) => { setPayFilter(e.target.value); setVisible(PAGE_SIZE); }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="All">All Payments</option>
          <option value="cod">COD</option>
          <option value="online">Online</option>
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} order{filtered.length !== 1 && "s"}</p>

      {/* Orders */}
      {filtered.length === 0 ? (
        <p className="text-center py-16 text-gray-400">No orders match.</p>
      ) : (
        filtered.slice(0, visible).map((order) => {
          const isExpanded = expanded.includes(order._id);
          const customer = order.user;
          const custName =
            customer?.name ||
            [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(" ") ||
            "Unknown";
          const custPhone = customer?.phone || order.shippingAddress?.phone;

          return (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden">
              {/* ── Card header ── */}
              <div className="p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">{order.orderId}</span>
                      <button onClick={() => copyId(order.orderId)} title="Copy order ID"
                        className="text-gray-400 hover:text-gray-700">
                        {copiedId === order.orderId
                          ? <Check className="w-3.5 h-3.5 text-green-600" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${STATUS_STYLES[order.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${order.paymentMode === "cod" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {(order.paymentMode || "").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Placed {fmtDateTime(order.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{inr(order.totalPrice)}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      <Truck className="w-3 h-3" />
                      {fmtDeliveryDate(order.deliveryDate)}
                      {order.deliverySlot ? ` · ${order.deliverySlot}` : ""}
                      {deliveryBadge(order)}
                    </p>
                  </div>
                </div>

                {/* ── Customer strip ── */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-gray-800">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {custName}
                  </span>
                  {custPhone && (
                    <>
                      <a href={`tel:${custPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {custPhone}
                      </a>
                      <a href={waLink(custPhone)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:underline">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </>
                  )}
                  {customer?.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-gray-600 hover:underline">
                      <Mail className="w-3.5 h-3.5" /> {customer.email}
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3.5 h-3.5" /> {order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""}
                  </span>
                </div>

                {/* ── Items ── */}
                <div className="mt-3 space-y-2">
                  {(order.cartItems || []).map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <a
                        href={item.product_url || item.image_url}
                        target="_blank" rel="noopener noreferrer"
                        title={item.product_url ? "Open product page" : "Open image"}
                      >
                        <img src={item.image_url} alt={item.name} width={52} height={52}
                          className="w-13 h-13 rounded-lg object-cover border border-gray-200 hover:opacity-80"
                          style={{ width: 52, height: 52 }} />
                      </a>
                      <div className="min-w-0 flex-1">
                        {item.product_url ? (
                          <a href={item.product_url} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-rose-600 hover:underline truncate block">
                            {item.name}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {item.variant_name ? `${item.variant_name} · ` : ""}Qty {item.quantity} · {inr(item.selling_price)}
                          {item.add_ons?.length > 0 && ` · ${item.add_ons.length} add-on${item.add_ons.length > 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Actions row ── */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      disabled={updatingId === order.orderId}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {updatingId === order.orderId && <span className="text-xs text-gray-400">Updating…</span>}
                    <button onClick={() => setVendorModalOrder(order)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                        ${order.vendor?.vendorId ? "border-green-200 bg-green-50 text-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                      <Truck className="w-3.5 h-3.5" />
                      {order.vendor?.vendorId ? order.vendor.name : "Assign Vendor"}
                    </button>
                  </div>
                  <button onClick={() => toggle(order._id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                    {isExpanded ? <>Less <ChevronUp className="w-4 h-4" /></> : <>Details <ChevronDown className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>

              {/* ── Expanded detail ── */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1.5">Shipping Address</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                      {order.shippingAddress?.country} · {order.shippingAddress?.phone}
                    </p>
                    {order.orderNote && (
                      <>
                        <h4 className="font-semibold text-gray-800 mt-3 mb-1.5">Order Note</h4>
                        <p className="text-gray-600 italic">"{order.orderNote}"</p>
                      </>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1.5">Payment Breakdown</h4>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between"><span>Products</span><span>{inr(order.totalProductPrice)}</span></div>
                      <div className="flex justify-between"><span>Shipping</span><span>{inr(order.shippingCharges)}</span></div>
                      {order.coupanApplied && (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon ({order.coupanApplied})</span><span>−{inr(order.coupanDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                        <span>Total</span><span>{inr(order.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>Payment</span>
                        <span>{(order.paymentMode || "").toUpperCase()} · {order.paymentStatus}</span>
                      </div>
                      {order.razorpayPaymentId && (
                        <div className="flex justify-between">
                          <span>Razorpay ID</span><span className="font-mono text-xs">{order.razorpayPaymentId}</span>
                        </div>
                      )}
                    </div>

                    {/* Add-ons detail */}
                    {(order.cartItems || []).some((i) => i.add_ons?.length > 0) && (
                      <>
                        <h4 className="font-semibold text-gray-800 mt-3 mb-1.5">Add-ons</h4>
                        {(order.cartItems || []).flatMap((i) => i.add_ons || []).map((add) => (
                          <div key={add._id} className="flex items-center gap-2 mb-1.5">
                            <img src={add.image_url} alt={add.name} className="w-8 h-8 rounded object-cover border border-gray-200" />
                            <span className="text-gray-600">{add.name} × {add.quantity} ({inr(add.selling_price)})</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Load more */}
      {visible < filtered.length && (
        <div className="text-center mt-2 mb-8">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}

      {vendorModalOrder && (
        <AssignVendorModal
          order={vendorModalOrder}
          onClose={() => setVendorModalOrder(null)}
          onAssigned={(updatedOrder) => {
            setOrders((prev) => prev.map((o) => (o.orderId === updatedOrder.orderId ? { ...o, vendor: updatedOrder.vendor } : o)));
            setVendorModalOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminOrdersFull;
