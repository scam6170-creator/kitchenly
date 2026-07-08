import api from './client';

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export const productsAPI = {
  list: (page?: number, limit?: number) =>
    api.get('/products', { params: { page, limit } }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  list: () => api.get('/categories'),
  create: (name: string, description: string) =>
    api.post('/categories', { name, description }),
  update: (id: string, name: string, description: string) =>
    api.put(`/categories/${id}`, { name, description }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const stockAPI = {
  list: (productId?: string) => api.get('/stock', { params: { product_id: productId } }),
  add: (data: any) => api.post('/stock', data),
  lowStock: () => api.get('/stock/low-stock/alert'),
};

export const salesAPI = {
  list: (startDate?: string, endDate?: string) =>
    api.get('/sales', { params: { start_date: startDate, end_date: endDate } }),
  create: (data: any) => api.post('/sales', data),
  dailySummary: () => api.get('/sales/daily/summary'),
};

export const usersAPI = {
  list: (role?: string, status?: string) =>
    api.get('/users', { params: { role, status } }),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  resetPassword: (id: string, password: string) =>
    api.post(`/users/${id}/reset-password`, { new_password: password }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
  recentSales: () => api.get('/dashboard/recent-sales'),
  recentStock: () => api.get('/dashboard/recent-stock'),
  topProducts: () => api.get('/dashboard/top-products'),
  monthlyRevenue: () => api.get('/dashboard/monthly-revenue'),
};

export const searchAPI = {
  search: (query: string) => api.get('/search', { params: { q: query } }),
};

export const reportsAPI = {
  daily: (date?: string) => api.get('/reports/daily', { params: { date } }),
  weekly: () => api.get('/reports/weekly'),
  monthly: () => api.get('/reports/monthly'),
  yearly: () => api.get('/reports/yearly'),
  bestSelling: (period?: string) =>
    api.get('/reports/best-selling', { params: { period } }),
  stock: () => api.get('/reports/stock'),
  profit: (startDate?: string, endDate?: string) =>
    api.get('/reports/profit', { params: { start_date: startDate, end_date: endDate } }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};
