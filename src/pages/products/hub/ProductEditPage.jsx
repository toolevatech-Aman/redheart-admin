import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Save, Undo2, Plus, Trash2, Upload, Star, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { getProductForEdit, saveProduct, uploadProductImage, liveUrl, inr } from "../../../service/productHub";
import { toForm, toPayload, changedKeys, TAB_OF, emptyVariation, emptyAddOn, discountPct, marginPct } from "./productForm";

const TABS = [["basics", "Basics"], ["price", "Price & stock"], ["images", "Images"], ["details", "Details"], ["care", "Care & delivery"], ["history", "History"]];
const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:bg-gray-50";

function Field({ label, hint, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}
const Card = ({ title, subtitle, children }) => (
  <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5 mb-3">{subtitle}</p>}
    <div className={subtitle ? "" : "mt-3"}>{children}</div>
  </section>
);
const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-rose-600" />
    <span><span className="block text-sm font-medium text-gray-800">{label}</span>{hint && <span className="block text-xs text-gray-500">{hint}</span>}</span>
  </label>
);

export default function ProductEditPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [base, setBase] = useState(null);
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState("basics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);       // { ok, text, warnings, changes }
  const [confirmUrl, setConfirmUrl] = useState(false);
  const [upload, setUpload] = useState({ busy: false, pct: 0, error: "" });
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef(null);
  const targetRef = useRef("gallery");              // "main" or "gallery": where the next upload goes

  const load = useCallback(() => {
    setLoading(true); setError("");
    getProductForEdit(productId)
      .then((d) => { setProduct(d.product); const f = toForm(d.product); setBase(f); setForm(f); })
      .catch((e) => setError(e?.response?.status === 404 ? "This product doesn't exist (it may have been deleted)." : e?.response?.data?.message || "Could not load the product."))
      .finally(() => setLoading(false));
  }, [productId]);
  useEffect(() => { load(); }, [load]);

  const dirty = useMemo(() => (form && base ? changedKeys(form, base) : []), [form, base]);
  const dirtyTabs = useMemo(() => new Set(dirty.map((k) => TAB_OF[k])), [dirty]);
  useEffect(() => {
    if (!dirty.length) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setRow = (key, i, patch) => setForm((f) => ({ ...f, [key]: f[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const goBack = () => { if (dirty.length && !window.confirm("You have unsaved changes. Leave without saving?")) return; navigate("/products"); };

  async function doSave(confirmed = false) {
    const body = toPayload(form, base);
    if (!Object.keys(body).length) return;
    if (!confirmed && (body.slug !== undefined || body.sku !== undefined)) { setConfirmUrl(true); return; }
    setConfirmUrl(false); setSaving(true); setBanner(null);
    try {
      const d = await saveProduct(productId, { ...body, ...(confirmed ? { confirmUrlChange: true } : {}) });
      setProduct(d.product); const f = toForm(d.product); setBase(f); setForm(f);
      setBanner({ ok: true, text: d.unchanged ? "Nothing had changed." : "Saved. The website will show this shortly.", warnings: d.warnings || [], changes: d.changes || [] });
    } catch (e) {
      const r = e?.response?.data;
      if (r?.needsConfirm === "url") setConfirmUrl(true);
      else setBanner({ ok: false, text: r?.message || "Could not save. Check your connection and try again.", warnings: [], changes: [] });
    }
    setSaving(false);
  }

  async function onFiles(files) {
    const list = [...files]; if (!list.length) return;
    setUpload({ busy: true, pct: 0, error: "" });
    try {
      for (const file of list) {
        const url = await uploadProductImage(product.product_id, file, (pct) => setUpload((u) => ({ ...u, pct })));
        setForm((f) => (targetRef.current === "main" || !f.primary_image_url ? { ...f, primary_image_url: url } : { ...f, gallery_images: [...f.gallery_images, url] }));
        targetRef.current = "gallery";
      }
      setUpload({ busy: false, pct: 100, error: "" });
    } catch (e) { setUpload({ busy: false, pct: 0, error: e?.message || "Upload failed. Try again." }); }
    if (fileRef.current) fileRef.current.value = "";
  }
  const pick = (target) => { targetRef.current = target; fileRef.current?.click(); };
  const moveImg = (i, d) => setForm((f) => { const g = [...f.gallery_images]; const j = i + d; if (j < 0 || j >= g.length) return f; [g[i], g[j]] = [g[j], g[i]]; return { ...f, gallery_images: g }; });
  const makeMain = (i) => setForm((f) => { const g = [...f.gallery_images]; const [u] = g.splice(i, 1); if (f.primary_image_url) g.unshift(f.primary_image_url); return { ...f, primary_image_url: u, gallery_images: g }; });
  const addUrl = () => { const u = urlDraft.trim(); if (!/^https?:\/\//i.test(u)) { setUpload((x) => ({ ...x, error: "Paste a full image address starting with https://" })); return; } setUpload((x) => ({ ...x, error: "" })); setForm((f) => (f.primary_image_url ? { ...f, gallery_images: [...f.gallery_images, u] } : { ...f, primary_image_url: u })); setUrlDraft(""); };

  if (loading) return <div className="flex items-center justify-center py-24 text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mr-2 text-rose-500" /> Loading product…</div>;
  if (error) return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <p className="text-gray-700 mb-4" role="alert">{error}</p>
      <button onClick={() => navigate("/products")} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold">Back to all products</button>
    </div>
  );

  const sellWarn = Number(form.selling_price) > Number(form.original_price) && form.original_price !== "";
  const costWarn = form.costing_price !== "" && Number(form.selling_price) < Number(form.costing_price);
  const skuChanged = form.sku !== base.sku;
  const slugChanged = form.slug !== base.slug;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
      <button onClick={goBack} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-rose-600 mb-3"><ArrowLeft className="w-4 h-4" /> All products</button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{base.name || "Untitled product"}</h1>
          <p className="text-sm text-gray-500">ID {product.product_id} · {product.categorization?.category_name}{base.subcategory_name ? ` · ${base.subcategory_name}` : ""} · {product.metrics?.review_count || 0} reviews · ordered {product.metrics?.times_ordered || 0} times</p>
        </div>
        <a href={liveUrl(product)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><ExternalLink className="w-4 h-4" /> View on website</a>
      </div>

      {banner && (
        <div role={banner.ok ? "status" : "alert"} className={`mb-4 rounded-xl border p-3 text-sm ${banner.ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}>
          <p className="flex items-center gap-2 font-medium">{banner.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{banner.text}</p>
          {banner.changes.length > 0 && <ul className="list-disc ml-9 mt-1 text-xs">{banner.changes.map((c, i) => <li key={i}>{c.field.replace(/\./g, " › ").replace(/_/g, " ")}{c.detail?.length ? `: ${c.detail.join("; ")}` : ""}</li>)}</ul>}
          {banner.warnings.map((w, i) => <p key={i} className="mt-1 ml-6 text-amber-700 flex items-start gap-1"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{w}</p>)}
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-5" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${tab === id ? "border-rose-600 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
            {label}{dirtyTabs.has(id) && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-500 align-middle" title="Unsaved changes" />}
          </button>
        ))}
      </div>

      {tab === "basics" && (<>
        <Card title="Name and description" subtitle="What shoppers read on the product page and in Google results.">
          <div className="space-y-4">
            <Field label="Product title"><input className={input} value={form.name} maxLength={200} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Short summary" hint="One or two lines shown under the title and in listings."><textarea className={input} rows={2} maxLength={600} value={form.short_summary} onChange={(e) => set("short_summary", e.target.value)} /></Field>
            <Field label="Full description"><textarea className={input} rows={8} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </div>
        </Card>
        <Card title="Visibility" subtitle="Hide a product without deleting it.">
          <div className="space-y-3">
            <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Active (visible and buyable)" hint="Turn off to hide it from the website." />
            <Toggle checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" hint="Marks the product as a featured pick." />
          </div>
        </Card>
        <Card title="Product code and page address" subtitle="The website finds a product by the SKU at the end of its address. Leave these alone unless you really need to change them.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="SKU" hint="Letters and numbers only. Changing it breaks every existing link to this product."><input className={input} value={form.sku} onChange={(e) => set("sku", e.target.value.replace(/[^A-Za-z0-9]/g, ""))} /></Field>
            <Field label="Slug (readable part of the address)" hint="Lowercase letters, numbers and hyphens. Old links keep working if you change it."><input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} /></Field>
          </div>
          {skuChanged && <p className="mt-3 text-sm text-red-700 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> The SKU is changing: every existing link to this product will stop working.</p>}
          {slugChanged && !skuChanged && <p className="mt-3 text-sm text-amber-700 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> The slug is changing: the product address changes and Google&apos;s saved address will go out of date. Old links keep working.</p>}
        </Card>
      </>)}

      {tab === "price" && (<>
        <Card title="Price" subtitle="Selling price is what the customer pays. The original (MRP) price is shown crossed out when it is higher.">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Selling price (₹)"><input className={input} inputMode="decimal" value={form.selling_price} onChange={(e) => set("selling_price", e.target.value)} /></Field>
            <Field label="Original / MRP (₹)"><input className={input} inputMode="decimal" value={form.original_price} onChange={(e) => set("original_price", e.target.value)} /></Field>
            <Field label="Costing price (₹)" hint="Private. Never shown to customers."><input className={input} inputMode="decimal" value={form.costing_price} onChange={(e) => set("costing_price", e.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span className="text-gray-600">Shown as <b>{inr(form.selling_price)}</b>{discountPct(form.original_price, form.selling_price) > 0 && <> <s className="text-gray-400">{inr(form.original_price)}</s> <b className="text-green-700">{discountPct(form.original_price, form.selling_price)}% off</b></>}</span>
            {marginPct(form.costing_price, form.selling_price) !== null && <span className="text-gray-600">Margin <b className={marginPct(form.costing_price, form.selling_price) < 0 ? "text-red-600" : ""}>{marginPct(form.costing_price, form.selling_price)}%</b></span>}
          </div>
          {sellWarn && <p className="mt-2 text-sm text-amber-700 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Selling price is higher than the MRP, so no discount will show.</p>}
          {costWarn && <p className="mt-2 text-sm text-amber-700 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Selling price is below the costing price. Each sale would lose money.</p>}
        </Card>
        <Card title="Stock">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Quantity in stock"><input className={input} inputMode="numeric" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></Field>
            <Field label="Last restocked"><input type="date" className={input} value={form.last_restock_date} onChange={(e) => set("last_restock_date", e.target.value)} /></Field>
          </div>
        </Card>
        <Card title="Variations" subtitle="Sizes or weights, each with its own price and stock. The customer's cart and past orders point at these rows, so edit them rather than deleting and re-adding.">
          {form.variations.length === 0 && <p className="text-sm text-gray-500 mb-3">This product has no variations.</p>}
          <div className="space-y-3">
            {form.variations.map((v, i) => (
              <div key={v._id || `new-${i}`} className="border border-gray-200 rounded-xl p-3">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <Field label="Name" className="col-span-2"><input className={input} value={v.variant_name} onChange={(e) => setRow("variations", i, { variant_name: e.target.value })} /></Field>
                  <Field label="Selling ₹"><input className={input} inputMode="decimal" value={v.selling_price} onChange={(e) => setRow("variations", i, { selling_price: e.target.value })} /></Field>
                  <Field label="MRP ₹"><input className={input} inputMode="decimal" value={v.original_price} onChange={(e) => setRow("variations", i, { original_price: e.target.value })} /></Field>
                  <Field label="Cost ₹"><input className={input} inputMode="decimal" value={v.costing_price} onChange={(e) => setRow("variations", i, { costing_price: e.target.value })} /></Field>
                  <Field label="Stock"><input className={input} inputMode="numeric" value={v.stock} onChange={(e) => setRow("variations", i, { stock: e.target.value })} /></Field>
                  <Field label="SKU" className="col-span-2"><input className={input} value={v.variant_sku} onChange={(e) => setRow("variations", i, { variant_sku: e.target.value })} /></Field>
                  <Field label="Image address" className="col-span-2 sm:col-span-3"><input className={input} value={v.image_url} placeholder="https://…" onChange={(e) => setRow("variations", i, { image_url: e.target.value })} /></Field>
                  <div className="flex items-end justify-end"><button type="button" aria-label={`Remove variation ${v.variant_name || i + 1}`} onClick={() => { if (!v._id || window.confirm("Remove this variation? Customers can no longer buy it.")) set("variations", form.variations.filter((_, j) => j !== i)); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set("variations", [...form.variations, emptyVariation()])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600"><Plus className="w-4 h-4" /> Add a variation</button>
        </Card>
        <Card title="Add-ons" subtitle="Extras offered with this product, such as a vase or a card.">
          {form.add_ons.length === 0 && <p className="text-sm text-gray-500 mb-3">No add-ons.</p>}
          <div className="space-y-3">
            {form.add_ons.map((o, i) => (
              <div key={o._id || `new-${i}`} className="border border-gray-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-6 gap-3">
                <Field label="Name" className="col-span-2"><input className={input} value={o.name} onChange={(e) => setRow("add_ons", i, { name: e.target.value })} /></Field>
                <Field label="Selling ₹"><input className={input} inputMode="decimal" value={o.selling_price} onChange={(e) => setRow("add_ons", i, { selling_price: e.target.value })} /></Field>
                <Field label="MRP ₹"><input className={input} inputMode="decimal" value={o.original_price} onChange={(e) => setRow("add_ons", i, { original_price: e.target.value })} /></Field>
                <Field label="Cost ₹"><input className={input} inputMode="decimal" value={o.costing_price} onChange={(e) => setRow("add_ons", i, { costing_price: e.target.value })} /></Field>
                <div className="flex items-end justify-end"><button type="button" aria-label={`Remove add-on ${o.name || i + 1}`} onClick={() => set("add_ons", form.add_ons.filter((_, j) => j !== i))} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                <Field label="Image address" className="col-span-2 sm:col-span-6"><input className={input} value={o.image_url} placeholder="https://…" onChange={(e) => setRow("add_ons", i, { image_url: e.target.value })} /></Field>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set("add_ons", [...form.add_ons, emptyAddOn()])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600"><Plus className="w-4 h-4" /> Add an add-on</button>
        </Card>
      </>)}

      {tab === "images" && (
        <Card title="Images" subtitle="The main image is the one shown in listings and on the product page. Upload new ones, reorder, or remove.">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          <div className="grid sm:grid-cols-[220px_1fr] gap-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Main image</p>
              <div className="aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                {form.primary_image_url ? <img src={form.primary_image_url} alt="Main" className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400">No main image</span>}
              </div>
              <button type="button" disabled={upload.busy} onClick={() => pick("main")} className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"><Upload className="w-4 h-4" /> {form.primary_image_url ? "Replace main image" : "Upload main image"}</button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Gallery ({form.gallery_images.length})</p>
              {form.gallery_images.length === 0 && <p className="text-sm text-gray-500 mb-2">No extra images yet.</p>}
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.gallery_images.map((u, i) => (
                  <li key={u + i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="aspect-square bg-gray-50"><img src={u} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" /></div>
                    <div className="flex items-center justify-between px-1.5 py-1">
                      <span className="flex">
                        <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => moveImg(i, -1)} className="p-1 text-gray-500 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                        <button type="button" aria-label="Move later" disabled={i === form.gallery_images.length - 1} onClick={() => moveImg(i, 1)} className="p-1 text-gray-500 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                      </span>
                      <span className="flex">
                        <button type="button" aria-label="Make this the main image" title="Make main" onClick={() => makeMain(i)} className="p-1 text-gray-500 hover:text-amber-500"><Star className="w-4 h-4" /></button>
                        <button type="button" aria-label="Remove image" onClick={() => set("gallery_images", form.gallery_images.filter((_, j) => j !== i))} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" disabled={upload.busy} onClick={() => pick("gallery")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-60"><Upload className="w-4 h-4" /> {upload.busy ? `Uploading… ${upload.pct}%` : "Upload images"}</button>
                <div className="flex gap-2 flex-1 min-w-[220px]">
                  <input className={input} value={urlDraft} placeholder="…or paste an image address (https://)" aria-label="Image address" onChange={(e) => setUrlDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addUrl(); }} />
                  <button type="button" onClick={addUrl} className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">Add</button>
                </div>
              </div>
              {upload.error && <p role="alert" className="mt-2 text-sm text-red-600">{upload.error}</p>}
              <p className="text-xs text-gray-400 mt-2">Images are saved to your product only after you press Save.</p>
            </div>
          </div>
        </Card>
      )}

      {tab === "details" && (<>
        <Card title="What's included" subtitle="One item per line. Shown on the product page as the contents.">
          <textarea className={input} rows={6} aria-label="What's included" value={form.product_content} onChange={(e) => set("product_content", e.target.value)} />
        </Card>
        <Card title="Product attributes">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Colour"><input className={input} value={form.color} onChange={(e) => set("color", e.target.value)} /></Field>
            <Field label="Origin"><input className={input} value={form.origin} onChange={(e) => set("origin", e.target.value)} /></Field>
            <Field label="Fragrance level"><input className={input} value={form.fragrance_level} onChange={(e) => set("fragrance_level", e.target.value)} /></Field>
            <Field label="Stem length (cm)"><input className={input} inputMode="numeric" value={form.stem_length_cm} onChange={(e) => set("stem_length_cm", e.target.value)} /></Field>
            <Field label="Vase life (days)"><input className={input} inputMode="numeric" value={form.vase_life_days_min} onChange={(e) => set("vase_life_days_min", e.target.value)} /></Field>
            <Field label="Delivery type"><select className={input} value={form.delivery_type} onChange={(e) => set("delivery_type", e.target.value)}><option value="same_day">Same-day</option><option value="courier">Courier</option></select></Field>
            <Field label="Available cities" className="sm:col-span-3" hint='Use "India" for everywhere, or list cities.'><input className={input} value={form.available_cities} onChange={(e) => set("available_cities", e.target.value)} /></Field>
          </div>
        </Card>
        <Card title="Categories and tags" subtitle="Separate tags with commas. These decide where the product shows up in searches and filters.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Subcategory" hint={`Category: ${product.categorization?.category_name || "—"} (fixed here).`}><input className={input} value={form.subcategory_name} onChange={(e) => set("subcategory_name", e.target.value)} /></Field>
            <Field label="Type"><input className={input} value={form.type} onChange={(e) => set("type", e.target.value)} /></Field>
            <Field label="Occasion tags"><input className={input} value={form.occasion_tags} onChange={(e) => set("occasion_tags", e.target.value)} /></Field>
            <Field label="Festival tags"><input className={input} value={form.festival_tags} onChange={(e) => set("festival_tags", e.target.value)} /></Field>
            <Field label="Relationship tags" className="sm:col-span-2"><input className={input} value={form.relationship} onChange={(e) => set("relationship", e.target.value)} /></Field>
          </div>
        </Card>
      </>)}

      {tab === "care" && (<>
        <Card title="Care instructions" subtitle="One instruction per line.">
          <textarea className={input} rows={6} aria-label="Care instructions" value={form.care_instructions} onChange={(e) => set("care_instructions", e.target.value)} />
        </Card>
        <Card title="Delivery rules">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Max delivery days"><input className={input} inputMode="numeric" value={form.max_delivery_days} onChange={(e) => set("max_delivery_days", e.target.value)} /></Field>
            <Field label="Regional availability" hint="Comma-separated cities or regions."><input className={input} value={form.regional_availability} onChange={(e) => set("regional_availability", e.target.value)} /></Field>
          </div>
          <div className="mt-4"><Toggle checked={form.requires_cold_chain} onChange={(v) => set("requires_cold_chain", v)} label="Needs cold chain" hint="For products that must stay chilled in transit, such as cakes." /></div>
        </Card>
      </>)}

      {tab === "history" && (
        <Card title="Recent changes" subtitle="Who changed this product and what they changed (last 10).">
          {(product.edit_history || []).length === 0 && <p className="text-sm text-gray-500">No edits have been made from the Product Hub yet.</p>}
          <ul className="divide-y divide-gray-100">
            {(product.edit_history || []).map((h, i) => (
              <li key={i} className="py-3">
                <p className="text-sm font-medium text-gray-800">{h.by} <span className="font-normal text-gray-400">· {new Date(h.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span></p>
                <ul className="mt-1 text-xs text-gray-600 space-y-0.5">
                  {(h.changes || []).map((c, j) => <li key={j}><b>{c.field.replace(/\./g, " › ").replace(/_/g, " ")}</b>{c.detail?.length ? `: ${c.detail.join("; ")}` : `: ${typeof c.from === "object" ? JSON.stringify(c.from) : String(c.from ?? "—")} → ${typeof c.to === "object" ? JSON.stringify(c.to) : String(c.to ?? "—")}`}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {dirty.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-700"><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />{dirty.length} unsaved change{dirty.length === 1 ? "" : "s"}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setForm(base); setBanner(null); }} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"><Undo2 className="w-4 h-4" /> Discard</button>
              <button type="button" onClick={() => doSave(false)} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-60"><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}

      {confirmUrl && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Confirm web address change">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> {skuChanged ? "This breaks existing links" : "This changes the web address"}</h3>
            <p className="text-sm text-gray-600 mt-2">{skuChanged
              ? "The website finds a product by the SKU at the end of its address. If you change the SKU, every existing link, bookmark and Google result for this product will stop working. Only continue if that is what you want."
              : "Changing the slug changes this product's web address, so the address Google has saved goes out of date. Old links keep working. Only continue if that is what you want."}</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmUrl(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Go back</button>
              <button onClick={() => doSave(true)} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold">Change it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
