import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ShoppingBag,
  FileText,
  IndianRupee,
  Package,
  ArrowRight,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { fetchAllOrdersAdmin } from "../../service/order";
import { fetchAllSubmissions } from "../../service/questions";

const CHART_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed"];

const QuickActionCard = ({ icon: Icon, label, subtext, to, color, onNavigate }) => (
  <button
    onClick={() => onNavigate(to)}
    className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 text-left w-full"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-7 h-7 text-white" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 truncate">{label}</p>
      <p className="text-sm text-gray-500 truncate">{subtext}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
  </button>
);

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className={`rounded-2xl p-6 border border-gray-100 bg-white shadow-sm ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
        {subtext != null && <p className="mt-0.5 text-xs text-gray-500">{subtext}</p>}
      </div>
      <div className="p-3 rounded-xl bg-white/80 shadow-sm">
        <Icon className="w-6 h-6 text-gray-700" strokeWidth={2} />
      </div>
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orderRes, subs] = await Promise.all([
          fetchAllOrdersAdmin(),
          fetchAllSubmissions(),
        ]);
        const orderList = orderRes?.success ? orderRes.data ?? [] : [];
        setOrders(Array.isArray(orderList) ? orderList : []);
        setSubmissions(Array.isArray(subs) ? subs : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
        setOrders([]);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const ordersByStatus = React.useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const s = o.orderStatus || "Unknown";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [orders]);

  const totalRevenueOrders = orders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
  const totalRevenueSubs = submissions.reduce((s, sub) => s + (Number(sub.amount) || 0) / 100, 0);
  const totalRevenue = totalRevenueOrders + totalRevenueSubs;
  const paidSubmissions = submissions.filter((s) => s.paymentStatus === "PAID").length;

  const recentOrders = orders.slice(0, 5);
  const recentSubmissions = submissions.slice(0, 5);

  const formatDate = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—");
  const formatMoney = (n) => (n != null ? `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" strokeWidth={2} />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Welcome to <span className="text-red-600">Red Heart</span> Admin
          </h1>
          <p className="mt-2 text-gray-600">Overview of orders, submissions, and revenue</p>
        </header>

        {/* Stat cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={orders.length}
            subtext="All time"
          />
          <StatCard
            icon={FileText}
            label="Form Submissions"
            value={submissions.length}
            subtext={`${paidSubmissions} paid`}
          />
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={formatMoney(totalRevenue)}
            subtext="Orders + paid submissions"
          />
          <StatCard
            icon={TrendingUp}
            label="Orders (Status)"
            value={ordersByStatus.length}
            subtext="Status categories"
          />
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-500" />
              Orders by status
            </h2>
            {ordersByStatus.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">No order data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ordersByStatus} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6" }}
                    formatter={(v) => [v, "Orders"]}
                    labelFormatter={(l) => `Status: ${l}`}
                  />
                  <Bar dataKey="count" fill="#dc2626" radius={[6, 6, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Order status distribution
            </h2>
            {ordersByStatus.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">No order data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {ordersByStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6" }}
                    formatter={(v) => [v, "Orders"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              icon={ShoppingBag}
              label="Manage Orders"
              subtext="View and update order status"
              to="/orders"
              onNavigate={navigate}
              color="bg-red-500"
            />
            <QuickActionCard
              icon={FileText}
              label="Questions & Submissions"
              subtext="Forms and submitted details"
              to="/questions"
              onNavigate={navigate}
              color="bg-amber-500"
            />
            <QuickActionCard
              icon={Package}
              label="Add Product"
              subtext="Upload new products"
              to="/addProduct"
              onNavigate={navigate}
              color="bg-emerald-500"
            />
            <QuickActionCard
              icon={Users}
              label="Page Content"
              subtext="Edit site content"
              to="/pageContent"
              onNavigate={navigate}
              color="bg-indigo-500"
            />
          </div>
        </section>

        {/* Recent activity: two columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
              <button
                onClick={() => navigate("/orders")}
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto max-h-80">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders yet</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Order ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs">{o.orderId || o._id}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {o.orderStatus || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatMoney(o.totalPrice)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent submissions</h2>
              <button
                onClick={() => navigate("/questions")}
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto max-h-80">
              {recentSubmissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No submissions yet</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">User ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentSubmissions.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={s.userId}>
                          {s.userId || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {s.paymentStatus || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {s.amount != null ? `₹${(Number(s.amount) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
