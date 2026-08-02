import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Plus, Phone, MapPin } from "lucide-react";
import { fetchVendors } from "../../service/vendors";
import VendorFormModal from "./VendorFormModal";

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const VendorsPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [productFilter, setProductFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching vendors");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (productFilter !== "all" && !(v.products || []).includes(productFilter)) return false;
      if (!q) return true;
      const hay = [v.name, v.phone, v.city, ...(v.regions || []), ...(v.pinCodes || [])].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [vendors, search, statusFilter, productFilter]);

  const stats = useMemo(() => ({
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    inactive: vendors.filter((v) => v.status === "inactive").length,
  }), [vendors]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading vendors…
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
          <p className="text-xs text-gray-400 mt-0.5">Delivery partners for flowers, cakes, plants &amp; gifts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Vendors", value: stats.total, color: "text-gray-700" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Inactive", value: stats.inactive, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city, pin code…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="all">All Products</option>
          <option value="flowers">Flowers</option>
          <option value="cakes">Cakes</option>
          <option value="plants">Plants</option>
          <option value="gifts">Gifts</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No vendors match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Coverage</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Success</th>
                  <th className="px-5 py-3">Settlement</th>
                  <th className="px-5 py-3">Margin</th>
                  <th className="px-5 py-3">Last Order</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v._id} onClick={() => navigate(`/vendors/${v._id}`)}
                    className="border-t border-gray-50 hover:bg-gray-50 transition cursor-pointer">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{v.name}</p>
                      <a href={`tel:${v.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-blue-600 hover:underline text-xs mt-0.5">
                        <Phone className="w-3 h-3" /> {v.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className="flex items-center gap-1 capitalize"><MapPin className="w-3 h-3 text-gray-400" /> {v.city}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{(v.pinCodes || []).slice(0, 3).join(", ")}{(v.pinCodes || []).length > 3 ? "…" : ""}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 capitalize">{(v.products || []).join(", ") || "—"}</td>
                    <td className="px-5 py-3 text-gray-700">{v.stats?.totalOrders || 0}</td>
                    <td className="px-5 py-3">
                      {v.stats?.totalOrders ? (
                        <span className={`font-semibold ${v.stats.successRate >= 80 ? "text-green-600" : v.stats.successRate >= 50 ? "text-amber-600" : "text-red-600"}`}>
                          {v.stats.successRate}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{v.stats?.totalCost ? `₹${v.stats.totalCost.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-5 py-3">
                      {v.stats?.totalRevenue ? (
                        <span className={`font-semibold ${v.stats.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{v.stats.margin.toLocaleString("en-IN")}
                          <span className="text-xs font-normal ml-1 opacity-70">
                            ({((v.stats.margin / v.stats.totalRevenue) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(v.stats?.lastOrderAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${v.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <VendorFormModal
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
};

export default VendorsPage;
