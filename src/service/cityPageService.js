import { Get, Post, Put, Delete } from "./axiosService";

/**
 * Fetch all city pages for a given category, sorted by cityName.
 * @param {string} category  "Flowers" | "Cakes" | "Plants"
 */
export const getCities = (category) =>
  Get(`/city/cities/${category}`);

/**
 * Add a single city page.
 * @param {string} category
 * @param {string} cityName  Raw city name, e.g. "Bangalore"
 */
export const addCity = (category, cityName) =>
  Post("/city/cities", { category, cityName });

/**
 * Bulk-add city pages.
 * @param {string}   category
 * @param {string[]} cityNames  Array of raw city name strings
 * @returns {{ added: string[], skipped: string[], errors: object[] }}
 */
export const addCitiesBulk = (category, cityNames) =>
  Post("/city/cities/bulk", { category, cityNames });

/**
 * Update SEO fields for a city page.
 * @param {string} id    MongoDB _id
 * @param {object} data  Fields: metaTitle, metaDescription, h1, canonicalUrl,
 *                              metaKeyword, footerContent, faqs
 */
export const updateCity = (id, data) =>
  Put(`/city/cities/${id}`, data);

/**
 * Delete a city page.
 * @param {string} id  MongoDB _id
 */
export const deleteCity = (id) =>
  Delete(`/city/cities/${id}`);

/**
 * Regenerate SEO fields (metaTitle, metaDescription, h1, metaKeyword, breadcrumb, canonicalUrl)
 * for ALL existing cities of a given category using the latest templates.
 * footerContent and faqs are preserved.
 * @param {string} category  "Flowers" | "Cakes" | "Plants"
 */
export const regenerateCities = (category) =>
  Post(`/city/cities/regenerate/${category}`, {});
