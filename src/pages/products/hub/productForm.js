// Turns a product from the API into editable form values and back into a minimal PATCH body.
// Only sections the admin actually changed are sent, so an untouched section can never be overwritten.
const s = (v) => (v === undefined || v === null ? "" : String(v));
const lines = (arr) => (arr || []).join("\n");
const csv = (arr) => (arr || []).join(", ");
const splitLines = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
const splitCsv = (t) => String(t || "").split(",").map((x) => x.trim()).filter(Boolean);
const dateOnly = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export const emptyVariation = () => ({ variant_name: "", variant_sku: "", variant_id: "", quantity_in_bunch: "", costing_price: "", original_price: "", selling_price: "", stock: "", reorder_point: "", image_url: "" });
export const emptyAddOn = () => ({ name: "", product_id: "", quantity: "1", costing_price: "", original_price: "", selling_price: "", image_url: "" });

export function toForm(p) {
  const a = p.product_attributes || {}, c = p.categorization || {}, l = p.care_and_logistics || {}, sc = l.shipping_constraints || {}, av = p.availability || {}, m = p.media || {};
  return {
    name: s(p.name), slug: s(p.slug), sku: s(p.sku), short_summary: s(p.short_summary), description: s(p.description),
    is_active: av.is_active !== false, is_featured: !!av.is_featured, last_restock_date: dateOnly(av.last_restock_date),
    quantity: s(p.quantity), costing_price: s(p.costing_price), original_price: s(p.original_price), selling_price: s(p.selling_price),
    variations: (p.variations || []).map((v) => ({ _id: v._id, variant_name: s(v.variant_name), variant_sku: s(v.variant_sku), variant_id: s(v.variant_id), quantity_in_bunch: s(v.quantity_in_bunch),
      costing_price: s(v.costing_price), original_price: s(v.original_price), selling_price: s(v.selling_price), stock: s(v.inventory?.quantity_available), reorder_point: s(v.inventory?.reorder_point), image_url: s(v.image_url) })),
    add_ons: (l.add_ons || []).map((o) => ({ _id: o._id, name: s(o.name), product_id: s(o.product_id), quantity: s(o.quantity ?? 1), costing_price: s(o.costing_price), original_price: s(o.original_price), selling_price: s(o.selling_price), image_url: s(o.image_url) })),
    primary_image_url: s(m.primary_image_url), gallery_images: [...(m.gallery_images || [])],
    product_content: lines(a.product_content), color: s(a.color), origin: s(a.origin), stem_length_cm: s(a.stem_length_cm), fragrance_level: s(a.fragrance_level),
    vase_life_days_min: s(a.vase_life_days_min), delivery_type: a.delivery_type || "same_day", available_cities: s(a.available_cities),
    subcategory_name: s(c.subcategory_name).trim(), type: s(c.type), occasion_tags: csv(c.occasion_tags), festival_tags: csv(c.festival_tags), relationship: csv(c.relationship),
    care_instructions: lines(l.care_instructions), requires_cold_chain: !!sc.requires_cold_chain, max_delivery_days: s(sc.max_delivery_days), regional_availability: csv(sc.regional_availability),
  };
}

// which tab each field belongs to (used for the "unsaved" dots)
export const TAB_OF = {
  name: "basics", slug: "basics", sku: "basics", short_summary: "basics", description: "basics", is_active: "basics", is_featured: "basics",
  quantity: "price", costing_price: "price", original_price: "price", selling_price: "price", last_restock_date: "price", variations: "price", add_ons: "price",
  primary_image_url: "images", gallery_images: "images",
  product_content: "details", color: "details", origin: "details", stem_length_cm: "details", fragrance_level: "details", vase_life_days_min: "details", delivery_type: "details",
  available_cities: "details", subcategory_name: "details", type: "details", occasion_tags: "details", festival_tags: "details", relationship: "details",
  care_instructions: "care", requires_cold_chain: "care", max_delivery_days: "care", regional_availability: "care",
};

export const changedKeys = (form, base) => Object.keys(TAB_OF).filter((k) => JSON.stringify(form[k]) !== JSON.stringify(base[k]));

const variation = (v) => ({ ...(v._id ? { _id: v._id } : {}), variant_name: v.variant_name, variant_sku: v.variant_sku, variant_id: v.variant_id, quantity_in_bunch: v.quantity_in_bunch,
  costing_price: v.costing_price, original_price: v.original_price, selling_price: v.selling_price, inventory: { quantity_available: v.stock, reorder_point: v.reorder_point }, image_url: v.image_url });
const addOn = (o) => ({ ...(o._id ? { _id: o._id } : {}), name: o.name, product_id: o.product_id, quantity: o.quantity, costing_price: o.costing_price, original_price: o.original_price, selling_price: o.selling_price, image_url: o.image_url });

export function toPayload(form, base) {
  const dirty = new Set(changedKeys(form, base)); const body = {};
  for (const k of ["name", "slug", "sku", "short_summary", "description", "quantity", "costing_price", "original_price", "selling_price"]) if (dirty.has(k)) body[k] = form[k];
  const sect = (key, map) => { const o = {}; for (const [f, fn] of Object.entries(map)) if (dirty.has(f)) o[f] = fn(form[f]); if (Object.keys(o).length) body[key] = { ...(body[key] || {}), ...o }; };
  const id = (x) => x;
  sect("availability", { is_active: id, is_featured: id, last_restock_date: id });
  sect("media", { primary_image_url: id, gallery_images: id });
  sect("categorization", { subcategory_name: id, type: id, occasion_tags: splitCsv, festival_tags: splitCsv, relationship: splitCsv });
  sect("product_attributes", { product_content: splitLines, color: id, origin: id, stem_length_cm: id, fragrance_level: id, vase_life_days_min: id, delivery_type: id, available_cities: id });
  const care = {};
  if (dirty.has("care_instructions")) care.care_instructions = splitLines(form.care_instructions);
  const ship = {};
  if (dirty.has("requires_cold_chain")) ship.requires_cold_chain = form.requires_cold_chain;
  if (dirty.has("max_delivery_days")) ship.max_delivery_days = form.max_delivery_days;
  if (dirty.has("regional_availability")) ship.regional_availability = splitCsv(form.regional_availability);
  if (Object.keys(ship).length) care.shipping_constraints = ship;
  if (dirty.has("add_ons")) care.add_ons = form.add_ons.map(addOn);
  if (Object.keys(care).length) body.care_and_logistics = care;
  if (dirty.has("variations")) body.variations = form.variations.map(variation);
  return body;
}

// helpful numbers shown next to the price fields
export const discountPct = (mrp, sell) => (Number(mrp) > 0 && Number(sell) < Number(mrp) ? Math.round(((mrp - sell) / mrp) * 100) : 0);
export const marginPct = (cost, sell) => (Number(sell) > 0 && cost !== "" ? Math.round(((sell - cost) / sell) * 100) : null);
