import { Get, Post, Put, Delete } from "./axiosService";

export const fetchThemes = async () => (await Get("/themes/admin")).data;
export const createTheme = async (body) => (await Post("/themes/admin", body)).data;
export const updateTheme = async (id, body) => (await Put(`/themes/admin/${id}`, body)).data;
export const removeTheme = async (id) => (await Delete(`/themes/admin/${id}`)).data;
export const previewThemeColour = async (primary) => (await Post("/themes/admin/preview", { primary })).data;
