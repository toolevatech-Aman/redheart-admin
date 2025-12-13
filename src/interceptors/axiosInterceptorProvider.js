import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import setupAxiosInterceptors from "./setupAxiosInterceptors";

const AxiosInterceptorProvider = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return children;
};

export default AxiosInterceptorProvider;