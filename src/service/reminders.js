import { Get } from "./axiosService";

export const fetchAllReminders = async (params = {}) => (await Get("/reminders/admin/all", params)).data;
