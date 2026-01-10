import { Get, Post } from "./axiosService";

/**
 * Get all page contents (ADMIN)
 */
export const getAllPageContentsApi = async () => {
  const response = await Get("/page-content/admin/all");
  return response.data;
};

/**
 * Add or Update page content (ADMIN)
 * Payload: { page: string, htmlCode: string }
 */
export const upsertPageContentApi = async (page, htmlCode) => {
  const payload = { page, htmlCode };
  const response = await Post("/page-content/admin", payload);
  return response.data;
};
