import { Get, Patch } from "./axiosService";

export const fetchInvitations = async (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
  return (await Get(`/invitation-admin/list${qs ? `?${qs}` : ""}`)).data;
};
export const fetchInvitationStats = async () => (await Get("/invitation-admin/stats")).data;
export const fetchInvitation = async (publicId) => (await Get(`/invitation-admin/${encodeURIComponent(publicId)}`)).data;
export const setInvitationDisabled = async (publicId, disabled) => (await Patch(`/invitation-admin/${encodeURIComponent(publicId)}/disable`, { disabled })).data;
