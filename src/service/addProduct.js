
import { Delete, Get, Post, PostMultipart } from "./axiosService";

const buildQueryString = (params) => {
  const query = new URLSearchParams();

  for (const key in params) {
    if (params[key]) { // only add non-empty values
      query.append(key, params[key]);
    }
  }

  return query.toString();
};

export const AddProductCSV = async (file) => {
  const response = await PostMultipart("/products/import", file);
  return response.data;
};
export const EditProductCSV = async (file) => {
  const response = await PostMultipart("/products/update", file);
  return response.data;
};

export const fetchProducts = async (filters = {}) => {
  try {
    const queryString = buildQueryString(filters);
    const response = await Get(`/products?${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};


export const deleteProductById = async (productId) => {
  try {
    const response = await Delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}