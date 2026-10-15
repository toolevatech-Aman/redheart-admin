import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, RefreshCw, ExternalLink, ChevronLeft, ChevronRight, Plus, PackageSearch } from "lucide-react";
import { listProducts, liveUrl, inr } from "../../../service/productHub";

const STATUS = [["all", "All products"], ["active", "Active"], ["inactive", "Hidden (inactive)"], ["low_stock", "Low stock"], ["out_of_stock", "Out of stock"], ["featured", "Featured"]];
const SORTS = [["updated", "Recently edited"], ["name", "Name A to Z"], ["price_asc", "Price: low to high"], ["price_desc", "Price: high to low"], ["stock_asc", "Stock: lowest first"], ["created", "Newest added"]];
const CAT_EMOJI = { Flowers: "🌸", Cakes: "🎂", Plants: "🌿" };

const Chip = ({ tone, children }) => (
  <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${tone}`}>{children}</span>
);

export default function ProductHubPage() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const sub = sp.get("sub") || "";
  const status = sp.get("status") || "all";
  const sort = sp.get("sort") || "updated";
  const page = parseInt(sp.get("page") || "1", 10);

  const [text, setText] = useState(q);
  const [data, setData] = useState(null);
  const [facets, setFacets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reqId = useRef(0);

  const setParam = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    setSp(next, { replace: true });
  };

  // search box: wait for a pause in typing before asking the server
  useEffect(() => {
    if (text === q) return undefined;
    const t = setTimeout(() => setParam({ q: text.trim() }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true); setError("");
    listProducts({ q, category_name: category, subcategory_name: sub, status, sort, page, limit: 25 })
      .then((d) => { if (id !== reqId.current) return; setData(d); if (d.facets) setFacets(d.facets); })
      .catch((e) => { if (id === reqId.current) setError(e?.response?.data?.message || "Could not load products. Check your connection and try again."); })
      .finally(() => { if (id === reqId.current) setLoading(false); });
  }, [q, category, sub, status, sort, page]);

  const subs = useMemo(() => Object.keys(facets[category]?.subcategories || {}).sort(), [facets, category]);
  const low = data?.lowStockThreshold ?? 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Hub</h1>
          <p className="text-sm text-gray-500">Every product in one place. Search, open one, and change its title, images, price, stock and details.</p>
        </div>
        <button onClick={() => navigate("/addProductManual")} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by product name, ID, SKU or page address…" aria-label="Search products"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Category" value={category} onChange={(e) => setParam({ category: e.target.value, sub: "" })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All categories</option>
            {Object.keys(facets).sort().map((c) => <option key={c} value={c}>{CAT_EMOJI[c] || ""} {c} ({facets[c].count})</option>)}
          </select>
          <select aria-label="Subcategory" value={sub} disabled={!category} onChange={(e) => setParam({ sub: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400">
            <option value="">{category ? "All types" : "Pick a category first"}</option>
            {subs.map((s) => <option key={s} value={s}>{s} ({facets[category].subcategories[s]})</option>)}
          </select>
          <select aria-label="Status" value={status} onChange={(e) => setParam({ status: e.target.value === "all" ? "" : e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setParam({ sort: e.target.value === "updated" ? "" : e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {(q || category || sub || status !== "all" || sort !== "updated") && (
            <button onClick={() => { setText(""); setSp({}, { replace: true }); }} className="px-3 py-2 text-sm text-rose-600 hover:underline">Clear filters</button>
          )}
        </div>
      </div>

      {error && <div role="alert" className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span aria-live="polite">{loading ? "Loading…" : `${(data?.total ?? 0).toLocaleString("en-IN")} product${data?.total === 1 ? "" : "s"}`}</span>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />}
        </div>

        {!loading && data && data.products.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <PackageSearch className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-700">No products match</p>
            <p className="text-sm">Try a different word, or clear the filters.</p>
          </div>
        )}

        <ul className="divide-y divide-gray-100">
          {(data?.products || []).map((p) => (
            <li key={p.product_id}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50/40 cursor-pointer" role="link" tabIndex={0}
                onClick={() => navigate(`/products/${encodeURIComponent(p.product_id)}`)}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/products/${encodeURIComponent(p.product_id)}`); }}>
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  {p.image ? <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">{CAT_EMOJI[p.category_name] || ""} {p.category_name}{p.subcategory_name ? ` · ${p.subcategory_name}` : ""} · ID {p.product_id} · SKU {p.sku}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {!p.is_active && <Chip tone="bg-gray-200 text-gray-700">Hidden</Chip>}
                    {p.is_featured && <Chip tone="bg-amber-100 text-amber-700">Featured</Chip>}
                    {p.stock <= 0 ? <Chip tone="bg-red-100 text-red-700">Out of stock</Chip> : p.stock <= low ? <Chip tone="bg-orange-100 text-orange-700">Low stock: {p.stock}</Chip> : <Chip tone="bg-green-100 text-green-700">{p.stock} in stock</Chip>}
                    {p.variations_count > 0 && <Chip tone="bg-blue-100 text-blue-700">{p.variations_count} variation{p.variations_count === 1 ? "" : "s"}</Chip>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{inr(p.selling_price)}</p>
                  {p.original_price > p.selling_price && <p className="text-xs text-gray-400 line-through">{inr(p.original_price)}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">Edited {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</p>
                </div>
                <a href={liveUrl(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`View ${p.name} on the website`} title="View on the website"
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white shrink-0"><ExternalLink className="w-4 h-4" /></a>
              </div>
            </li>
          ))}
        </ul>

        {data && data.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <button disabled={page <= 1} onClick={() => setParam({ page: String(page - 1) })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /> Previous</button>
            <span className="text-gray-500">Page {data.page} of {data.pages}</span>
            <button disabled={page >= data.pages} onClick={() => setParam({ page: String(page + 1) })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40">Next <ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
