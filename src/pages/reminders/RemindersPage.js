import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, BellRing, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllReminders } from "../../service/reminders";

const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const OCCASION_TYPES = [
  "Birthday", "Anniversary", "Retirement", "New Job", "Engagement",
  "Housewarming", "Promotion", "New Baby", "Custom",
];

const fmtDate = (r) => `${r.day} ${MONTHS[r.month]}`;

const fmtCreated = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [page, setPage] = useState(1);

  const load = async (pageToLoad = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllReminders({
        page: pageToLoad,
        limit: 50,
        search: search.trim() || undefined,
        occasionType: occasionFilter !== "all" ? occasionFilter : undefined,
      });
      if (res.success) {
        setReminders(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching reminders");
    }
    setLoading(false);
  };

  useEffect(() => { load(1); setPage(1); /* eslint-disable-next-line */ }, [occasionFilter]);
  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const counts = useMemo(() => {
    const byOccasion = {};
    reminders.forEach((r) => { byOccasion[r.occasionType] = (byOccasion[r.occasionType] || 0) + 1; });
    return byOccasion;
  }, [reminders]);

  if (loading && !reminders.length)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading reminders…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={() => load(page)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-rose-500" /> Reminders
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Every "My Reminders" date customers have saved, with who it's for and when it recurs</p>
        </div>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-700">{pagination?.total ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Reminders</p>
        </div>
        {["Birthday", "Anniversary", "Custom"].map((occ) => (
          <div key={occ} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-rose-500">{counts[occ] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">{occ} (this page)</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by who the reminder is for (e.g. Priya)…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <select value={occasionFilter} onChange={(e) => setOccasionFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="all">All Occasions</option>
          {OCCASION_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <button type="submit" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold">
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {reminders.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No reminders match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Reminder For</th>
                  <th className="px-5 py-3">Relation</th>
                  <th className="px-5 py-3">Occasion</th>
                  <th className="px-5 py-3">Date (recurs yearly)</th>
                  <th className="px-5 py-3">Lead Days</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3">Saved On</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr key={r._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{r.customer?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{r.customer?.email || r.customer?.phone || r.userId}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{r.relationName}</td>
                    <td className="px-5 py-3 text-gray-600">{r.relationType}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600">
                        {r.occasionType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">{fmtDate(r)}</td>
                    <td className="px-5 py-3 text-gray-500">{r.leadDays}d before</td>
                    <td className="px-5 py-3 text-gray-500 max-w-[220px] truncate" title={r.notes}>{r.notes || "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtCreated(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
