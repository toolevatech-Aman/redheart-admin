import { Get, Post, Put, Delete } from "./axiosService";

export const fetchSurcharges = async () => (await Get("/orders/admin/pincode-surcharges")).data;
export const saveSurcharge = async (pinCode, body) => (await Put(`/orders/admin/pincode-surcharges/${pinCode}`, body)).data;
export const saveSurchargesBulk = async (body) => (await Post("/orders/admin/pincode-surcharges", body)).data;
export const removeSurcharge = async (pinCode) => (await Delete(`/orders/admin/pincode-surcharges/${pinCode}`)).data;
