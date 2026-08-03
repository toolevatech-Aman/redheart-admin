import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw, Search, Plus, Tag, TrendingUp, IndianRupee, CheckCircle2, Ban, Trash2, Pencil,
} from "lucide-react";
import { fetchCouponDashboard, fetchCoupons, toggleCouponStatus, deleteCoupon } from "../../service/coupons";
import CouponFormModal from "./CouponFormModal";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const isExpired = (c) => c.validUntil && new Date(c.validUntil) < new Date();
const isUpcoming = (c) => c.validFrom && new Date(c.validFrom) > new Date();

const CouponsPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, list] = await Promise.all([fetchCouponDashboard(), fetchCoupons()]);
      if (dash.success) setDashboard(dash);
      setCoupons(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching coupons");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      if (statusFilter === "active" && c.status !== "active") return false;
      if (statusFilter === "inactive" && c.status !== "inactive") return false;
      if (statusFilter === "expired" && !isExpired(c)) return false;
      if (!q) return true;
      return c.code.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
    });
  }, [coupons, search, statusFilter]);

  const handleToggle = async (id) => {
    try {
      const updated = await toggleCouponStatus(id);
      setCoupons((prev) => prev.map((c) => (c._id === id ? { ...c, status: updated.status } : c)));
    } catch (err) { console.error(err); alert("Failed to update status"); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"? This can't be undone.`)) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) { console.error(err); alert("Failed to delete coupon"); }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading coupons…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  const s = dashboard?.summary;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-rose-500" /> Coupons
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Create and manage discount codes across flowers, cakes, plants, gifts &amp; hampers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => { setEditingCoupon(null); setShowForm(true); }} className="flex items-center gap-2 px-3 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-700">{s?.total ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Coupons</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{s?.active ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Active</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-400">{s?.expired ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Expired</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{s?.upcoming ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Upcoming</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-lg font-bold text-blue-700">{s?.orders ?? 0}</p>
            <p className="text-xs text-blue-500">Orders using a coupon</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <IndianRupee className="w-8 h-8 text-emerald-500" />
          <div>
            <p className="text-lg font-bold text-emerald-700">{inr(s?.revenue)}</p>
            <p className="text-xs text-emerald-500">Revenue from those orders</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
          <IndianRupee className="w-8 h-8 text-red-400" />
          <div>
            <p className="text-lg font-bold text-red-600">{inr(s?.discountGiven)}</p>
            <p className="text-xs text-red-400">Total discount given</p>
          </div>
        </div>
      </div>

      {dashboard?.topCoupons?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Top Coupons by Orders</h3>
          <div className="flex flex-wrap gap-2">
            {dashboard.topCoupons.map((c) => (
              <div key={c.code} className="px-3 py-2 bg-gray-50 rounded-lg text-xs">
                <span className="font-mono font-bold text-gray-800">{c.code}</span>
                <span className="text-gray-500"> · {c.orders} orders · {inr(c.revenue)} revenue</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or note…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No coupons match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Min Order</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Valid</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Revenue</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-mono font-bold text-gray-800">{c.code}</p>
                      {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.discountType === "percentage" && `${c.discountValue}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`}
                      {c.discountType === "flat" && `₹${c.discountValue}`}
                      {c.discountType === "free_shipping" && "Free Shipping"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.minOrderValue ? inr(c.minOrderValue) : "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {c.timesUsed}{c.usageLimitGlobal ? `/${c.usageLimitGlobal}` : ""} total
                      {c.usageLimitPerCustomer ? <><br />{c.usageLimitPerCustomer}/customer</> : ""}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {c.validFrom || c.validUntil ? (
                        <>{fmtDate(c.validFrom)} – {fmtDate(c.validUntil)}</>
                      ) : "Always"}
                      {isExpired(c) && <span className="ml-1 text-red-500 font-semibold">expired</span>}
                      {isUpcoming(c) && <span className="ml-1 text-amber-500 font-semibold">upcoming</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{c.orders}</td>
                    <td className="px-5 py-3 text-emerald-600 font-semibold">{inr(c.revenue)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingCoupon(c); setShowForm(true); }} title="Edit" className="text-gray-400 hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggle(c._id)} title={c.status === "active" ? "Deactivate" : "Activate"} className="text-gray-400 hover:text-amber-600">
                          {c.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(c._id, c.code)} title="Delete" className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
};

export default CouponsPage;
