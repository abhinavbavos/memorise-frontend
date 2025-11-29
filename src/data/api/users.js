// src/data/api/users.js
import api from "./index";

// Me
export const getMyProfile = () => api.get("/users/me");
export const updateMyProfile = (data) => api.put("/users/me", data);
export const deleteMyAccount = () => api.delete("/users/me");

// Avatar / cover via presign → PUT to S3 (client) → set key
export const presignAvatar = (contentType, size) =>
  api.get("/users/me/presign/avatar", { params: { contentType, size } });

export const presignCover = (contentType, size) =>
  api.get("/users/me/presign/cover", { params: { contentType, size } });

export const setAvatar = (fileKey) => api.post("/users/me/avatar", { fileKey });
export const setCover = (fileKey) => api.post("/users/me/cover", { fileKey });

// Public profile (shared link)
export const getPublicProfileById = (publicId, params) =>
  api.get(`/users/public/${publicId}`, { params });
