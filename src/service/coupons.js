import { Get, Post, Put, Delete, Patch } from "./axiosService";

export const fetchCouponDashboard = async () => (await Get("/coupons/dashboard")).data;
export const fetchCoupons = async (params = {}) => (await Get("/coupons", params)).data;
export const fetchCoupon = async (id) => (await Get(`/coupons/${id}`)).data;
export const createCoupon = async (data) => (await Post("/coupons", data)).data;
export const updateCoupon = async (id, data) => (await Put(`/coupons/${id}`, data)).data;
export const deleteCoupon = async (id) => (await Delete(`/coupons/${id}`)).data;
export const toggleCouponStatus = async (id) => (await Patch(`/coupons/${id}/toggle-status`)).data;
