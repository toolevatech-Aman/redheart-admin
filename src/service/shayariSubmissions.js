import { Get, Patch } from "./axiosService";

export const fetchShayariSubmissions = async () => {
  const response = await Get("/shayari-submissions");
  return response.data;
};

export const updateShayariSubmissionStatus = async (id, status) => {
  const response = await Patch(`/shayari-submissions/${id}`, { status });
  return response.data;
};
