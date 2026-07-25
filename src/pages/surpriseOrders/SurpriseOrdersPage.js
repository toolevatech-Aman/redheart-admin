import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Gift, IndianRupee, RefreshCw, ExternalLink, MapPin, Phone, Mail, Heart,
} from "lucide-react";
import { fetchSurpriseOrders } from "../../service/surpriseOrders";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDateTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
};

const OCCASION_LABELS = {
  proposal: "Proposal", birthday: "Birthday", anniversary: "Anniversary",
  apology: "Apology", "ask-them-out": "Ask Them Out", "compatibility-spark": "Compatibility",
  "gift-card": "Gift Card", "friendship-day": "Friendship Day", congratulations: "Congratulations",
  "miss-you": "Miss You", "good-morning": "Good Morning", "good-night": "Good Night",
  "thank-you": "Thank You", rakhi: "Rakhi", "mothers-day": "Mother's Day",
  "fathers-day": "Father's Day", "womens-day": "Women's Day", christmas: "Christmas",
  "new-year": "New Year", graduation: "Graduation", "baby-shower": "Baby Shower",
  engagement: "Engagement", farewell: "Farewell", "long-distance": "Long Distance",
  "cheer-up": "Cheer Up", "come-back": "Come Back", "first-date": "First Date",
  "secret-crush": "Secret Crush",
};

const PAGE_SIZE = 20;

const SurpriseOrdersPage = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [occasion, setOccasion] = useState("all");
  const [visible, setVisible]   = useState(PAGE_SIZE);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSurpriseOrders({ limit: 200 });
      if (res.success) setOrders(res.data || []);
      else setError("Failed to fetch surprise orders");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching surprise orders");
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const occasionOptions = useMemo(() => {
    const keys = [...new Set(orders.map((o) => o.occasionKey).filter(Boolean))];
    return keys.sort();
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (occasion !== "all" && o.occasionKey !== occasion) return false;
      if (!q) return true;
      const hay = [
        o.slug, o.partnerName, o.yourName, o.recipientName,
        o.email, o.whatsapp, o.deliveryPhone, o.razorpayPaymentId,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [orders, search, occasion]);

  const stats = useMemo(() => ({
    total: orders.length,
    revenue: orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0),
    withGift: orders.filter((o) => o.giftId && o.giftId !== "none").length,
    responded: orders.filter((o) => o.responded).length,
  }), [orders]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading surprise orders…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={fetchOrders} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" /> Surprise Orders
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Paid digital-surprise pages — proposal, birthday, apology, and 25+ other occasion types</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Orders", value: stats.total, icon: Gift, color: "text-gray-700" },
          { label: "Revenue", value: inr(stats.revenue), icon: IndianRupee, color: "text-emerald-600" },
          { label: "With Physical Gift", value: stats.withGift, icon: Gift, color: "text-purple-600" },
          { label: "Responded", value: stats.responded, icon: Heart, color: "text-rose-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search name, email, phone, payment ID…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <select
          value={occasion}
          onChange={(e) => { setOccasion(e.target.value); setVisible(PAGE_SIZE); }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Occasions</option>
          {occasionOptions.map((k) => (
            <option key={k} value={k}>{OCCASION_LABELS[k] || k}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} order{filtered.length !== 1 && "s"}</p>

      {filtered.length === 0 ? (
        <p className="text-center py-16 text-gray-400">No surprise orders match.</p>
      ) : (
        filtered.slice(0, visible).map((o) => (
          <div key={o._id} className="bg-white border border-gray-200 rounded-xl mb-3 shadow-sm p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                    {OCCASION_LABELS[o.occasionKey] || o.occasion || "Surprise"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                    {o.tier}
                  </span>
                  {o.responded && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                      Responded
                    </span>
                  )}
                  <a
                    href={`https://www.redheart.in/valentine-surprise/${o.slug}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    View page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1.5">
                  {o.yourName || "Someone"} → {o.partnerName || o.recipientName || "their partner"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(o.createdAt)}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{inr(o.amountPaid)}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {o.email && (
                <a href={`mailto:${o.email}`} className="flex items-center gap-1 hover:underline"><Mail className="w-3 h-3" /> {o.email}</a>
              )}
              {(o.whatsapp || o.deliveryPhone) && (
                <a href={`tel:${o.whatsapp || o.deliveryPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="w-3 h-3" /> {o.whatsapp || o.deliveryPhone}
                </a>
              )}
              {o.giftId && o.giftId !== "none" && (
                <span className="flex items-center gap-1"><Gift className="w-3 h-3 text-purple-500" /> {o.giftId}
                  {o.deliveryDate && ` · ${o.deliveryDate}`}{o.deliverySlot && ` · ${o.deliverySlot}`}
                </span>
              )}
              {o.deliveryAddress && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.deliveryAddress}</span>
              )}
              {o.razorpayPaymentId && (
                <span className="font-mono text-[10px] text-gray-400">{o.razorpayPaymentId}</span>
              )}
            </div>
          </div>
        ))
      )}

      {visible < filtered.length && (
        <div className="text-center mt-2 mb-8">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default SurpriseOrdersPage;
