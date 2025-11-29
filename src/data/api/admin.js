// src/data/api/admin.js
import api from "./index";

/* ---------------- Dashboard & Recents ---------------- */
export const getDashboard = () => api.get("/admin/dashboard");
export const getRecentUsers = (params) =>
  api.get("/admin/users/recent", { params }); // { limit? }
export const getRecentSubscriptions = (params) =>
  api.get("/admin/subscriptions/recent", { params }); // { limit? }

/* ---------------- Moderation: Posts ---------------- */
export const hidePost = (id) => api.put(`/admin/posts/${id}/hide`);
export const removePost = (id) => api.put(`/admin/posts/${id}/remove`);

/* ---------------- Users ---------------- */
export const listUsers = (params) => api.get("/admin/users", { params }); // { search?, page?, limit?, sort? }
export const getUserDetail = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Prefer PATCH; backend accepts PATCH and PUT (router has both)
export const setUserStatus = (id, status) =>
  api.patch(`/admin/users/${id}/status`, { status });

/* ---------------- Payments ---------------- */
export const listPayments = (params) => api.get("/admin/payments", { params }); // { page?, limit?, status?, startDate?, endDate?, search? }
export const getPaymentDetail = (id) => api.get(`/admin/payments/${id}`);
export const addManualPayment = (data) =>
  api.post("/admin/payments/manual", data);

/* ---------------- Reports (queue + actions) ---------------- */
// GET queue: /admin/reports?status=open|reviewed|all&type=user|post|all&page=&pageSize=
export const listReports = (params) => api.get("/admin/reports", { params });

// Generic resolver (accept/reject; for posts pass { action: 'remove' } to hard remove)
export const resolveReport = (id, body) =>
  api.patch(`/admin/reports/${id}`, body);

// Convenience wrappers:
export const acceptUserReport = (reportId, note = "") =>
  resolveReport(reportId, { decision: "accept", note }); // will ban user

export const rejectUserReport = (reportId, note = "") =>
  resolveReport(reportId, { decision: "reject", note });

export const acceptPostReport = (reportId, note = "") =>
  resolveReport(reportId, { decision: "accept", note }); // hides post

export const removeReportedPost = (reportId, note = "") =>
  resolveReport(reportId, { decision: "accept", action: "remove", note }); // removes post

export const rejectPostReport = (reportId, note = "") =>
  resolveReport(reportId, { decision: "reject", note });

// Bulk resolve: { ids: string[], decision: 'accept'|'reject', action?: 'remove', note?: string }
export const bulkResolveReports = (payload) =>
  api.post("/admin/reports/bulk-resolve", payload);

/* ---------------- Audit (revert an admin action) ---------------- */
// Revert by audit log id (for reversible actions)
export const revertAction = (auditId) =>
  api.post(`/admin/actions/${auditId}/revert`);

/* ---------------- Settings ---------------- */
export const getSettings = () => api.get("/admin/settings");
export const updateSettings = (data) => api.put("/admin/settings", data);
