import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllBlogPosts, deleteBlogPost, fetchBlogQueueStatus } from "../../service/blogService";

// One card per product vertical — the automated daily pipeline (see
// redheart-backend-clean: scripts/import-blog-source.mjs +
// src/utils/dailyBlogPublish.js) releases 3 drafts/day/vertical to a fixed
// author each. This just answers "how much runway is left before someone
// needs to feed it more source content."
function QueueStatusCard({ v }) {
  const low = v.draftsRemaining !== undefined && v.daysLeft <= 7 && v.daysLeft > 0;
  const empty = v.draftsRemaining === 0;
  return (
    <div className={`rounded-2xl border p-4 ${empty ? "border-red-200 bg-red-50" : low ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-800">{v.categoryName || v.vertical}</p>
        <span className="text-[11px] text-gray-400">by {v.author}</span>
      </div>
      {v.error ? (
        <p className="text-xs text-red-500">{v.error}</p>
      ) : (
        <>
          <p className={`text-2xl font-bold ${empty ? "text-red-600" : low ? "text-amber-600" : "text-gray-800"}`}>
            {v.daysLeft} {v.daysLeft === 1 ? "day" : "days"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {v.draftsRemaining} drafts left · {v.perDay}/day
          </p>
          {v.runsOutOn && (
            <p className="text-[11px] text-gray-400 mt-1">
              Runs out ~{new Date(v.runsOutOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          {empty && <p className="text-[11px] text-red-500 mt-1 font-medium">Queue empty — add more source posts</p>}
        </>
      )}
    </div>
  );
}

export default function BlogPostsList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueStatus, setQueueStatus] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchAllBlogPosts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchBlogQueueStatus().then(setQueueStatus).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await deleteBlogPost(id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Blog Posts</h2>
        <button onClick={() => navigate("/blog-posts/new")} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Add Blog Post
        </button>
      </div>

      {queueStatus && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Automated daily publish queue — {queueStatus.perDayTotal}/day total
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {queueStatus.verticals.map((v) => (
              <QueueStatusCard key={v.vertical} v={v} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-gray-500">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-gray-400 text-sm">No posts yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Author</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.title}</div>
                    <div className="text-gray-400 text-xs">/blog/{p.category?.slug}/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.category?.name || "—"}
                    {p.additionalCategories?.length > 0 && (
                      <span className="text-gray-400"> +{p.additionalCategories.length}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.authorName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => navigate(`/blog-posts/${p._id}/edit`)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
