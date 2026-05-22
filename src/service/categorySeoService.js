import { Get, Post, Put } from "./axiosService";

export const getCategoryPages = () =>
  Get("/category-seo");

export const updateCategoryPage = (id, data) =>
  Put(`/category-seo/${id}`, data);

export const seedCategoryPages = (pages) =>
  Post("/category-seo/seed", { pages });
