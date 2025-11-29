// src/data/api/posts.js
import api from "./index";

// Owner
export const myPosts = () => api.get("/posts/me");
export const presignMyPost = (contentType, size) =>
  api
    .get("/posts/me/presign", { params: { contentType, size } })
    .then((r) => r.data);
export const createPost = (payload) => api.post("/posts", payload);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Public-by-user (supports category + pagination if backend enabled)
export const listPostsByUser = (userId, params = {}) =>
  api.get(`/posts/user/${userId}`, { params });
