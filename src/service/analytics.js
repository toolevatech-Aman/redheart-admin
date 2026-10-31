import { Get } from "./axiosService";

// `period` = { range: "7d"|"30d"|"90d"|"custom", from?: "YYYY-MM-DD", to?: "YYYY-MM-DD" }
const params = ({ range = "30d", from, to } = {}) =>
  range === "custom" ? { range, from, to } : { range };

export const fetchAnalyticsDashboard = async (period) => {
  const response = await Get(`/analytics/dashboard`, params(period));
  return response.data;
};

export const fetchMarginAnalytics = async (period) => {
  const response = await Get(`/analytics/margin`, params(period));
  return response.data;
};
