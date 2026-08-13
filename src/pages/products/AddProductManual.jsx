import React, { useState } from "react";
import { addSingleProduct } from "../../service/addProduct";

const CATEGORY_META = {
  Flowers: { emoji: "🌸", accent: "bg-red-600",   light: "bg-red-50",   border: "border-red-200",   ring: "focus:ring-red-500" },
  Cakes:   { emoji: "🎂", accent: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200", ring: "focus:ring-amber-500" },
  Plants:  { emoji: "🌿", accent: "bg-green-600", light: "bg-green-50", border: "border-green-200", ring: "focus:ring-green-500" },
};

const toSlug = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const csvToArray = (str) =>
  (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const emptyVariation = { variant_id: "", variant_sku: "", variant_name: "", quantity_in_bunch: "", costing_price: "", original_price: "", selling_price: "", discount_percentage: "", image_url: "" };
const emptyAddOn = { name: "", product_id: "", quantity: "", costing_price: "", original_price: "", selling_price: "", image_url: "" };

const initialForm = {
  category: "Flowers",
  product_id: "",
  name: "",
  slug: "",
  slugTouched: false,
  sku: "",
  quantity: "",
  costing_price: "",
  original_price: "",
  selling_price: "",
  description: "",
  short_summary: "",

  category_id: "",
  subcategory_id: "",
  subcategory_name: "",
  festival_tags: "",
  occasion_tags: "",
  type: "",
  relationship: "",

  color: "",
  product_content: "",
  stem_length_cm: "",
  fragrance_level: "",
  vase_life_days_min: "",
  origin: "",
  available_cities: "India",
  delivery_type: "same_day",

  primary_image_url: "",
  gallery_images: "",

  care_instructions: "",
  requires_cold_chain: false,
  max_delivery_days: "",
  regional_availability: "",

  is_active: true,
  is_featured: false,
};

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent";

export default function AddProductManual() {
  const [form, setForm] = useState(initialForm);
  const [variations, setVariations] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  const meta = CATEGORY_META[form.category];

  const set = (key) => (e) => {
    const val = e?.target?.type === "checkbox" ? e.target.checked : e?.target?.value ?? e;
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "name" && !f.slugTouched) next.slug = toSlug(val);
      if (key === "slug") next.slugTouched = true;
      return next;
    });
  };

  const updateRow = (setter, idx, key, value) =>
    setter((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  const resetForm = () => {
    setForm({ ...initialForm, category: form.category });
    setVariations([]);
    setAddOns([]);
  };

  const buildPayload = () => {
    const num = (v) => (v === "" || v === undefined || v === null ? undefined : Number(v));
    return {
      product_id: form.product_id.trim(),
      name: form.name.trim(),
      slug: toSlug(form.slug),
      sku: form.sku.trim(),
      quantity: num(form.quantity),
      costing_price: num(form.costing_price),
      original_price: num(form.original_price),
      selling_price: num(form.selling_price),
      description: form.description,
      short_summary: form.short_summary,

      categorization: {
        category_id: num(form.category_id),
        category_name: form.category,
        subcategory_id: num(form.subcategory_id),
        subcategory_name: form.subcategory_name,
        festival_tags: csvToArray(form.festival_tags),
        occasion_tags: csvToArray(form.occasion_tags),
        type: form.type,
        relationship: csvToArray(form.relationship),
      },

      product_attributes: {
        color: form.color,
        product_content: csvToArray(form.product_content),
        stem_length_cm: num(form.stem_length_cm),
        fragrance_level: form.fragrance_level,
        vase_life_days_min: num(form.vase_life_days_min),
        origin: form.origin,
        available_cities: form.available_cities || "India",
        delivery_type: form.delivery_type,
      },

      media: {
        primary_image_url: form.primary_image_url,
        gallery_images: csvToArray(form.gallery_images),
      },

      care_and_logistics: {
        care_instructions: csvToArray(form.care_instructions),
        shipping_constraints: {
          requires_cold_chain: form.requires_cold_chain,
          max_delivery_days: num(form.max_delivery_days),
          regional_availability: csvToArray(form.regional_availability),
        },
        add_ons: addOns
          .filter((a) => a.name.trim())
          .map((a) => ({
            name: a.name,
            product_id: a.product_id,
            quantity: num(a.quantity),
            costing_price: num(a.costing_price),
            original_price: num(a.original_price),
            selling_price: num(a.selling_price),
            image_url: a.image_url,
          })),
      },

      variations: variations
        .filter((v) => v.variant_name.trim() || v.variant_id.trim())
        .map((v) => ({
          variant_id: v.variant_id,
          variant_sku: v.variant_sku,
          variant_name: v.variant_name,
          quantity_in_bunch: num(v.quantity_in_bunch),
          costing_price: num(v.costing_price),
          original_price: num(v.original_price),
          selling_price: num(v.selling_price),
          discount_percentage: num(v.discount_percentage),
          image_url: v.image_url,
        })),

      availability: {
        is_active: form.is_active,
        is_featured: form.is_featured,
      },
    };
  };

  const validate = () => {
    const required = { product_id: "Product ID", name: "Name", slug: "Slug", sku: "SKU", quantity: "Quantity", costing_price: "Costing price", original_price: "Original price", selling_price: "Selling price", description: "Description" };
    const missing = Object.entries(required).filter(([k]) => !String(form[k] ?? "").trim());
    if (missing.length) return `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.map(([, label]) => label).join(", ")}`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await addSingleProduct(buildPayload());
      setMessage({ type: "success", text: `"${form.name}" was added successfully.` });
      resetForm();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to add product." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Add Product (Manual)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add one product at a time — same fields as bulk upload, filled in here instead of a spreadsheet.
          </p>
        </div>
        <div className={`inline-flex rounded-xl border ${meta.border} ${meta.light} p-1 gap-1`}>
          {Object.keys(CATEGORY_META).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                form.category === cat ? `${CATEGORY_META[cat].accent} text-white` : "text-gray-600 hover:bg-white"
              }`}
            >
              {CATEGORY_META[cat].emoji} {cat}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Basic Info">
          <Field label="Product ID" required><input className={`${inputCls} ${meta.ring}`} value={form.product_id} onChange={set("product_id")} placeholder="e.g. FL-000123" /></Field>
          <Field label="Name" required><input className={`${inputCls} ${meta.ring}`} value={form.name} onChange={set("name")} placeholder="e.g. Red Rose Bouquet" /></Field>
          <Field label="Slug" required hint="Auto-generated from name; editable."><input className={`${inputCls} ${meta.ring}`} value={form.slug} onChange={set("slug")} /></Field>
          <Field label="SKU" required><input className={`${inputCls} ${meta.ring}`} value={form.sku} onChange={set("sku")} /></Field>
          <Field label="Short Summary" className="sm:col-span-2 lg:col-span-2"><input className={`${inputCls} ${meta.ring}`} value={form.short_summary} onChange={set("short_summary")} placeholder="One-line teaser shown in listings" /></Field>
          <Field label="Description" required className="sm:col-span-2 lg:col-span-3">
            <textarea className={`${inputCls} ${meta.ring}`} rows={3} value={form.description} onChange={set("description")} />
          </Field>
        </Section>

        <Section title="Pricing & Inventory">
          <Field label="Quantity in Stock" required><input type="number" className={`${inputCls} ${meta.ring}`} value={form.quantity} onChange={set("quantity")} /></Field>
          <Field label="Costing Price (₹)" required><input type="number" className={`${inputCls} ${meta.ring}`} value={form.costing_price} onChange={set("costing_price")} /></Field>
          <Field label="Original Price (₹)" required><input type="number" className={`${inputCls} ${meta.ring}`} value={form.original_price} onChange={set("original_price")} /></Field>
          <Field label="Selling Price (₹)" required><input type="number" className={`${inputCls} ${meta.ring}`} value={form.selling_price} onChange={set("selling_price")} /></Field>
        </Section>

        <Section title="Categorization" subtitle={`Category is set to "${form.category}" via the switcher above.`}>
          <Field label="Category ID"><input type="number" className={`${inputCls} ${meta.ring}`} value={form.category_id} onChange={set("category_id")} /></Field>
          <Field label="Subcategory ID"><input type="number" className={`${inputCls} ${meta.ring}`} value={form.subcategory_id} onChange={set("subcategory_id")} /></Field>
          <Field label="Subcategory Name"><input className={`${inputCls} ${meta.ring}`} value={form.subcategory_name} onChange={set("subcategory_name")} /></Field>
          <Field label="Type"><input className={`${inputCls} ${meta.ring}`} value={form.type} onChange={set("type")} placeholder="e.g. Bouquet, Photo Cake" /></Field>
          <Field label="Festival Tags" hint="Comma-separated"><input className={`${inputCls} ${meta.ring}`} value={form.festival_tags} onChange={set("festival_tags")} placeholder="diwali, valentines-day" /></Field>
          <Field label="Occasion Tags" hint="Comma-separated"><input className={`${inputCls} ${meta.ring}`} value={form.occasion_tags} onChange={set("occasion_tags")} placeholder="birthday, anniversary" /></Field>
          <Field label="Relationship" hint="Comma-separated"><input className={`${inputCls} ${meta.ring}`} value={form.relationship} onChange={set("relationship")} placeholder="wife, mother" /></Field>
        </Section>

        <Section title="Attributes">
          <Field label="Color"><input className={`${inputCls} ${meta.ring}`} value={form.color} onChange={set("color")} /></Field>
          <Field label="Origin"><input className={`${inputCls} ${meta.ring}`} value={form.origin} onChange={set("origin")} /></Field>
          <Field label="Delivery Type">
            <select className={`${inputCls} ${meta.ring}`} value={form.delivery_type} onChange={set("delivery_type")}>
              <option value="same_day">Same Day</option>
              <option value="courier">Courier</option>
            </select>
          </Field>
          <Field label="Available Cities"><input className={`${inputCls} ${meta.ring}`} value={form.available_cities} onChange={set("available_cities")} /></Field>
          <Field label="Stem Length (cm)"><input type="number" className={`${inputCls} ${meta.ring}`} value={form.stem_length_cm} onChange={set("stem_length_cm")} /></Field>
          <Field label="Fragrance Level"><input className={`${inputCls} ${meta.ring}`} value={form.fragrance_level} onChange={set("fragrance_level")} /></Field>
          <Field label="Vase Life (days, min)"><input type="number" className={`${inputCls} ${meta.ring}`} value={form.vase_life_days_min} onChange={set("vase_life_days_min")} /></Field>
          <Field label="Product Content" hint="Comma-separated, e.g. what's included" className="sm:col-span-2 lg:col-span-3">
            <input className={`${inputCls} ${meta.ring}`} value={form.product_content} onChange={set("product_content")} placeholder="12 red roses, greenery, wrapping paper" />
          </Field>
        </Section>

        <Section title="Media">
          <Field label="Primary Image URL" className="sm:col-span-2 lg:col-span-2"><input className={`${inputCls} ${meta.ring}`} value={form.primary_image_url} onChange={set("primary_image_url")} placeholder="https://..." /></Field>
          <Field label="Gallery Image URLs" hint="Comma-separated" className="sm:col-span-2 lg:col-span-3">
            <input className={`${inputCls} ${meta.ring}`} value={form.gallery_images} onChange={set("gallery_images")} placeholder="https://..., https://..." />
          </Field>
        </Section>

        <Section title="Care & Logistics">
          <Field label="Care Instructions" hint="Comma-separated" className="sm:col-span-2 lg:col-span-3">
            <input className={`${inputCls} ${meta.ring}`} value={form.care_instructions} onChange={set("care_instructions")} placeholder="Keep refrigerated, Trim stems daily" />
          </Field>
          <Field label="Max Delivery Days"><input type="number" className={`${inputCls} ${meta.ring}`} value={form.max_delivery_days} onChange={set("max_delivery_days")} /></Field>
          <Field label="Regional Availability" hint="Comma-separated"><input className={`${inputCls} ${meta.ring}`} value={form.regional_availability} onChange={set("regional_availability")} /></Field>
          <Field label="Requires Cold Chain">
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" className="w-4 h-4" checked={form.requires_cold_chain} onChange={set("requires_cold_chain")} />
              <span className="text-sm text-gray-600">Yes, needs cold-chain shipping</span>
            </label>
          </Field>
        </Section>

        {/* Variations */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Variations</h3>
              <p className="text-xs text-gray-500 mt-0.5">Optional — e.g. size/weight options with their own price & stock.</p>
            </div>
            <button type="button" onClick={() => setVariations((v) => [...v, { ...emptyVariation }])} className={`text-sm font-medium px-3 py-1.5 rounded-lg ${meta.light} ${meta.border} border text-gray-700 hover:brightness-95`}>
              + Add Variation
            </button>
          </div>
          {variations.length === 0 && <p className="text-sm text-gray-400">No variations added.</p>}
          {variations.map((v, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 items-end border-t border-gray-100 pt-3 mt-3 first:border-0 first:pt-0 first:mt-0">
              <input className={`${inputCls} col-span-2`} placeholder="Variant name" value={v.variant_name} onChange={(e) => updateRow(setVariations, i, "variant_name", e.target.value)} />
              <input className={inputCls} placeholder="Variant ID" value={v.variant_id} onChange={(e) => updateRow(setVariations, i, "variant_id", e.target.value)} />
              <input className={inputCls} placeholder="SKU" value={v.variant_sku} onChange={(e) => updateRow(setVariations, i, "variant_sku", e.target.value)} />
              <input type="number" className={inputCls} placeholder="Qty" value={v.quantity_in_bunch} onChange={(e) => updateRow(setVariations, i, "quantity_in_bunch", e.target.value)} />
              <input type="number" className={inputCls} placeholder="Original ₹" value={v.original_price} onChange={(e) => updateRow(setVariations, i, "original_price", e.target.value)} />
              <input type="number" className={inputCls} placeholder="Selling ₹" value={v.selling_price} onChange={(e) => updateRow(setVariations, i, "selling_price", e.target.value)} />
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Image URL" value={v.image_url} onChange={(e) => updateRow(setVariations, i, "image_url", e.target.value)} />
                <button type="button" onClick={() => setVariations((rows) => rows.filter((_, idx) => idx !== i))} className="text-red-500 text-sm px-2">✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Add-Ons</h3>
              <p className="text-xs text-gray-500 mt-0.5">Optional — extras a customer can add (chocolates, teddy bear, etc.).</p>
            </div>
            <button type="button" onClick={() => setAddOns((a) => [...a, { ...emptyAddOn }])} className={`text-sm font-medium px-3 py-1.5 rounded-lg ${meta.light} ${meta.border} border text-gray-700 hover:brightness-95`}>
              + Add Add-On
            </button>
          </div>
          {addOns.length === 0 && <p className="text-sm text-gray-400">No add-ons added.</p>}
          {addOns.map((a, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 items-end border-t border-gray-100 pt-3 mt-3 first:border-0 first:pt-0 first:mt-0">
              <input className={`${inputCls} col-span-2`} placeholder="Add-on name" value={a.name} onChange={(e) => updateRow(setAddOns, i, "name", e.target.value)} />
              <input className={inputCls} placeholder="Product ID" value={a.product_id} onChange={(e) => updateRow(setAddOns, i, "product_id", e.target.value)} />
              <input type="number" className={inputCls} placeholder="Qty" value={a.quantity} onChange={(e) => updateRow(setAddOns, i, "quantity", e.target.value)} />
              <input type="number" className={inputCls} placeholder="Selling ₹" value={a.selling_price} onChange={(e) => updateRow(setAddOns, i, "selling_price", e.target.value)} />
              <div className="flex gap-2 col-span-2">
                <input className={inputCls} placeholder="Image URL" value={a.image_url} onChange={(e) => updateRow(setAddOns, i, "image_url", e.target.value)} />
                <button type="button" onClick={() => setAddOns((rows) => rows.filter((_, idx) => idx !== i))} className="text-red-500 text-sm px-2">✕</button>
              </div>
            </div>
          ))}
        </div>

        <Section title="Availability">
          <Field label="Active">
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" className="w-4 h-4" checked={form.is_active} onChange={set("is_active")} />
              <span className="text-sm text-gray-600">Visible & purchasable on the site</span>
            </label>
          </Field>
          <Field label="Featured">
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" className="w-4 h-4" checked={form.is_featured} onChange={set("is_featured")} />
              <span className="text-sm text-gray-600">Show in featured sections</span>
            </label>
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className={`${meta.accent} text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-60`}>
            {submitting ? "Adding…" : "Add Product"}
          </button>
          <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
            Clear form
          </button>
        </div>
      </form>
    </div>
  );
}
