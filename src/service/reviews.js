import { Get, Patch, Post, Delete } from "./axiosService";

export const listReviews = async (params = {}) => (await Get("/products/admin/reviews", params)).data;
export const moderateReview = async (id, data) => (await Patch(`/products/admin/reviews/${id}`, data)).data;
export const bulkModerateReviews = async (ids, status) => (await Post("/products/admin/reviews/bulk", { ids, status })).data;
export const deleteReview = async (id) => (await Delete(`/products/admin/reviews/${id}`)).data;
export const bulkDeleteReviews = async (ids) => (await Post("/products/admin/reviews/bulk-delete", { ids })).data;
