import { Get, Post, Patch } from "./axiosService";

export const fetchAdmins = async () => (await Get("/user/admin/admins")).data;
export const searchUsersForAccess = async (q) => (await Get("/user/admin/search", { q })).data;
export const updateUserAccess = async (userId, payload) =>
  (await Patch(`/user/admin/${userId}/access`, payload)).data;
// Pre-authorizes an email that has never logged in — access applies the
// moment they sign into the admin panel with that Google account.
export const inviteAdminByEmail = async (email, accessLevel) =>
  (await Post("/user/admin/invite", { email, accessLevel })).data;
