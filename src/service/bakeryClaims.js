import { Get, Patch } from "./axiosService";

export const fetchBakeryClaims = async () => {
  const response = await Get("/bakery-claims");
  return response.data;
};

export const updateBakeryClaim = async (id, data) => {
  const response = await Patch(`/bakery-claims/${id}`, data);
  return response.data;
};
