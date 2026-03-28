import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sm_token");
      localStorage.removeItem("sm_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────
export const register = (data) => api.post("/auth/register", data);
export const login    = (data) => api.post("/auth/login", data);
export const getMe    = ()     => api.get("/auth/me");

// ─── Notes ──────────────────────────────────────────────
export const uploadNote    = (formData, onProgress) =>
  api.post("/notes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
export const getNotes      = ()     => api.get("/notes");
export const getNoteById   = (id)   => api.get(`/notes/${id}`);
export const summarizeNote = (id)   => api.post(`/notes/${id}/summarize`);
export const deleteNote    = (id)   => api.delete(`/notes/${id}`);

// ─── Chat ────────────────────────────────────────────────
export const createSession      = (noteId)            => api.post("/chat/session", { noteId });
export const sendMessage        = (sessionId, message) => api.post(`/chat/${sessionId}/message`, { message });
export const getChatHistory     = (sessionId)          => api.get(`/chat/${sessionId}/history`);
export const getSessionsForNote = (noteId)             => api.get(`/chat/sessions/${noteId}`);
export const deleteSession      = (sessionId)          => api.delete(`/chat/${sessionId}`);

export default api;
