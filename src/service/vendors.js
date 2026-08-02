import { Get, Post, Put, Delete } from "./axiosService";

export const fetchVendors = async (params = {}) => (await Get("/vendors", params)).data;
export const fetchVendorProfile = async (id) => (await Get(`/vendors/${id}`)).data;
export const createVendor = async (data) => (await Post("/vendors", data)).data;
export const updateVendor = async (id, data) => (await Put(`/vendors/${id}`, data)).data;
export const deactivateVendor = async (id) => (await Delete(`/vendors/${id}`)).data;
export const recommendVendors = async (params) => (await Get("/vendors/recommend", params)).data;
export const fetchPinCodeStat = async (pinCode) => (await Get("/vendors/pincode-stats", { pinCode })).data;
export const assignVendorToOrder = async (orderId, data) =>
  (await Post(`/vendors/orders/${orderId}/assign`, data)).data;
