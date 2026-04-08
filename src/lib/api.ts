import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (formData: FormData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, formData: FormData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// ─── Billing ─────────────────────────────────────────────────────────────────
export const billingAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/billing', { params }),
  getById: (id: number) => api.get(`/billing/${id}`),
  create: (data: object) => api.post('/billing', data),
  updateStatus: (id: number, status: string, notes?: string) =>
    api.put(`/billing/${id}`, { status, notes }),
  delete: (id: number) => api.delete(`/billing/${id}`),
  getStats: () => api.get('/billing/stats/summary'),
};

// ─── PDF ──────────────────────────────────────────────────────────────────────
export const pdfAPI = {
  download: (invoiceId: number) =>
    `${API_BASE}/pdf/${invoiceId}?token=${localStorage.getItem('token')}`,
  generate: (invoiceId: number) =>
    api.get(`/pdf/${invoiceId}`, { responseType: 'blob' }),
};

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: object) => api.put('/settings', data),
};

export default api;
