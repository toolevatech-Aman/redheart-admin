import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Phone, Mail, CreditCard } from "lucide-react";
import { fetchSubscribers } from "../../service/subscribers";

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const PLAN_STYLES = {
  free:            "bg-gray-100 text-gray-600",
  premium_intent:  "bg-blue-100 text-blue-700",
  premium_trial:   "bg-amber-100 text-amber-700",
  premium:         "bg-purple-100 text-purple-700",
};

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [planFilter, setPlanFilter]   = useState("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSubscribers();
      if (res.success) setSubscribers(res.data || []);
      else setError("Failed to fetch subscribers");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching subscribers");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (planFilter !== "all" && s.plan !== planFilter) return false;
      if (!q) return true;
      const hay = [s.email, s.phone, s.type, s.razorpaySubscriptionId].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [subscribers, search, planFilter]);

  const stats = useMemo(() => ({
    total: subscribers.length,
    paid: subscribers.filter((s) => ["premium", "premium_trial"].includes(s.plan)).length,
    free: subscribers.filter((s) => s.plan === "free").length,
  }), [subscribers]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading subscribers…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shayari &amp; Quotes Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">Subscribers and premium WhatsApp-delivery purchases</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Subscribers", value: stats.total, color: "text-gray-700" },
          { label: "Paid / Trial", value: stats.paid, color: "text-purple-600" },
          { label: "Free", value: stats.free, color: "text-gray-500" },
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
            placeholder="Search email, phone, subscription ID…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="premium_intent">Premium Intent</option>
          <option value="premium_trial">Premium Trial</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No subscribers match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Razorpay</th>
                  <th className="px-5 py-3">Since</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="w-3 h-3" /> {s.phone}
                        </a>
                      )}
                      {s.email && (
                        <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-gray-600 hover:underline mt-0.5">
                          <Mail className="w-3 h-3" /> {s.email}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3 capitalize text-gray-600">{s.type || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${PLAN_STYLES[s.plan] || PLAN_STYLES.free}`}>
                        {s.plan || "free"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {s.razorpaySubscriptionId ? (
                        <span className="flex items-center gap-1 font-mono">
                          <CreditCard className="w-3 h-3 text-purple-500" /> {s.razorpaySubscriptionId}
                          {s.subscriptionStatus && <span className="ml-1 text-gray-400">({s.subscriptionStatus})</span>}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(s.subscribedAt)}</td>
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

export default SubscribersPage;
