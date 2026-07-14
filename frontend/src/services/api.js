import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getUser: () => api.get('/auth/user')
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart')
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  process: (id, data) => api.put(`/orders/${id}/process`, data)
};

// Sales API
export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  export: (params) => api.get('/sales/export', { params, responseType: 'blob' }),
  create: (data) => api.post('/sales', data)
};

// Stock API
export const stockAPI = {
  getLowStock: (threshold) => api.get('/stock/low-stock', { params: { threshold } }),
  getSummary: () => api.get('/stock/stock-summary')
};

// Users API (Admin)
export const usersAPI = {
  getStaff: () => api.get('/users/staff'),
  createStaff: (data) => api.post('/users/staff', data),
  updateStaff: (id, data) => api.put(`/users/staff/${id}`, data),
  disableStaff: (id, isActive) => api.put(`/users/staff/${id}/disable`, { isActive }),
  deleteStaff: (id) => api.delete(`/users/staff/${id}`)
};

export default api;
