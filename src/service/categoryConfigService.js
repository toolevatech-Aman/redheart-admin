import { Get, Post, Put, Delete } from "./axiosService";
import apiClient from "./axiosService";

/**
 * Fetch all category configs.
 */
export const listCategoryConfigs = () =>
  Get("/category-config");

/**
 * Get a single category config by name.
 * @param {string} name  e.g. "Combos"
 */
export const getCategoryConfig = (name) =>
  Get(`/category-config/${encodeURIComponent(name)}`);

/**
 * Create a new category config.
 * @param {object} data  CategoryConfig payload
 */
export const createCategoryConfig = (data) =>
  Post("/category-config", data);

/**
 * Update a category config by name.
 * @param {string} name
 * @param {object} data  Partial or full CategoryConfig payload
 */
export const updateCategoryConfig = (name, data) =>
  Put(`/category-config/${encodeURIComponent(name)}`, data);

/**
 * Delete a category config by name.
 * @param {string} name
 */
export const deleteCategoryConfig = (name) =>
  Delete(`/category-config/${encodeURIComponent(name)}`);

/**
 * Generate city pages for a given category using its SEO templates.
 * @param {string}   name       Category config name
 * @param {string[]} cityNames  Optional; if omitted, backend uses default 30 cities
 */
export const generateCityPages = (name, cityNames) =>
  Post(`/category-config/${encodeURIComponent(name)}/generate-cities`, cityNames ? { cityNames } : {});

/**
 * Download XLSX upload template for a category config.
 * @param {string} name
 */
export const downloadTemplate = (name) =>
  apiClient.get(`/category-config/${encodeURIComponent(name)}/template`, {
    responseType: "blob",
  });
