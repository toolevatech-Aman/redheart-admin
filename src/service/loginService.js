// src/services/loginService.js

import { Post } from "./axiosService";



export const sendOtpApi = async (phone) => {
  const payload = { phone };
  const response = await Post("/auth/send-otp", payload);
  return response.data;
};

export const verifyOtpApi = async (sessionId, otp, phone) => {
  const payload = { sessionId, otp, phone };
  const response = await Post("/auth/verify-otp", payload);
  return response.data;
};