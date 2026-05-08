import React, { useEffect, useState } from "react";
import { getImportHistory, downloadErrorReport } from "../../service/bulkService";

const STATUS_STYLES = {
  completed:  "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  failed:     "bg-red-100 text-red-700",
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-purple-100 text-purple-700",
};

export default function ImportHistory({ category = "all" }) {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getImportHistory(category, p, 10);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [category]);

  const fmt = (d) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—";
  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {loading ? (
        <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">No import history yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {["Date","File","Category","Mode","Total","Valid","Invalid","Inserted","Updated","Status","Actions"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-semibold border-b whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr key={job._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500">{fmt(job.createdAt)}</td>
                  <td className="px-3 py-2 max-w-xs truncate text-gray-700" title={job.filename}>{job.filename || "—"}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{job.category}</td>
                  <td className="px-3 py-2 text-gray-600 capitalize">{job.mode}</td>
                  <td className="px-3 py-2 text-center">{job.totalRows}</td>
                  <td className="px-3 py-2 text-center text-green-600 font-semibold">{job.validCount}</td>
                  <td className="px-3 py-2 text-center text-red-500 font-semibold">{job.invalidCount}</td>
                  <td className="px-3 py-2 text-center text-blue-600">{job.insertedCount ?? "—"}</td>
                  <td className="px-3 py-2 text-center text-purple-600">{job.updatedCount ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[job.status] || "bg-gray-100 text-gray-600"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {job.invalidCount > 0 && (
                      <button onClick={() => downloadErrorReport(job._id)}
                        className="text-xs text-red-600 underline hover:text-red-800 whitespace-nowrap">
                        ⬇ Errors
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
          <span>Showing page {page} of {totalPages} ({total} total)</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <button disabled={page >= totalPages} onClick={() => load(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
