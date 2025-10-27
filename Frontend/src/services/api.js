// api.js
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://learning-management-system-using-react.onrender.com/api"; // ✅ your deployed backend

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- AUTH ----------
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// ---------- BATCH ----------
export const batchAPI = {
  getAll: (params) => api.get("/batches", { params }),
  getById: (id) => api.get(`/batches/${id}`),
  create: (data) => api.post("/batches", data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
  toggleStatus: (id) => api.patch(`/batches/${id}/toggle-status`),
};

// ---------- STUDENT ----------
export const studentAPI = {
  getAll: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  getByBatch: (batchId) => api.get(`/students/batch/${batchId}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// ---------- MARK ----------
export const markAPI = {
  getAll: (params) => api.get("/marks", { params }),
  getById: (id) => api.get(`/marks/${id}`),
  getByStudent: (studentId) => api.get(`/marks/student/${studentId}`),
  getByBatch: (batchId) => api.get(`/marks/batch/${batchId}`),
  getStatistics: (studentId) => api.get(`/marks/statistics/${studentId}`),
  create: (data) => api.post("/marks", data),
  update: (id, data) => api.put(`/marks/${id}`, data),
  delete: (id) => api.delete(`/marks/${id}`),
};

export default api;
