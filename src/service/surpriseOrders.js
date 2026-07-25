import { Get } from "./axiosService";

export const fetchSurpriseOrders = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await Get(`/valentine/admin/orders${qs ? `?${qs}` : ""}`);
  return response.data;
};
