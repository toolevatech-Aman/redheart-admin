import React, { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, Copy, Check, ExternalLink, IndianRupee, X } from "lucide-react";
import { fetchInvitations, fetchInvitationStats, fetchInvitation, setInvitationDisabled } from "../../service/invitationAdmin";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : "—");
const STATE_STYLE = { paid: "bg-green-100 text-green-800", ended: "bg-gray-200 text-gray-700", keepsake: "bg-amber-100 text-amber-800", disabled: "bg-red-100 text-red-700", draft: "bg-blue-100 text-blue-700" };
const STATE_LABEL = { paid: "Live", ended: "Ended", keepsake: "Keepsake", disabled: "Disabled", draft: "Draft (unpaid)" };
const STATES = [["", "All paid"], ["active", "Live"], ["ended", "Ended"], ["keepsake", "Keepsake"], ["disabled", "Disabled"], ["draft", "Drafts (unpaid)"]];

const CopyBtn = ({ text }) => {
  const [ok, setOk] = useState(false);
  return (
    <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline" onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }}>
      {ok ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy link</>}
    </button>
  );
};

const Badge = ({ state }) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_STYLE[state] || "bg-gray-100"}`}>{STATE_LABEL[state] || state}</span>;

const InvitationsPage = () => {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [list, st] = await Promise.all([fetchInvitations({ page, limit: 20, search, state, plan }), fetchInvitationStats()]);
      setRows(list.invitations || []); setTotal(list.total || 0); setPages(list.totalPages || 1); setStats(st);
    } catch (e) { setError(e?.response?.data?.message || "Could not load invitations"); }
    setLoading(false);
  }, [page, search, state, plan]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const show = async (publicId) => { try { setOpen((await fetchInvitation(publicId)).invitation); } catch { setError("Could not open that invitation"); } };
  const toggle = async () => {
    if (!open) return;
    const disable = open.state !== "disabled";
    if (!window.confirm(disable ? "Disable this invitation? Guests will see a 'not available' page." : "Enable this invitation again?")) return;
    setBusy(true);
    try { await setInvitationDisabled(open.publicId, disable); await show(open.publicId); await load(); } catch { setError("Could not update the invitation"); }
    setBusy(false);
  };

  const Card = ({ label, value }) => (<div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-semibold mt-1">{value}</p></div>);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-2xl font-bold">Invitations</h1><p className="text-sm text-gray-500">Wedding invitations made in the Invitation Maker.</p></div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <Card label="Paid invitations" value={stats.paid} />
          <Card label="Live now" value={stats.active} />
          <Card label="Personalized" value={stats.personalized} />
          <Card label="Unpaid drafts" value={stats.drafts} />
          <Card label="Revenue (incl. GST)" value={inr(stats.revenue)} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search email, phone, names or link ID" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={state} onChange={(e) => { setPage(1); setState(e.target.value); }} className="border rounded-lg px-3 py-2 text-sm">{STATES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={plan} onChange={(e) => { setPage(1); setPlan(e.target.value); }} className="border rounded-lg px-3 py-2 text-sm"><option value="">All plans</option><option value="standard">Standard</option><option value="personalized">Personalized</option></select>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="p-3">Created</th><th className="p-3">Couple</th><th className="p-3">Buyer</th><th className="p-3">Plan</th><th className="p-3">Paid</th><th className="p-3">Event</th><th className="p-3">Status</th><th className="p-3">Link</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-6 text-center text-gray-500">Loading…</td></tr>}
            {!loading && !rows.length && <tr><td colSpan={8} className="p-6 text-center text-gray-500">No invitations yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.publicId} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => show(r.publicId)}>
                <td className="p-3 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                <td className="p-3">{r.couple || "—"}<div className="text-xs text-gray-500">{r.city}</div></td>
                <td className="p-3"><div>{r.email || "—"}</div><div className="text-xs text-gray-500">{r.phone}</div></td>
                <td className="p-3 whitespace-nowrap">{r.plan === "personalized" ? `Personalized (${r.guestSlots})` : "Standard"}{r.lifetime && <div className="text-xs text-amber-700">Forever</div>}</td>
                <td className="p-3 whitespace-nowrap">{inr(r.amountPaid)}</td>
                <td className="p-3 whitespace-nowrap">{fmtDate(r.eventDate)}</td>
                <td className="p-3"><Badge state={r.state} /></td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}><div className="flex flex-col gap-1"><CopyBtn text={r.link} /><a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><ExternalLink className="w-3 h-3" /> Open</a></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <span>{total} invitation{total === 1 ? "" : "s"}</span>
        <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button><span className="py-1">Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button></div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setOpen(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3"><div><h2 className="text-lg font-semibold">{open.couple || "Invitation"}</h2><Badge state={open.state} /></div><button onClick={() => setOpen(null)}><X className="w-5 h-5" /></button></div>
            <dl className="text-sm space-y-2">
              {[["Guest link", <span className="break-all">{open.link} <CopyBtn text={open.link} /></span>], ["Buyer email", open.email || "—"], ["Buyer phone", open.phone || "—"], ["Plan", open.plan === "personalized" ? `Personalized, ${open.guestSlots} guest slots` : "Standard"], ["Online forever", open.lifetime ? "Yes" : "No"], ["Created", fmtDateTime(open.createdAt)], ["Published", fmtDateTime(open.publishedAt)], ["Event date", fmtDate(open.eventDate)], ["Link ends", fmtDate(open.expiresAt)], ["City", open.city || "—"], ["Photos", open.photos], ["Guests added / replied", `${open.guests} / ${open.replied}`], ["Page views", open.views], ["Edits by buyer", open.editCount]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-gray-500">{k}</dt><dd className="text-right">{v}</dd></div>
              ))}
            </dl>
            <h3 className="font-medium mt-5 mb-2 flex items-center gap-1"><IndianRupee className="w-4 h-4" /> Payments ({inr(open.amountPaid)})</h3>
            {(open.payments || []).length === 0 && <p className="text-sm text-gray-500">No payment recorded.</p>}
            {(open.payments || []).map((p, i) => (<div key={i} className="text-xs border rounded p-2 mb-2"><div className="flex justify-between"><b>{inr(p.amount)}</b><span>{p.kind || "purchase"}{p.plan ? ` · ${p.plan}` : ""}</span></div><div className="text-gray-500 break-all">{p.paymentId || p.orderId}</div><div className="text-gray-500">{fmtDateTime(p.at)}</div></div>))}
            {open.state !== "draft" && <button disabled={busy} onClick={toggle} className={`mt-5 w-full py-2 rounded-lg text-white text-sm ${open.state === "disabled" ? "bg-green-600" : "bg-red-600"} disabled:opacity-50`}>{open.state === "disabled" ? "Enable this invitation" : "Disable this invitation"}</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
