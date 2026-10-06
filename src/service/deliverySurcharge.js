import { Get, Post, Put, Delete } from "./axiosService";

export const fetchDeliverySurcharges = async () => (await Get("/orders/admin/delivery-surcharges")).data;
export const fetchDeliveryInsights = async () => (await Get("/orders/admin/delivery-cost-insights")).data;
export const saveDeliverySurchargesBulk = async (body) => (await Post("/orders/admin/delivery-surcharges", body)).data;
export const saveDeliverySurcharge = async (pinCode, body) => (await Put(`/orders/admin/delivery-surcharges/${pinCode}`, body)).data;
export const removeDeliverySurcharge = async (pinCode) => (await Delete(`/orders/admin/delivery-surcharges/${pinCode}`)).data;
