import { matchPath } from "react-router-dom";
import { LocalStorageKeys } from "./localStorageKeys";

// Mirrors the section buckets enforced on the backend (checkAccess.js +
// each route file) — keep these two in sync. "overall" always passes;
// it's never listed here since every route already allows it implicitly.
export const SEO_PATHS = [
  "/city-pages",
  "/category-pages",
  "/blog-categories",
  "/blog-posts",
  "/blog-posts/new",
  "/blog-posts/:id/edit",
];

export const CATEGORY_PATHS = [
  "/category-config",
  "/addProduct",
  "/addProductManual",
  "/editProduct",
  "/deleteProduct",
  "/addonUpload",
  "/upload/flowers",
  "/upload/cakes",
  "/upload/plants",
  "/edit/flowers",
  "/edit/cakes",
  "/edit/plants",
  "/export/flowers",
  "/export/cakes",
  "/export/plants",
  "/city-pages", // shared with SEO — cities are category-scoped
];

export const ACCESS_LEVELS = ["overall", "seo", "category"];

export const ACCESS_LEVEL_LABELS = {
  overall: "Overall (full access)",
  seo: "SEO",
  category: "Category",
};

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(LocalStorageKeys.User) || "null");
  } catch {
    return null;
  }
}

export function getAccessLevel() {
  return getCurrentUser()?.accessLevel || "overall";
}

const matchesAny = (path, list) => list.some((pattern) => matchPath({ path: pattern, end: true }, path));

// Which access levels (besides "overall") may reach this path.
export function allowedLevelsFor(path) {
  const levels = [];
  if (matchesAny(path, SEO_PATHS)) levels.push("seo");
  if (matchesAny(path, CATEGORY_PATHS)) levels.push("category");
  return levels;
}

export function canAccessPath(path, level = getAccessLevel()) {
  if (level === "overall") return true;
  return allowedLevelsFor(path).includes(level);
}

// Where to send a restricted admin after login / when they hit a blocked route.
export function defaultPathFor(level = getAccessLevel()) {
  if (level === "seo") return "/blog-posts";
  if (level === "category") return "/category-config";
  return "/home";
}
