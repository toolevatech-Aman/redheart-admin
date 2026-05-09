import { Get, Post, PostMultipart } from "./axiosService";

const BASE = "https://backend.redheart.in/api";

// Shared helper — triggers a file download from a fetch Response
const triggerDownload = async (response, filename) => {
  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Shared helper — get auth header
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

// ── Upload ────────────────────────────────────────────────────────────────────
// Step 1: upload file → get validation preview
export const uploadAndValidate = async (category, file) => {
  const res = await PostMultipart(`/bulk/upload/${category}`, file);
  return res.data;
};

// Step 2: confirm → write to DB
export const confirmImport = async (jobId) => {
  const res = await Post(`/bulk/confirm/${jobId}`);
  return res.data;
};

// ── History & errors ──────────────────────────────────────────────────────────
export const getImportHistory = async (category = "all", page = 1, limit = 20) => {
  const url = category === "all" ? `/bulk/history` : `/bulk/history/${category}`;
  const res = await Get(url, { page, limit });
  return res.data;
};

export const downloadErrorReport = async (jobId) => {
  const response = await fetch(`${BASE}/bulk/errors/${jobId}`, { headers: authHeader() });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Error report download failed (${response.status})`);
  }
  await triggerDownload(response, `error-report-${jobId}.xlsx`);
};

// ── Export ────────────────────────────────────────────────────────────────────
export const exportProducts = async (category, filters = {}, format = "xlsx") => {
  const params   = new URLSearchParams({ format, ...filters }).toString();
  const response = await fetch(`${BASE}/bulk/export/${category}?${params}`, { headers: authHeader() });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Export failed (${response.status})`);
  }
  await triggerDownload(response, `${category.toLowerCase()}-export-${Date.now()}.${format}`);
};

// Export for edit workflow
export const exportForEdit = async (category, filters = {}) => {
  const params   = new URLSearchParams({ format: "xlsx", ...filters }).toString();
  const response = await fetch(`${BASE}/bulk/edit-export/${category}?${params}`, { headers: authHeader() });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Edit export failed (${response.status})`);
  }
  await triggerDownload(response, `${category.toLowerCase()}-edit-${Date.now()}.xlsx`);
};

// ── Template download ─────────────────────────────────────────────────────────
export const downloadTemplate = async (category) => {
  const response = await fetch(`${BASE}/bulk/template/${category}`, { headers: authHeader() });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Template download failed (${response.status})`);
  }
  await triggerDownload(response, `${category.toLowerCase()}_upload_template.xlsx`);
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getCategoryStats = async () => {
  const res = await Get("/bulk/stats");
  return res.data;
};
