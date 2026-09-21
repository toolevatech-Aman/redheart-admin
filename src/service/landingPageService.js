import { Get, Post, Put, Delete } from "./axiosService";

export const getLandingPages       = () => Get("/landing-pages/admin/all");
export const getLandingPageById    = (id) => Get(`/landing-pages/admin/${id}`);
export const getPreviewCount       = (params) => Get("/landing-pages/admin/preview-count", params);
export const createLandingPage     = (data) => Post("/landing-pages", data);
export const bulkCreateLandingPages = (keywords) => Post("/landing-pages/bulk", { keywords });
export const updateLandingPage     = (id, data) => Put(`/landing-pages/${id}`, data);
export const deleteLandingPage     = (id) => Delete(`/landing-pages/${id}`);
