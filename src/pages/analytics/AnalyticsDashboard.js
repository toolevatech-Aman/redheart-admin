import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw, BarChart3, IndianRupee, ShoppingBag, UserPlus, Repeat,
  TrendingUp, Info, PiggyBank, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { fetchAnalyticsDashboard, fetchMarginAnalytics } from "../../service/analytics";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

const fmtDay = (d) => {
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const fmtMonth = (m) => {
  const [y, mo] = (m || "").split("-");
  if (!y || !mo) return m;
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
];

const PIE_COLORS = ["#f43f5e", "#0d9488", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#6b7280"];

const STATUS_COLORS = {
  Delivered: "#10b981", Shipped: "#3b82f6", Processing: "#f59e0b",
  Pending: "#6b7280", Cancelled: "#ef4444", Confirmed: "#8b5cf6",
};

function StatCard({ label, value, sub, icon: Icon, color, badge }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
        </div>
        {badge && (
          <span className="text-[9px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-5">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-[11px] text-gray-400 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-2" />}
      {children}
    </div>
  );
}

const AnalyticsDashboard = () => {
  const [view, setView] = useState("overview"); // "overview" | "margin"
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [marginData, setMarginData] = useState(null);
  const [marginLoading, setMarginLoading] = useState(true);
  const [marginError, setMarginError] = useState(null);

  const load = async (r) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalyticsDashboard(r);
      if (res.success) setData(res);
      else setError("Failed to load analytics");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading analytics");
    }
    setLoading(false);
  };

  const loadMargin = async (r) => {
    setMarginLoading(true);
    setMarginError(null);
    try {
      const res = await fetchMarginAnalytics(r);
      if (res.success) setMarginData(res);
      else setMarginError("Failed to load margin analytics");
    } catch (err) {
      console.error(err);
      setMarginError("Something went wrong while loading margin analytics");
    }
    setMarginLoading(false);
  };

  useEffect(() => { load(range); }, [range]);
  useEffect(() => { loadMargin(range); }, [range]);

  const s = data?.summary;

  const newVsRepeatPie = useMemo(() => {
    if (!s) return [];
    return [
      { name: "New Customers", value: s.newCustomerOrders },
      { name: "Repeat Customers", value: s.repeatCustomerOrders },
    ];
  }, [s]);

  if (view === "overview" && loading && !data)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading analytics…
      </div>
    );

  if (view === "overview" && error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={() => load(range)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-500" /> Analytics Dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Orders, revenue, customer retention &amp; category/city performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  range === r.key ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => (view === "overview" ? load(range) : loadMargin(range))} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${(view === "overview" ? loading : marginLoading) ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-lg w-fit">
        <button onClick={() => setView("overview")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${view === "overview" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
          <BarChart3 className="w-3.5 h-3.5" /> Overview
        </button>
        <button onClick={() => setView("margin")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${view === "margin" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
          <PiggyBank className="w-3.5 h-3.5" /> Margin
        </button>
      </div>

      {view === "margin" ? (
        <MarginView data={marginData} loading={marginLoading} error={marginError} onRetry={() => loadMargin(range)} />
      ) : (
      <>
      {/* ── Summary cards (range-scoped) ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatCard label="Total Orders" value={s?.totalOrders ?? 0} icon={ShoppingBag} color="text-gray-700" />
        <StatCard label="Total Revenue" value={inr(s?.totalRevenue)} icon={IndianRupee} color="text-emerald-600" />
        <StatCard label="Avg Order Value" value={inr(s?.aov)} icon={TrendingUp} color="text-blue-600" />
        <StatCard
          label="New Customer Orders"
          value={s?.newCustomerOrders ?? 0}
          sub={inr(s?.newCustomerRevenue) + " revenue"}
          icon={UserPlus}
          color="text-purple-600"
        />
      </div>

      {/* ── Retention cards (lifetime, NOT range-scoped) ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Repeat Customer Orders"
          value={s?.repeatCustomerOrders ?? 0}
          sub={inr(s?.repeatCustomerRevenue) + " revenue"}
          icon={Repeat}
          color="text-rose-600"
        />
        <StatCard
          label="Repeat Rate"
          value={pct(s?.repeatRate)}
          sub={`${s?.repeatCustomers ?? 0} of ${s?.totalCustomers ?? 0} customers ever`}
          icon={Repeat}
          color="text-rose-600"
          badge="lifetime"
        />
        <StatCard
          label="M1 Retention Rate"
          value={pct(s?.m1RetentionRate)}
          sub="% of a cohort who bought again next month"
          icon={TrendingUp}
          color="text-teal-600"
          badge="cohort"
        />
        <StatCard
          label="Total Customers"
          value={s?.totalCustomers ?? 0}
          sub="ever placed a paid order"
          icon={UserPlus}
          color="text-gray-700"
          badge="lifetime"
        />
      </div>

      {/* ── Revenue trend ────────────────────────────────────────────────── */}
      <Section title="Revenue Trend" subtitle="Daily revenue &amp; orders for the selected range">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data?.revenueTrend || []}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
            <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip
              labelFormatter={fmtDay}
              formatter={(value, name) => [name === "revenue" ? inr(value) : value, name === "revenue" ? "Revenue" : "Orders"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#f43f5e" fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Category breakdown ─────────────────────────────────────────── */}
        <Section title="Orders by Category" subtitle="Revenue attributed per product category">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.ordersByCategory || []} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 11, fill: "#374151" }} />
              <Tooltip formatter={(value, name) => [name === "revenue" ? inr(value) : value, name === "revenue" ? "Revenue" : "Orders"]} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {(data?.ordersByCategory || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* ── City breakdown ─────────────────────────────────────────────── */}
        <Section title="Orders by City" subtitle="Top 15 cities by order count">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(data?.ordersByCity || []).slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis dataKey="city" type="category" width={90} tick={{ fontSize: 11, fill: "#374151" }} />
              <Tooltip formatter={(value, name) => [name === "revenue" ? inr(value) : value, name === "revenue" ? "Revenue" : "Orders"]} />
              <Bar dataKey="orders" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* ── New vs Repeat ──────────────────────────────────────────────── */}
        <Section title="New vs Repeat Orders" subtitle="Order mix for the selected range">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={newVsRepeatPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                <Cell fill="#8b5cf6" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        {/* ── Order status ────────────────────────────────────────────────── */}
        <Section title="Order Status Breakdown" subtitle="Where orders in this range currently stand">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data?.orderStatusBreakdown || []} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {(data?.orderStatusBreakdown || []).map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ── Cohort retention table ───────────────────────────────────────── */}
      <Section
        title="M1 Cohort Retention"
        subtitle="Customers grouped by the month of their first order — % who ordered again the very next month"
      >
        <div className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-3 text-[11px] text-teal-800">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          A cohort only shows a rate once its "next month" has fully finished — the current in-progress month always shows "—".
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Cohort Month</th>
                <th className="py-2 pr-4 font-medium">New Customers</th>
                <th className="py-2 pr-4 font-medium">Retained (M+1)</th>
                <th className="py-2 pr-4 font-medium">M1 Rate</th>
              </tr>
            </thead>
            <tbody>
              {(data?.cohortRetention || []).slice().reverse().map((c) => (
                <tr key={c.cohortMonth} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700">{fmtMonth(c.cohortMonth)}</td>
                  <td className="py-2 pr-4 text-gray-600">{c.newCustomers}</td>
                  <td className="py-2 pr-4 text-gray-600">{c.eligible ? c.retainedM1 : "—"}</td>
                  <td className="py-2 pr-4">
                    {c.eligible ? (
                      <span className={`font-semibold ${c.m1Rate >= 20 ? "text-emerald-600" : c.m1Rate > 0 ? "text-amber-600" : "text-gray-400"}`}>
                        {pct(c.m1Rate)}
                      </span>
                    ) : (
                      <span className="text-gray-300">in progress</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.cohortRetention || data.cohortRetention.length === 0) && (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400">No cohort data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Top products ─────────────────────────────────────────────────── */}
      <Section title="Top Products" subtitle="By revenue, for the selected range">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 font-medium">Line Orders</th>
                <th className="py-2 pr-4 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topProducts || []).map((p, i) => (
                <tr key={p.name} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium text-gray-700">{p.name}</td>
                  <td className="py-2 pr-4 text-gray-600">{p.orders}</td>
                  <td className="py-2 pr-4 font-semibold text-emerald-600">{inr(p.revenue)}</td>
                </tr>
              ))}
              {(!data?.topProducts || data.topProducts.length === 0) && (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400">No product data for this range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
      </>
      )}
    </div>
  );
};

// ── Margin view ──────────────────────────────────────────────────────────────
function MarginView({ data, loading, error, onRetry }) {
  const s = data?.summary;

  if (loading && !data)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading margin data…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <>
      {s?.uncostedOrders > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {s.uncostedOrders} delivered order{s.uncostedOrders !== 1 ? "s" : ""} ({inr(s.uncostedRevenue)} revenue) in this range
          {" "}have no vendor cost recorded yet, so they're excluded from margin below — assign/cost them in Orders or Vendors to include.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Costed Revenue" value={inr(s?.totalRevenue)} icon={IndianRupee} color="text-gray-700" sub={`${s?.costedOrders ?? 0} orders with a vendor cost`} />
        <StatCard label="Total Vendor Cost" value={inr(s?.totalCost)} icon={IndianRupee} color="text-red-500" />
        <StatCard label="Total Margin" value={inr(s?.totalMargin)} icon={PiggyBank} color={s?.totalMargin >= 0 ? "text-emerald-600" : "text-red-600"} />
        <StatCard label="Margin %" value={pct(s?.marginPercent)} icon={TrendingUp} color={s?.marginPercent >= 0 ? "text-emerald-600" : "text-red-600"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="Margin by Category" subtitle="Whole-order vendor cost split proportionally by category revenue share">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.marginByCategory || []} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 11, fill: "#374151" }} />
              <Tooltip formatter={(value) => inr(value)} />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]}>
                {(data?.marginByCategory || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Margin by Location" subtitle="Top 20 cities by margin">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(data?.marginByLocation || []).slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis dataKey="city" type="category" width={90} tick={{ fontSize: 11, fill: "#374151" }} />
              <Tooltip formatter={(value) => inr(value)} />
              <Bar dataKey="margin" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Section title="Margin by Category — Detail" subtitle="Revenue, vendor cost and margin per category">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Revenue</th>
                <th className="py-2 pr-4 font-medium">Vendor Cost</th>
                <th className="py-2 pr-4 font-medium">Margin</th>
                <th className="py-2 pr-4 font-medium">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {(data?.marginByCategory || []).map((c) => (
                <tr key={c.category} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700">{c.category}</td>
                  <td className="py-2 pr-4 text-gray-600">{inr(c.revenue)}</td>
                  <td className="py-2 pr-4 text-red-500">{inr(c.cost)}</td>
                  <td className={`py-2 pr-4 font-semibold ${c.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{inr(c.margin)}</td>
                  <td className="py-2 pr-4 text-gray-600">{pct(c.marginPercent)}</td>
                </tr>
              ))}
              {(!data?.marginByCategory || data.marginByCategory.length === 0) && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No costed orders in this range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Margin by Location — Detail" subtitle="Revenue, vendor cost and margin per city">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">City</th>
                <th className="py-2 pr-4 font-medium">Orders</th>
                <th className="py-2 pr-4 font-medium">Revenue</th>
                <th className="py-2 pr-4 font-medium">Vendor Cost</th>
                <th className="py-2 pr-4 font-medium">Margin</th>
                <th className="py-2 pr-4 font-medium">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {(data?.marginByLocation || []).map((l) => (
                <tr key={l.city} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700">{l.city}</td>
                  <td className="py-2 pr-4 text-gray-600">{l.orders}</td>
                  <td className="py-2 pr-4 text-gray-600">{inr(l.revenue)}</td>
                  <td className="py-2 pr-4 text-red-500">{inr(l.cost)}</td>
                  <td className={`py-2 pr-4 font-semibold ${l.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{inr(l.margin)}</td>
                  <td className="py-2 pr-4 text-gray-600">{pct(l.marginPercent)}</td>
                </tr>
              ))}
              {(!data?.marginByLocation || data.marginByLocation.length === 0) && (
                <tr><td colSpan={6} className="py-6 text-center text-gray-400">No costed orders in this range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Top Vendors by Margin" subtitle="Lifetime — not scoped to the selected range">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Vendor</th>
                <th className="py-2 pr-4 font-medium">City</th>
                <th className="py-2 pr-4 font-medium">Orders</th>
                <th className="py-2 pr-4 font-medium">Revenue</th>
                <th className="py-2 pr-4 font-medium">Cost</th>
                <th className="py-2 pr-4 font-medium">Margin</th>
                <th className="py-2 pr-4 font-medium">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topVendorsByMargin || []).map((v) => (
                <tr key={v.name} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700">{v.name}</td>
                  <td className="py-2 pr-4 text-gray-500 capitalize">{v.city}</td>
                  <td className="py-2 pr-4 text-gray-600">{v.totalOrders}</td>
                  <td className="py-2 pr-4 text-gray-600">{inr(v.totalRevenue)}</td>
                  <td className="py-2 pr-4 text-red-500">{inr(v.totalCost)}</td>
                  <td className={`py-2 pr-4 font-semibold ${v.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{inr(v.margin)}</td>
                  <td className="py-2 pr-4 text-gray-600">{pct(v.marginPercent)}</td>
                </tr>
              ))}
              {(!data?.topVendorsByMargin || data.topVendorsByMargin.length === 0) && (
                <tr><td colSpan={7} className="py-6 text-center text-gray-400">No vendor margin data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

export default AnalyticsDashboard;
