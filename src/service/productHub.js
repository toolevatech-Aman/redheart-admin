import { Get, Patch } from "./axiosService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const listProducts = async (params = {}) => (await Get("/products/admin/list", params)).data;
export const getProductForEdit = async (productId) => (await Get(`/products/admin/${encodeURIComponent(productId)}`)).data;
export const saveProduct = async (productId, body) => (await Patch(`/products/admin/${encodeURIComponent(productId)}`, body)).data;

// Same bucket folder the existing Image Upload page uses, so product images stay in one place.
export function uploadProductImage(productId, file, onProgress = () => {}) {
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("Please choose an image file"));
  if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error("Images must be under 10 MB"));
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
  const task = uploadBytesResumable(ref(storage, `product-images/${productId}/hub-${Date.now()}-${safe}`), file);
  return new Promise((resolve, reject) => {
    task.on("state_changed", (s) => onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), reject, () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
  });
}

const CATEGORY_URL = { Flowers: "flowers", Cakes: "cakes", Plants: "plants" };
// Mirrors the storefront's getProductUrl: /p/<category>/<slug>[-<sku>]
export function liveUrl(p) {
  const cat = CATEGORY_URL[p.category_name || p.categorization?.category_name] || "flowers";
  const slug = String(p.slug || "").toLowerCase();
  const sku = String(p.sku || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://www.redheart.in/p/${cat}/${slug}${sku && !slug.endsWith(`-${sku}`) ? `-${sku}` : ""}`;
}
export const inr = (n) => (n === undefined || n === null || n === "" ? "—" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
