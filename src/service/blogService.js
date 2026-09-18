import { Get, Post, Put, Delete } from "./axiosService";

// ── Categories ────────────────────────────────────────────────────────────
export const fetchBlogCategories = async () => (await Get("/blogs/categories")).data;
export const createBlogCategory = async (data) => (await Post("/blogs/categories", data)).data;
export const updateBlogCategory = async (id, data) => (await Put(`/blogs/categories/${id}`, data)).data;
export const deleteBlogCategory = async (id) => (await Delete(`/blogs/categories/${id}`)).data;

// ── Subcategories ────────────────────────────────────────────────────────
export const fetchBlogSubcategories = async (categoryId) =>
  (await Get("/blogs/subcategories", categoryId ? { category: categoryId } : {})).data;
export const createBlogSubcategory = async (data) => (await Post("/blogs/subcategories", data)).data;
export const updateBlogSubcategory = async (id, data) => (await Put(`/blogs/subcategories/${id}`, data)).data;
export const deleteBlogSubcategory = async (id) => (await Delete(`/blogs/subcategories/${id}`)).data;

// ── Posts ─────────────────────────────────────────────────────────────────
export const fetchAllBlogPosts = async () => (await Get("/blogs/admin/all")).data;
export const fetchBlogQueueStatus = async () => (await Get("/blogs/admin/queue-status")).data;
export const fetchBlogPostById = async (id) => (await Get(`/blogs/admin/${id}`)).data;
export const createBlogPost = async (data) => (await Post("/blogs", data)).data;
export const updateBlogPost = async (id, data) => (await Put(`/blogs/${id}`, data)).data;
export const deleteBlogPost = async (id) => (await Delete(`/blogs/${id}`)).data;
