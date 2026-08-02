import React, { useEffect, useState } from "react";
import { X, MapPin, Star, Search, Layers, Package } from "lucide-react";
import {
  recommendVendors, assignVendorToOrder, assignVendorToOrderItem,
  fetchVendors, createVendor, fetchPinCodeStat,
} from "../../service/vendors";

const CONFIDENCE_STYLES = {
  High:   "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-gray-100 text-gray-500",
};

const AssignVendorModal = ({ order, onClose, onAssigned }) => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVendorRequired, setNewVendorRequired] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pinStat, setPinStat] = useState(null);
  const [splitMode, setSplitMode] = useState(false);

  // Whole-order assignment state
  const [cost, setCost] = useState({});
  const [deliveryCost, setDeliveryCost] = useState({});
  const [manualSearch, setManualSearch] = useState("");
  const [manualResults, setManualResults] = useState([]);
  const [assigning, setAssigning] = useState(null);

  const city = order.shippingAddress?.city || "";
  const region = order.shippingAddress?.state || "";
  const pinCode = order.shippingAddress?.postalCode || "";
  const items = order.cartItems || [];

  const load = async () => {
    setLoading(true);
    try {
      const data = await recommendVendors({ city, region, pinCode });
      setRecs(data.recommendations || []);
      setNewVendorRequired(data.newVendorRequired);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (pinCode) fetchPinCodeStat(pinCode).then(setPinStat).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runManualSearch = async (q) => {
    setManualSearch(q);
    if (!q.trim()) return setManualResults([]);
    try {
      const data = await fetchVendors({ q, status: "active" });
      setManualResults(data || []);
    } catch (err) { console.error(err); }
  };

  const doAssign = async (vendorId) => {
    setAssigning(vendorId);
    try {
      const updated = await assignVendorToOrder(order.orderId, {
        vendorId,
        cost: cost[vendorId] ? Number(cost[vendorId]) : undefined,
        deliveryCost: deliveryCost[vendorId] ? Number(deliveryCost[vendorId]) : undefined,
      });
      onAssigned(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to assign vendor");
    }
    setAssigning(null);
  };

  const doAssignItem = async (cartItemId, vendorId, itemCost, itemDeliveryCost) => {
    const updated = await assignVendorToOrderItem(order.orderId, {
      cartItemId, vendorId,
      cost: itemCost ? Number(itemCost) : undefined,
      deliveryCost: itemDeliveryCost ? Number(itemDeliveryCost) : undefined,
    });
    onAssigned(updated);
    return updated;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assign Vendor</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {city}{region ? `, ${region}` : ""} {pinCode && `· ${pinCode}`}
            </p>
            {pinStat?.orderCount > 0 && (
              <p className="text-xs text-amber-600 mt-1">Avg cost in {pinCode}: ₹{pinStat.avgCost} (from {pinStat.orderCount} order{pinStat.orderCount > 1 ? "s" : ""})</p>
            )}
            {pinStat?.extraDeliveryFee > 0 && (
              <p className="text-xs font-semibold text-red-600 mt-0.5">
                ⚠ This pin code runs ₹{pinStat.extraDeliveryFee} above standard delivery cost — consider surcharging next order here.
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {order.vendor?.vendorId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              Whole order assigned to: <span className="font-semibold">{order.vendor.name}</span> ({order.vendor.phone})
              {order.vendor.cost ? ` · ₹${order.vendor.cost}` : ""}
            </div>
          )}

          {items.length > 1 && (
            <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
              <button onClick={() => setSplitMode(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${!splitMode ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                <Package className="w-3.5 h-3.5" /> Whole Order — 1 Vendor
              </button>
              <button onClick={() => setSplitMode(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${splitMode ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                <Layers className="w-3.5 h-3.5" /> Split by Product
              </button>
            </div>
          )}

          {splitMode ? (
            <div className="space-y-3">
              {items.map((item) => (
                <ItemAssignRow key={item._id} item={item} recs={recs} loading={loading}
                  existing={(order.itemVendors || []).find((iv) => iv.cartItemId === item._id)}
                  onAssign={doAssignItem} />
              ))}
            </div>
          ) : (
            <>
              {loading ? (
                <p className="text-center py-10 text-gray-400 text-sm">Finding vendors…</p>
              ) : recs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="font-semibold text-red-600 mb-1">No Vendor Available</p>
                  <p className="text-xs text-gray-400 mb-4">No vendor covers this city/region/pin code yet.</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {recs.map((r) => (
                    <div key={r.vendor._id} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">{r.vendor.name}</p>
                          <p className="text-xs text-gray-500">{r.vendor.phone} · matched by {r.matchTier}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {r.totalOrders > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" /> {r.successRate}% success ({r.totalOrders} orders)</span>}
                            {r.previousCost && <span>· avg ₹{r.previousCost}</span>}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CONFIDENCE_STYLES[r.confidence]}`}>{r.confidence}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number" placeholder="Total cost (₹)"
                          value={cost[r.vendor._id] || ""}
                          onChange={(e) => setCost({ ...cost, [r.vendor._id]: e.target.value })}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                        <input
                          type="number" placeholder="Delivery portion (₹)"
                          value={deliveryCost[r.vendor._id] || ""}
                          onChange={(e) => setDeliveryCost({ ...deliveryCost, [r.vendor._id]: e.target.value })}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                        <button onClick={() => doAssign(r.vendor._id)} disabled={assigning === r.vendor._id}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold whitespace-nowrap">
                          {assigning === r.vendor._id ? "…" : "Assign"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showManual ? (
                <button onClick={() => setShowManual(true)} className="text-sm text-blue-600 hover:underline">
                  Search another vendor manually
                </button>
              ) : (
                <div className="border-t border-gray-100 pt-4">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={manualSearch} onChange={(e) => runManualSearch(e.target.value)}
                      placeholder="Search vendor by name, phone, city…"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  {manualResults.map((v) => (
                    <div key={v._id} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                      <span>{v.name} <span className="text-gray-400 text-xs">({v.city})</span></span>
                      <button onClick={() => doAssign(v._id)} disabled={assigning === v._id}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold">
                        {assigning === v._id ? "…" : "Assign"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(newVendorRequired || showManual) && !showQuickAdd && (
                <button onClick={() => setShowQuickAdd(true)} className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                  + Create New Vendor
                </button>
              )}
              {showQuickAdd && (
                <QuickAddVendor
                  defaultCity={city} defaultRegion={region} defaultPinCode={pinCode}
                  onCreated={async (vendor) => { setShowQuickAdd(false); await doAssign(vendor._id); }}
                  onCancel={() => setShowQuickAdd(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// One row per order item in "Split by Product" mode — pick from the same
// location-based recommendations, or search manually, per item.
const ItemAssignRow = ({ item, recs, loading, existing, onAssign }) => {
  const [expanded, setExpanded] = useState(false);
  const [cost, setCost] = useState("");
  const [deliveryCost, setDeliveryCost] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [assigning, setAssigning] = useState(null);

  const runSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    try {
      const data = await fetchVendors({ q, status: "active" });
      setResults(data || []);
    } catch (err) { console.error(err); }
  };

  const assign = async (vendorId) => {
    setAssigning(vendorId);
    try {
      await onAssign(item._id, vendorId, cost, deliveryCost);
      setExpanded(false);
    } catch (err) {
      console.error(err);
      alert("Failed to assign vendor for this item");
    }
    setAssigning(null);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
          <p className="text-xs text-gray-400">Qty {item.quantity} · {item.variant_name || ""}</p>
        </div>
        {existing?.vendorId ? (
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">{existing.name}</span>
        ) : (
          <button onClick={() => setExpanded((v) => !v)} className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-gray-50">
            {expanded ? "Cancel" : "Assign"}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            <input type="number" placeholder="Cost (₹)" value={cost} onChange={(e) => setCost(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
            <input type="number" placeholder="Delivery (₹)" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
          </div>

          {!loading && recs.slice(0, 3).map((r) => (
            <div key={r.vendor._id} className="flex items-center justify-between text-xs py-1">
              <span>{r.vendor.name} <span className="text-gray-400">({r.matchTier}, {r.confidence})</span></span>
              <button onClick={() => assign(r.vendor._id)} disabled={assigning === r.vendor._id}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-semibold">
                {assigning === r.vendor._id ? "…" : "Assign"}
              </button>
            </div>
          ))}

          <input value={search} onChange={(e) => runSearch(e.target.value)}
            placeholder="Or search another vendor…"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
          {results.map((v) => (
            <div key={v._id} className="flex items-center justify-between text-xs py-1">
              <span>{v.name} <span className="text-gray-400">({v.city})</span></span>
              <button onClick={() => assign(v._id)} disabled={assigning === v._id}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-semibold">
                {assigning === v._id ? "…" : "Assign"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Minimal inline vendor-creation form for the "no vendor found" fallback
const QuickAddVendor = ({ defaultCity, defaultRegion, defaultPinCode, onCreated, onCancel }) => {
  const [form, setForm] = useState({ name: "", phone: "", city: defaultCity, regions: defaultRegion, pinCodes: defaultPinCode });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city) return alert("Name, phone and city are required");
    setSaving(true);
    try {
      const vendor = await createVendor({
        ...form,
        regions: form.regions.split(",").map((s) => s.trim()).filter(Boolean),
        pinCodes: form.pinCodes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onCreated(vendor);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create vendor");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
      <input placeholder="Vendor name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
      <input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
      <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-1.5 border border-gray-300 rounded-lg text-xs">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold">
          {saving ? "Creating…" : "Create & Assign"}
        </button>
      </div>
    </form>
  );
};

export default AssignVendorModal;
