import { Delete, Get, Post, Put } from "./axiosService";

/**
 * Utility to build query string from filters
 */
const buildQueryString = (params) => {
  const query = new URLSearchParams();

  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  }

  return query.toString();
};

/**
 * Create new AddOn
 * @param {Object} addOnData - { image, category, name, costPrice, sellingPrice, originalPrice, addOn }
 */
export const createAddOn = async (addOnData) => {
  const response = await Post("/addOn/create", addOnData);
  return response.data;
};

/**
 * Edit existing AddOn
 * @param {string} id - AddOn _id
 * @param {Object} updateData - fields to update
 */
export const editAddOn = async (id, updateData) => {
  const response = await Put(`/addOn/edit/${id}`, updateData);
  return response.data;
};

/**
 * Soft delete an AddOn
 * @param {string} id - AddOn _id
 */
export const softDeleteAddOn = async (id) => {
  const response = await Put(`/addOn/softDelete/${id}`);
  return response.data;
};

/**
 * Fetch all AddOns (admin)
 * @param {Object} filters - optional filters like category, name, etc.
 */
export const fetchAllAddOns = async (filters = {}) => {
  try {
    const queryString = buildQueryString(filters);
    const response = await Get(`/addOn/all${queryString ? `?${queryString}` : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching AddOns:", error);
    return [];
  }
};

/**
 * Fetch AddOns by category (public)
 * @param {string} category
 */
export const fetchAddOnsByCategory = async (category) => {
  try {
    const response = await Get(`/addOn/category/${category}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching AddOns by category:", error);
    return [];
  }
};
