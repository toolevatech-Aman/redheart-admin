import { Get, Patch } from "./axiosService";

export const fetchAdmins = async () => (await Get("/user/admin/admins")).data;
export const searchUsersForAccess = async (q) => (await Get("/user/admin/search", { q })).data;
export const updateUserAccess = async (userId, payload) =>
  (await Patch(`/user/admin/${userId}/access`, payload)).data;
