import { Get, Patch, Post, Delete } from "./axiosService";

export const listReviews = async (params = {}) => (await Get("/products/admin/reviews", params)).data;
export const moderateReview = async (id, data) => (await Patch(`/products/admin/reviews/${id}`, data)).data;
export const bulkModerateReviews = async (ids, update) => (await Post("/products/admin/reviews/bulk", { ids, ...(typeof update === "string" ? { status: update } : update) })).data;
export const deleteReview = async (id) => (await Delete(`/products/admin/reviews/${id}`)).data;
export const bulkDeleteReviews = async (ids) => (await Post("/products/admin/reviews/bulk-delete", { ids })).data;
