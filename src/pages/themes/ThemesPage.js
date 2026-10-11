import React, { useEffect, useState } from "react";
import { Palette, RefreshCw, Trash2, Pencil } from "lucide-react";
import { fetchThemes, createTheme, updateTheme, removeTheme, previewThemeColour } from "../../service/themes";

const EMPTY = {
  name: "", primary: "#0f766e", announcementText: "", annBg: "#111111", annColor: "#ffffff",
  startsAt: "", endsAt: "", isEnabled: false,
};
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const STATUS_STYLE = {
  live: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  ended: "bg-gray-100 text-gray-500",
  off: "bg-gray-100 text-gray-500",
};

// Dates are typed and shown in IST, whatever timezone this browser is in.
const IST_OFFSET_MIN = 330;
const toIso = (local) => (local ? `${local}:00+05:30` : null);
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MIN * 60000);
  return d.toISOString().slice(0, 16);
};
const showIst = (iso) => (iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "—");
const rgb = (s) => `rgb(${s.split(" ").join(",")})`;

const Swatches = ({ scale }) => (
  <div className="flex rounded-lg overflow-hidden border border-gray-200">
    {STEPS.map((s) => (
      <div key={s} title={String(s)} className="h-7 flex-1" style={{ background: rgb(scale[s]) }} />
    ))}
  </div>
);

const ThemesPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchThemes();
      setRows(r.success ? r.data : []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching themes");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Live palette + contrast for the colour being picked.
  useEffect(() => {
    if (!/^#[0-9a-fA-F]{6}$/.test(form.primary)) { setPreview(null); return undefined; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await previewThemeColour(form.primary);
        if (!cancelled && r.success) setPreview(r);
      } catch { if (!cancelled) setPreview(null); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [form.primary]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Give the theme a name, e.g. Diwali 2026");
    if (!/^#[0-9a-fA-F]{6}$/.test(form.primary)) return alert("Main colour must be a hex colour like #0f766e");
    if (form.startsAt && form.endsAt && form.endsAt <= form.startsAt) return alert("End must be after start");
    const body = {
      name: form.name.trim(),
      primary: form.primary,
      announcement: { text: form.announcementText, bg: form.annBg, color: form.annColor },
      startsAt: toIso(form.startsAt),
      endsAt: toIso(form.endsAt),
      isEnabled: form.isEnabled,
    };
    setSaving(true);
    try {
      if (editingId) await updateTheme(editingId, body);
      else await createTheme(body);
      setForm(EMPTY);
      setEditingId(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save theme");
    }
    setSaving(false);
  };

  const handleEdit = (t) => {
    setForm({
      name: t.name, primary: t.primary,
      announcementText: t.announcement?.text || "",
      annBg: t.announcement?.bg || "#111111", annColor: t.announcement?.color || "#ffffff",
      startsAt: toLocalInput(t.startsAt), endsAt: toLocalInput(t.endsAt), isEnabled: !!t.isEnabled,
    });
    setEditingId(t._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (t) => {
    try {
      await updateTheme(t._id, {
        name: t.name, primary: t.primary, announcement: t.announcement,
        startsAt: t.startsAt, endsAt: t.endsAt, isEnabled: !t.isEnabled,
      });
      await load();
    } catch (err) { alert(err?.response?.data?.message || "Failed to update theme"); }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete the theme "${t.name}"?`)) return;
    try { await removeTheme(t._id); await load(); }
    catch { alert("Failed to delete theme"); }
  };

  const lowContrast = preview && preview.contrast < 4.5;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-rose-500" /> Site Themes
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Pick one main colour and the whole storefront recolours (buttons, badges, highlights). Add an optional banner line above the header. Changes reach customers within about 6 minutes. If nothing is live, the site keeps its normal colours.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Theme name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Diwali 2026"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Main colour</label>
          <div className="flex gap-2">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.primary) ? form.primary : "#000000"} onChange={(e) => set("primary", e.target.value)}
              className="h-10 w-12 p-0.5 border border-gray-300 rounded-lg cursor-pointer" />
            <input value={form.primary} onChange={(e) => set("primary", e.target.value)} placeholder="#0f766e"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:border-rose-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Palette preview</label>
          {preview ? <Swatches scale={preview.scale} /> : <div className="h-7 rounded-lg bg-gray-50 border border-gray-200" />}
          {preview && (
            <p className={`text-[11px] mt-1 ${lowContrast ? "text-amber-600" : "text-gray-400"}`}>
              White text on this colour: contrast {Number(preview.contrast).toFixed(1)}
              {preview.contrast < 3 ? " — too light, will be rejected" : lowContrast ? " — readable but on the light side" : " — good"}
            </p>
          )}
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Banner line above the header (optional, max 120 characters, text only)</label>
          <input value={form.announcementText} maxLength={120} onChange={(e) => set("announcementText", e.target.value)}
            placeholder="e.g. Diwali Sale: free delivery on orders above ₹999"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400" />
        </div>
        {form.announcementText.trim() && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Banner background</label>
              <input type="color" value={form.annBg} onChange={(e) => set("annBg", e.target.value)} className="h-10 w-full p-0.5 border border-gray-300 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Banner text colour</label>
              <input type="color" value={form.annColor} onChange={(e) => set("annColor", e.target.value)} className="h-10 w-full p-0.5 border border-gray-300 rounded-lg cursor-pointer" />
            </div>
            <div className="flex items-end">
              <div className="w-full text-center rounded-lg px-3 py-2 text-[13px] font-semibold truncate" style={{ background: form.annBg, color: form.annColor }}>
                {form.announcementText}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Starts (IST, optional)</label>
          <input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ends (IST, optional)</label>
          <input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-400" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700 pb-2.5">
            <input type="checkbox" checked={form.isEnabled} onChange={(e) => set("isEnabled", e.target.checked)} /> Switched on
          </label>
        </div>

        <div className="md:col-span-3 flex justify-end gap-2">
          {(editingId || form.name) && (
            <button type="button" onClick={() => { setForm(EMPTY); setEditingId(null); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              {editingId ? "Cancel" : "Clear"}
            </button>
          )}
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update theme" : "Add theme"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && !rows.length ? (
          <p className="text-center py-10 text-gray-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No themes yet. The site is using its normal colours.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                  <th className="px-5 py-3">Theme</th>
                  <th className="px-5 py-3">Palette</th>
                  <th className="px-5 py-3">Banner</th>
                  <th className="px-5 py-3">Window (IST)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t._id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-800">{t.name}</td>
                    <td className="px-5 py-3 min-w-[180px]">{t.scale && <Swatches scale={t.scale} />}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-[220px] truncate" title={t.announcement?.text}>{t.announcement?.text || "—"}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{showIst(t.startsAt)} → {showIst(t.endsAt)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleToggle(t)} title={t.isEnabled ? "Switch off" : "Switch on"}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_STYLE[t.status] || STATUS_STYLE.off}`}>
                        {t.status}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(t)} title="Edit" className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t)} title="Delete" className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemesPage;
