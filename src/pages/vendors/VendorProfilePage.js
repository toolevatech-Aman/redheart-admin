import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Save, RefreshCw, Ban, CheckCircle2 } from "lucide-react";
import { fetchVendorProfile, updateVendor, deactivateVendor } from "../../service/vendors";

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const VendorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchVendorProfile(id);
      setVendor(data.vendor);
      setOrders(data.orders || []);
      setNotes(data.vendor.notes || "");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const updated = await updateVendor(id, { notes });
      setVendor(updated);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const toggleStatus = async () => {
    try {
      const updated = vendor.status === "active"
        ? await deactivateVendor(id)
        : await updateVendor(id, { status: "active" });
      setVendor(updated);
    } catch (err) { console.error(err); }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading vendor…
      </div>
    );

  if (!vendor)
    return <div className="text-center py-24 text-gray-400">Vendor not found.</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate("/vendors")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Vendors
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vendor.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Phone className="w-3.5 h-3.5" /> {vendor.phone}</a>
              {vendor.whatsapp && <span className="flex items-center gap-1">WhatsApp: {vendor.whatsapp}</span>}
              <span className="flex items-center gap-1 capitalize"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {vendor.city}</span>
            </div>
            {vendor.address && <p className="text-xs text-gray-400 mt-1">{vendor.address}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${vendor.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {vendor.status}
            </span>
            <button onClick={toggleStatus} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
              {vendor.status === "active" ? <><Ban className="w-3.5 h-3.5" /> Deactivate</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Activate</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Total Orders", value: vendor.stats?.totalOrders || 0 },
            { label: "Success Rate", value: vendor.stats?.totalOrders ? `${vendor.stats.successRate}%` : "—" },
            { label: "Avg Cost", value: vendor.stats?.avgCost ? `₹${vendor.stats.avgCost}` : "—" },
            { label: "Last Order", value: fmtDate(vendor.stats?.lastOrderAt) },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Regions Covered</p>
            <div className="flex flex-wrap gap-1.5">
              {(vendor.regions || []).length ? vendor.regions.map((r) => (
                <span key={r} className="px-2 py-1 bg-rose-50 text-rose-600 rounded-full text-xs capitalize">{r}</span>
              )) : <span className="text-xs text-gray-400">None specified</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Pin Codes Served</p>
            <div className="flex flex-wrap gap-1.5">
              {(vendor.pinCodes || []).length ? vendor.pinCodes.map((p) => (
                <span key={p} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{p}</span>
              )) : <span className="text-xs text-gray-400">None specified</span>}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Products Offered</p>
          <div className="flex flex-wrap gap-1.5">
            {(vendor.products || []).length ? vendor.products.map((p) => (
              <span key={p} className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs capitalize">{p}</span>
            )) : <span className="text-xs text-gray-400">None specified</span>}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Internal Notes</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={saveNotes} disabled={saving || notes === vendor.notes}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg font-semibold">
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Order History ({orders.length})</h3>
        </div>
        {orders.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No orders assigned to this vendor yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Vendor Cost</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{o.orderId}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{(o.cartItems || []).map((i) => i.name).join(", ")}</td>
                    <td className="px-5 py-3 text-gray-700">{o.vendor?.cost ? `₹${o.vendor.cost}` : "—"}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{o.orderStatus}</span>
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

export default VendorProfilePage;
