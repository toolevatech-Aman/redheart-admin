import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Phone, Mail, ExternalLink, Store } from "lucide-react";
import { fetchBakeryClaims, updateBakeryClaim } from "../../service/bakeryClaims";

const STATUSES = ["new", "contacted", "verified", "active", "rejected"];
const STATUS_STYLES = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  verified: "bg-purple-100 text-purple-700",
  active: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
const PLAN_LABEL = { "": "—", free: "Free listing", basic: "Basic ₹99/mo", pro: "Pro ₹199/mo" };
const SITE = "https://www.redheart.in";

const fmt = (d) => {
  const date = d ? new Date(d) : null;
  return date && !isNaN(date) ? date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
};

const BakeryClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("new");
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [notes, setNotes] = useState({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchBakeryClaims();
      if (res.success) setClaims(res.data || []); else setError("Failed to fetch claims");
    } catch (e) { console.error(e); setError("Something went wrong while fetching claims"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (id, data) => {
    setSavingId(id);
    try {
      const res = await updateBakeryClaim(id, data);
      if (res.success) setClaims((prev) => prev.map((c) => ((c.id || c._id) === id ? { ...c, ...data } : c)));
      else alert("Failed to update");
    } catch (e) { console.error(e); alert("Something went wrong while updating"); }
    setSavingId(null);
  };

  const counts = useMemo(() => {
    const o = { all: claims.length };
    STATUSES.forEach((s) => { o[s] = claims.filter((c) => (c.status || "new") === s).length; });
    return o;
  }, [claims]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return claims.filter((c) => (filter === "all" || (c.status || "new") === filter) &&
      (!t || [c.shopName, c.ownerName, c.phone, c.email, c.shopCity].some((v) => (v || "").toLowerCase().includes(t))));
  }, [claims, filter, q]);

  if (loading) return <div className="flex flex-col items-center justify-center py-24 text-gray-500"><RefreshCw className="w-8 h-8 animate-spin mb-3 text-rose-500" />Loading claims…</div>;
  if (error) return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
      <p className="text-red-700 mb-4">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Store className="w-6 h-6 text-rose-500" /> Bakery Claims</h2>
          <p className="text-xs text-gray-400 mt-0.5">Bakery owners who asked to claim or activate their listing on the cake-shop pages</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {["all", ...STATUSES].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${filter === f ? "bg-gray-800 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"}`}>{f} ({counts[f]})</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shop, name, phone…" className="ml-auto px-3 py-1.5 border border-gray-300 rounded-full text-xs bg-white w-56" />
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 text-center text-gray-400 shadow-sm border border-gray-100"><p className="text-4xl mb-3">🧁</p><p>No claims here</p></div>
      ) : (
        <div className="space-y-4">
          {rows.map((c) => {
            const id = c.id || c._id; const status = c.status || "new";
            return (
              <div key={id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[status]}`}>{status}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{PLAN_LABEL[c.plan || ""]}</span>
                  <span className="text-xs text-gray-400 ml-auto">{fmt(c.createdAt)}</span>
                </div>
                <a href={`${SITE}/cake-shop/${c.shopCity}/${c.shopSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-lg font-semibold text-gray-900 hover:text-rose-600">
                  {c.shopName || c.shopSlug} <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-gray-500 capitalize">{c.shopCity}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-700">
                  <span className="font-medium">{c.ownerName} <span className="text-gray-400 capitalize">({c.role || "owner"})</span></span>
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Phone className="w-3.5 h-3.5" /> {c.phone}</a>
                  <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">WhatsApp</a>
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Mail className="w-3.5 h-3.5" /> {c.email}</a>}
                </div>
                {c.message && <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-line">{c.message}</p>}
                <div className="mt-4 flex flex-wrap items-start gap-3">
                  <select value={status} disabled={savingId === id} onChange={(e) => save(id, { status: e.target.value })} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <textarea rows={1} placeholder="Follow-up notes" defaultValue={c.notes || ""} onChange={(e) => setNotes((n) => ({ ...n, [id]: e.target.value }))} className="flex-1 min-w-[200px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  {notes[id] !== undefined && notes[id] !== (c.notes || "") && (
                    <button onClick={() => save(id, { notes: notes[id] })} disabled={savingId === id} className="px-4 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg">Save note</button>
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

export default BakeryClaimsPage;
