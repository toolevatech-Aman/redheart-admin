import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Check, X, Phone, Feather } from "lucide-react";
import { fetchShayariSubmissions, updateShayariSubmissionStatus } from "../../service/shayariSubmissions";

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_STYLES = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const ShayariReviewPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState("pending");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [updatingId, setUpdatingId]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchShayariSubmissions();
      if (res.success) setSubmissions(res.data || []);
      else setError("Failed to fetch submissions");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching submissions");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await updateShayariSubmissionStatus(id, status);
      if (res.success) {
        setSubmissions((prev) => prev.map((s) => (s.id === id || s._id === id) ? { ...s, status } : s));
      } else alert("Failed to update status");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating status");
    }
    setUpdatingId(null);
  };

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filter !== "all" && (s.status || "pending") !== filter) return false;
      if (typeFilter !== "all" && (s.type || "shayari") !== typeFilter) return false;
      return true;
    });
  }, [submissions, filter, typeFilter]);

  const counts = useMemo(() => ({
    all: submissions.length,
    pending: submissions.filter((s) => (s.status || "pending") === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  }), [submissions]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />
        Loading submissions…
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Feather className="w-6 h-6 text-rose-500" /> Shayari &amp; Quotes Review
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">User-submitted shayari and quotes awaiting approval before publishing</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${filter === f ? "bg-gray-800 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"}`}
          >
            {f} ({counts[f]})
          </button>
        ))}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="ml-auto px-3 py-1.5 border border-gray-300 rounded-full text-xs bg-white"
        >
          <option value="all">Shayari + Quotes</option>
          <option value="shayari">Shayari only</option>
          <option value="quote">Quotes only</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 text-center text-gray-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🪶</p>
          <p>No submissions in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const id = s.id || s._id;
            const status = s.status || "pending";
            return (
              <div key={id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[status]}`}>{status}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 capitalize">
                        {s.type || "shayari"}
                      </span>
                      {s.category && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{s.category}</span>
                      )}
                      {s.name && <span className="text-xs text-gray-500">by {s.name}</span>}
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <Phone className="w-3 h-3" /> {s.phone}
                        </a>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{fmtDate(s.submittedAt)}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm sm:text-base" style={{ fontFamily: "Georgia, serif" }}>
                      {s.shayari || s.content || s.text || "—"}
                    </p>
                  </div>

                  {status === "pending" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(id, "approved")}
                        disabled={updatingId === id}
                        className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(id, "rejected")}
                        disabled={updatingId === id}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-red-50 disabled:opacity-50 text-gray-600 hover:text-red-600 text-xs font-bold rounded-xl transition"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                  {status !== "pending" && (
                    <button
                      onClick={() => updateStatus(id, status === "approved" ? "rejected" : "approved")}
                      disabled={updatingId === id}
                      className="shrink-0 px-3 py-1.5 bg-gray-100 text-gray-500 hover:text-gray-800 disabled:opacity-50 text-xs font-semibold rounded-xl transition"
                    >
                      {status === "approved" ? "Unpublish" : "Approve instead"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShayariReviewPage;
