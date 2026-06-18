import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("nuri_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nuri_token");
      localStorage.removeItem("nuri_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  register: (data: { email: string; password: string; company_name?: string; country?: string; export_market?: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

// Documents
export const documents = {
  upload: (file: File, docType: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", docType);
    return api.post("/documents/upload", form).then((r) => r.data);
  },
  list: () => api.get("/documents").then((r) => r.data),
  delete: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),
};

// Analysis
export const analysis = {
  analyze: (documentId: string, standard: string) =>
    api.post(`/analyze/${documentId}`, { standard }).then((r) => r.data),
};

// Reports
export const reports = {
  list: () => api.get("/reports").then((r) => r.data),
  get: (id: string) => api.get(`/reports/${id}`).then((r) => r.data),
};

// Chat
export const chat = {
  send: (message: string, reportId?: string, documentId?: string) => {
    const token = localStorage.getItem("nuri_token");
    return fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, report_id: reportId, document_id: documentId }),
    });
  },
};

// Checklists
export const checklists = {
  get: (standard: string) => api.get(`/checklists/${standard}`).then((r) => r.data),
  getProgress: (standard: string) => api.get(`/checklists/${standard}/progress`).then((r) => r.data),
  save: (standard: string, completedItems: string[]) =>
    api.post(`/checklists/${standard}/save`, { completed_items: completedItems }).then((r) => r.data),
};

export default api;
