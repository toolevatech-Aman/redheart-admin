import apiClient from "../service/axiosService";
import * as localStorageService from "../service/localStorageService";
import { LocalStorageKeys } from "../constants/localStorageKeys";

let controller = new AbortController();
let interceptorsInitialized = false;

const setupAxiosInterceptors = (navigate) => {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  const cancelAllRequests = (reason = "Operation canceled by user.") => {
    controller.abort();
    console.warn(reason);
    controller = new AbortController();
  };

  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorageService.getValue(LocalStorageKeys.authToken);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      config.signal = controller.signal;
      return config;
    },
    (error) => Promise.reject(error)
  );


  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.name === "CanceledError") return Promise.reject(error);

      const status = error?.response?.status;
      if (status === 401) {
        cancelAllRequests("Access token expired. Logging out.");
        localStorageService.clearAllExcept(["selectedCountry" , "cart"]);

        const currentPath = window.location.pathname + window.location.search;
        console.log(currentPath,"cuurr")
        localStorageService.setValue("redirectAfterLogin", currentPath);

        navigate("/login");
        return Promise.reject(error);
      }



      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.title ||
        "An unexpected error occurred.";

      console.error("API Error:", message);
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;