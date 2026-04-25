import axios from "axios";

const api = axios.create({
  baseURL: "https://api.accio.uz",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token");
        const { data } = await axios.post(
          "https://api.accio.uz/api/v1/auth/refresh",
          { refresh }
        );
        localStorage.setItem("access_token", data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return api.request(error.config);
      } catch {
        localStorage.clear();
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
