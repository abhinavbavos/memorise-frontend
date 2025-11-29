// src/data/api/auth.js
import api from "./index";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const changePassword = (data) => api.post("/auth/change-password", data);
export const getProfile = () => api.get("/users/me");
