// src/data/api/index.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://13.235.238.42:4060/api";
// import.meta.env.VITE_API_BASE || "http://localhost:4060/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // If your refresh uses cookies instead of a refresh token, set:
  // withCredentials: true,
});

// Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Refresh handling (token-in-body) ----
let isRefreshing = false;
let queue = [];

function flushQueue(error, token) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!error.response) return Promise.reject(error);

    // avoid loops if refresh itself fails
    if (original?.url?.includes("/auth/refresh")) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.replace("/login");
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (newToken) => {
              original.headers.Authorization = "Bearer " + newToken;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const storedRefresh = localStorage.getItem("refreshToken");
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh: storedRefresh,
        });

        const newAccess = data.access || data.token;
        const newRefresh = data.refresh || data.refreshToken || storedRefresh;
        if (!newAccess) throw new Error("No access token in refresh response");

        localStorage.setItem("token", newAccess);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
        api.defaults.headers.common.Authorization = "Bearer " + newAccess;

        flushQueue(null, newAccess);

        original.headers.Authorization = "Bearer " + newAccess;
        return api(original);
      } catch (err) {
        flushQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.replace("/login");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
