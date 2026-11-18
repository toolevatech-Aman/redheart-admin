import { Get, Patch, Post } from "./axiosService";

export const listReviews = async (params = {}) => (await Get("/products/admin/reviews", params)).data;
export const moderateReview = async (id, data) => (await Patch(`/products/admin/reviews/${id}`, data)).data;
export const bulkModerateReviews = async (ids, status) => (await Post("/products/admin/reviews/bulk", { ids, status })).data;
