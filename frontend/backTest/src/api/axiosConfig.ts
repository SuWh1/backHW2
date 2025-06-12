import axios from "axios";

export const API_URL = "http://localhost:8000";

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const attachTokenInterceptor = (token: string | null) => {
    return axiosInstance.interceptors.request.use((config) => {
        if (!config.headers) config.headers = {};
        if (token) config.headers["Authorization"] = `Bearer ${token}`;
        
        return config;
    });
};