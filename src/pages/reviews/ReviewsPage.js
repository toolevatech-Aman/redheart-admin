import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Star, ExternalLink, Check, X, BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { listReviews, moderateReview, bulkModerateReviews, deleteReview, bulkDeleteReviews } from "../../service/reviews";

const TABS = ["pending", "approved", "rejected"];
const TAB_STYLE = { pending: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };
const SITE = "https://www.redheart.in";
const CAT_PATH = { Flowers: "flowers", Cakes: "cakes", Plants: "plants" };
const PAGE_SIZE = 25;

const fmt = (d) => {
  const date = d ? new Date(d) : null;
  return date && !isNaN(date) ? date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
};
const productUrl = (p) => `${SITE}/p/${CAT_PATH[p.category] || "flowers"}/${p.slug}`;

const Stars = ({ n }) => (
  <span className="inline-flex" aria-label={`${n} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-4 h-4 ${i <= n ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />)}
  </span>
);

const ReviewsPage = () => {
  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ reviews: [], counts: { pending: 0, approved: 0, rejected: 0 }, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null); // { id, name, comment }

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await listReviews({ status: tab, q: query, page, limit: PAGE_SIZE });
      if (res.success) { setData(res); setSelected(new Set()); } else setError("Could not load reviews");
    } catch (e) { console.error(e); setError("Something went wrong while loading reviews"); }
    setLoading(false);
  }, [tab, query, page]);
  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    setBusy(true);
    try { const r = await moderateReview(id, { status }); if (!r.success) alert("Could not update the review"); }
    catch (e) { console.error(e); alert("Something went wrong while updating the review"); }
    setBusy(false); load();
  };
  const toggleVerified = async (review) => {
    setBusy(true);
    try { const r = await moderateReview(review.id, { verified: !review.verified }); if (!r.success) alert("Could not update verification"); }
    catch (e) { console.error(e); alert("Something went wrong while updating verification"); }
    setBusy(false); load();
  };
  const bulk = async (status) => {
    if (!selected.size) return;
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} ${selected.size} review${selected.size === 1 ? "" : "s"}?`)) return;
    setBusy(true);
    try { const r = await bulkModerateReviews([...selected], status); if (!r.success) alert("Could not update the reviews"); }
    catch (e) { console.error(e); alert("Something went wrong while updating the reviews"); }
    setBusy(false); load();
  };
  const remove = async (r) => {
    if (!window.confirm(`Permanently delete this review by ${r.name || "Customer"}?\n\nThis cannot be undone. (Use Reject if you only want to hide it.)`)) return;
    setBusy(true);
    try { const res = await deleteReview(r.id); if (!res.success) alert("Could not delete the review"); }
    catch (e) { console.error(e); alert("Something went wrong while deleting the review"); }
    setBusy(false); load();
  };
  const bulkRemove = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Permanently delete ${selected.size} review${selected.size === 1 ? "" : "s"}?\n\nThis cannot be undone. (Use Reject if you only want to hide them.)`)) return;
    setBusy(true);
    try { const res = await bulkDeleteReviews([...selected]); if (!res.success) alert("Could not delete the reviews"); }
    catch (e) { console.error(e); alert("Something went wrong while deleting the reviews"); }
    setBusy(false); load();
  };
  const saveEdit = async () => {
    setBusy(true);
    try {
      const r = await moderateReview(editing.id, { name: editing.name, comment: editing.comment });
      if (!r.success) alert("Could not save the changes"); else setEditing(null);
    } catch (e) { console.error(e); alert("Something went wrong while saving"); }
    setBusy(false); load();
  };
  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const pages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
  const allOn = data.reviews.length > 0 && data.reviews.every((r) => selected.has(r.id));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star className="w-6 h-6 text-amber-500" /> Product Reviews</h2>
          <p className="text-xs text-gray-400 mt-0.5">New customer reviews wait here. A review goes live on the website only after you approve it.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${tab === t ? "bg-gray-800 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"}`}>
            {t} ({data.counts?.[t] ?? 0})
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(q.trim()); }} className="ml-auto">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, product, SKU, text…" className="px-3 py-1.5 border border-gray-300 rounded-full text-xs bg-white w-64" />
        </form>
      </div>

      {data.reviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
          <label className="flex items-center gap-2 text-gray-600"><input type="checkbox" checked={allOn} onChange={() => setSelected(allOn ? new Set() : new Set(data.reviews.map((r) => r.id)))} /> Select all on this page</label>
          {selected.size > 0 && (
            <>
              <span className="text-gray-400">{selected.size} selected</span>
              {tab !== "approved" && <button disabled={busy} onClick={() => bulk("approved")} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg disabled:opacity-60">Approve selected</button>}
              {tab !== "rejected" && <button disabled={busy} onClick={() => bulk("rejected")} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-60">Reject selected</button>}
              <button disabled={busy} onClick={bulkRemove} className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg disabled:opacity-60"><Trash2 className="w-3.5 h-3.5" /> Delete selected</button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500"><RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />Loading reviews…</div>
      ) : error ? (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      ) : data.reviews.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 text-center text-gray-400 shadow-sm border border-gray-100"><p className="text-4xl mb-3">⭐</p><p>No {tab} reviews{query ? " for this search" : ""}</p></div>
      ) : (
        <div className="space-y-3">
          {data.reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1.5" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label="Select review" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Stars n={r.rating} />
                    <span className="font-semibold text-gray-900">{r.name || "Customer"}</span>
                    {r.verified && <span className="inline-flex items-center gap-1 text-xs text-green-700"><BadgeCheck className="w-3.5 h-3.5" /> Verified</span>}
                    {r.imported && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">Imported</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${TAB_STYLE[r.status]}`}>{r.status}</span>
                    <span className="text-xs text-gray-400 ml-auto">{fmt(r.date)}</span>
                  </div>
                  <a href={productUrl(r.product)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600">
                    {r.product.name} · {r.product.sku} <ExternalLink className="w-3 h-3" />
                  </a>
                  {editing?.id === r.id ? (
                    <div className="mt-2 space-y-2">
                      <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Reviewer name" />
                      <textarea rows={3} value={editing.comment} onChange={(e) => setEditing({ ...editing, comment: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      <div className="flex gap-2">
                        <button disabled={busy} onClick={saveEdit} className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg disabled:opacity-60">Save changes</button>
                        <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-line break-words">{r.comment}</p>
                  )}
                  {r.moderatedBy && <p className="mt-1.5 text-[11px] text-gray-400">{r.status === "approved" ? "Approved" : "Decided"} by {r.moderatedBy} · {fmt(r.moderatedAt)}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 pl-7">
                {r.status !== "approved" && <button disabled={busy} onClick={() => act(r.id, "approved")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg disabled:opacity-60"><Check className="w-3.5 h-3.5" /> Approve</button>}
                {r.status !== "rejected" && <button disabled={busy} onClick={() => act(r.id, "rejected")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-60"><X className="w-3.5 h-3.5" /> Reject</button>}
                {r.status === "approved" && <button disabled={busy} onClick={() => act(r.id, "pending")} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg disabled:opacity-60">Move back to pending</button>}
                <button disabled={busy} onClick={() => toggleVerified(r)} className={`inline-flex items-center gap-1 px-3 py-1.5 border text-xs font-semibold rounded-lg disabled:opacity-60 ${r.verified ? "border-green-300 text-green-700" : "border-gray-300 text-gray-600"}`}><BadgeCheck className="w-3 h-3" /> {r.verified ? "Remove verified" : "Mark verified"}</button>
                <button disabled={busy} onClick={() => remove(r)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded-lg disabled:opacity-60"><Trash2 className="w-3 h-3" /> Delete</button>
                {editing?.id !== r.id && <button onClick={() => setEditing({ id: r.id, name: r.name, comment: r.comment })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg"><Pencil className="w-3 h-3" /> Edit wording</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40">Previous</button>
          <span className="text-gray-500">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
