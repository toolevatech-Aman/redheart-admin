import { Get } from "./axiosService";

export const fetchAnalyticsDashboard = async (range = "30d") => {
  const response = await Get(`/analytics/dashboard`, { range });
  return response.data;
};

export const fetchMarginAnalytics = async (range = "30d") => {
  const response = await Get(`/analytics/margin`, { range });
  return response.data;
};
