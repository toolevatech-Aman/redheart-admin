import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllBlogPosts, deleteBlogPost } from "../../service/blogService";

export default function BlogPostsList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchAllBlogPosts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
                  <td className="px-4 py-3 text-gray-600">{p.category?.name || "—"}</td>
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
