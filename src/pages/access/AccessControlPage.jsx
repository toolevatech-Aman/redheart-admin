import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Shield, ShieldCheck, UserMinus, RefreshCw, Mail } from "lucide-react";
import { fetchAdmins, searchUsersForAccess, updateUserAccess } from "../../service/accessControl";
import { ACCESS_LEVELS, ACCESS_LEVEL_LABELS } from "../../constants/accessControl";

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const LEVEL_COLORS = {
  overall: "bg-red-100 text-red-700 border-red-200",
  seo: "bg-blue-100 text-blue-700 border-blue-200",
  category: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function Avatar({ user }) {
  return user.avatar ? (
    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold shrink-0">
      {(user.name || user.email || "?")[0].toUpperCase()}
    </div>
  );
}

function LevelBadge({ level }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${LEVEL_COLORS[level] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {level}
    </span>
  );
}

export default function AccessControlPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdmins();
      setAdmins(res.data || []);
    } catch (err) {
      console.error("Failed to load admins", err);
      setError("Failed to load admins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const grouped = useMemo(() => {
    const g = { overall: [], seo: [], category: [] };
    admins.forEach((a) => { (g[a.accessLevel] || g.overall).push(a); });
    return g;
  }, [admins]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await searchUsersForAccess(q);
      setResults(res.data || []);
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const grantAccess = async (user, accessLevel) => {
    setBusyId(user.userId);
    try {
      await updateUserAccess(user.userId, { role: "admin", accessLevel });
      setResults((prev) => prev.map((u) => (u.userId === user.userId ? { ...u, role: "admin", accessLevel } : u)));
      await loadAdmins();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to grant access.");
    } finally {
      setBusyId(null);
    }
  };

  const changeLevel = async (admin, accessLevel) => {
    setBusyId(admin.userId);
    try {
      await updateUserAccess(admin.userId, { accessLevel });
      setAdmins((prev) => prev.map((a) => (a.userId === admin.userId ? { ...a, accessLevel } : a)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update access level.");
    } finally {
      setBusyId(null);
    }
  };

  const revokeAccess = async (admin) => {
    if (!window.confirm(`Remove admin access for ${admin.name || admin.email}? They'll go back to a regular user account.`)) return;
    setBusyId(admin.userId);
    try {
      await updateUserAccess(admin.userId, { role: "user" });
      setAdmins((prev) => prev.filter((a) => a.userId !== admin.userId));
      setResults((prev) => prev.map((u) => (u.userId === admin.userId ? { ...u, role: "user" } : u)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to revoke access.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-600" /> Access Control
        </h2>
        <button onClick={loadAdmins} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Grant restricted admin access to an email, and manage everyone who currently has it.
      </p>

      {/* ── Grant access ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Grant Access</h3>
        <p className="text-xs text-gray-500 mb-3">
          The person must have signed into the admin panel at least once (even if it showed "Access denied")
          before you can find them here — that's what creates their account.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or name…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <button type="submit" disabled={searching} className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {searched && !searching && results.length === 0 && (
          <p className="text-sm text-gray-400">
            No account found for "{query}". They need to sign in to the admin panel once first.
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((u) => (
              <div key={u.userId} className="flex flex-wrap items-center gap-3 border border-gray-200 rounded-lg p-3">
                <Avatar user={u} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{u.name || <span className="italic text-gray-400">No name</span>}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {u.email || "—"}</p>
                </div>
                {u.role === "admin" ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <LevelBadge level={u.accessLevel || "overall"} />
                    <span className="text-xs text-gray-400">already an admin</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {ACCESS_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => grantAccess(u, lvl)}
                        disabled={busyId === u.userId}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Make {ACCESS_LEVEL_LABELS[lvl].split(" ")[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Current admins, grouped by level ──────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mb-2 text-red-500" /> Loading admins…
        </div>
      ) : error ? (
        <div className="max-w-lg mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={loadAdmins} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      ) : (
        <div className="space-y-6">
          {ACCESS_LEVELS.map((level) => (
            <div key={level} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-800">{ACCESS_LEVEL_LABELS[level]}</h3>
                <span className="text-xs text-gray-400">({grouped[level].length})</span>
              </div>
              {grouped[level].length === 0 ? (
                <p className="text-xs text-gray-400">No admins at this level.</p>
              ) : (
                <div className="space-y-2">
                  {grouped[level].map((a) => (
                    <div key={a.userId} className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-lg p-3">
                      <Avatar user={a} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{a.name || <span className="italic text-gray-400">No name</span>}</p>
                        <p className="text-xs text-gray-500 truncate">{a.email} · admin since {fmtDate(a.createdAt)}</p>
                      </div>
                      <select
                        value={a.accessLevel || "overall"}
                        disabled={busyId === a.userId}
                        onChange={(e) => changeLevel(a, e.target.value)}
                        className="text-xs font-medium border border-gray-300 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
                      >
                        {ACCESS_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>{ACCESS_LEVEL_LABELS[lvl]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => revokeAccess(a)}
                        disabled={busyId === a.userId}
                        title="Remove admin access"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
