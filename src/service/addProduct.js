
import { Post, PostMultipart } from "./axiosService";

export const AddProductCSV = async (file) => {
  const response = await PostMultipart("/products/import", file);
  return response.data;
};