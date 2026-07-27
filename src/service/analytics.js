import { Get } from "./axiosService";

export const fetchAnalyticsDashboard = async (range = "30d") => {
  const response = await Get(`/analytics/dashboard`, { range });
  return response.data;
};
