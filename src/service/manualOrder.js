import { Get, Post } from "./axiosService";

export const searchCustomers = async (q) => (await Get("/orders/admin/customers", { q })).data;
export const fetchCustomer = async (userId) => (await Get(`/orders/admin/customers/${encodeURIComponent(userId)}`)).data;
export const createCustomer = async (body) => (await Post("/orders/admin/customers", body)).data;
export const searchProducts = async (q) => (await Get("/orders/admin/products", { q })).data;
export const previewManualOrder = async (body) => (await Post("/orders/admin/manual/preview", body)).data;
export const createManualOrder = async (body) => (await Post("/orders/admin/manual", body)).data;
