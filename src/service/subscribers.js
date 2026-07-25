import { Get } from "./axiosService";

export const fetchSubscribers = async () => {
  const response = await Get("/subscribers");
  return response.data;
};
