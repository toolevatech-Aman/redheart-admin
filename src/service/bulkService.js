import { Get, Post, PostMultipart } from "./axiosService";
import apiClient from "./axiosService";

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

export const downloadErrorReport = (jobId) => {
  const token = localStorage.getItem("authToken");
  const url   = `https://backend.redheart.in/api/bulk/errors/${jobId}`;
  const a     = document.createElement("a");
  a.href      = `${url}?token=${token}`;
  // Use fetch with auth header for proper download
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href  = URL.createObjectURL(blob);
      link.download = `error-report-${jobId}.xlsx`;
      link.click();
    });
};

// ── Export ────────────────────────────────────────────────────────────────────
export const exportProducts = async (category, filters = {}, format = "xlsx") => {
  const token = localStorage.getItem("authToken");
  const params = new URLSearchParams({ format, ...filters }).toString();
  const url   = `https://backend.redheart.in/api/bulk/export/${category}?${params}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Export failed");
  }
  const blob     = await response.blob();
  const filename = `${category.toLowerCase()}-export-${Date.now()}.${format}`;
  const link     = document.createElement("a");
  link.href      = URL.createObjectURL(blob);
  link.download  = filename;
  link.click();
};

// Export for edit workflow
export const exportForEdit = async (category, filters = {}) => {
  const token  = localStorage.getItem("authToken");
  const params = new URLSearchParams({ format: "xlsx", ...filters }).toString();
  const url    = `https://backend.redheart.in/api/bulk/edit-export/${category}?${params}`;

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Export for edit failed");
  const blob     = await response.blob();
  const link     = document.createElement("a");
  link.href      = URL.createObjectURL(blob);
  link.download  = `${category.toLowerCase()}-edit-${Date.now()}.xlsx`;
  link.click();
};

// ── Template download ─────────────────────────────────────────────────────────
export const downloadTemplate = async (category) => {
  const token = localStorage.getItem("authToken");
  const url   = `https://backend.redheart.in/api/bulk/template/${category}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Template download failed (${response.status})`);
  }
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href     = URL.createObjectURL(blob);
  link.download = `${category.toLowerCase()}_upload_template.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getCategoryStats = async () => {
  const res = await Get("/bulk/stats");
  return res.data;
};
