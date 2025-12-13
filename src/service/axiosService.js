import axios from "axios";
import * as localStorageService from "./localStorageService";
import { LocalStorageKeys } from "../constants/localStorageKeys";

const apiClient = axios.create({
  baseURL: "https://backend.redheart.in/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorageService.getValue(LocalStorageKeys.authToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);


export const Get = async (url, params = {}, config = {}) => {
  const response = await apiClient.get(url, { params, ...config });
  return response;
};

export const Post = async (url, data = {}, config = {}) => {
  const response = await apiClient.post(url, data, config);
  return response;
};

export const Put = async (url, data = {}, config = {}) => {
  const response = await apiClient.put(url, data, config);
  return response;
};

export const Delete = async (url, config = {}) => {
  const response = await apiClient.delete(url, config);
  return response;
};

export const Patch = async (url, data = {}, config = {}) => {
  const response = await apiClient.patch(url, data, config);
  return response;
};

export const PostMultipart = async (url, file, config = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};
export default apiClient;
