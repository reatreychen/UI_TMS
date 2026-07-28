import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh Token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            }, {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              }
            });

            const newAccessToken = data.data?.accessToken;
            if (newAccessToken) {
              localStorage.setItem("accessToken", newAccessToken);
              if (data.data?.refreshToken) {
                localStorage.setItem("refreshToken", data.data.refreshToken);
              }
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            }
          } catch (refreshErr) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
