import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://blueframe-backend-demo.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: اضافه کردن token به همه requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('blueframe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor: handle 401 (logout)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('blueframe_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ============ Distributors ============
export const distributorsApi = {
  list: () => api.get('/distributors'),
  get: (id: string) => api.get(`/distributors/${id}`),
  create: (data: any) => api.post('/distributors', data),
};

// ============ Routes ============
export const routesApi = {
  list: () => api.get('/routes'),
  get: (id: string) => api.get(`/routes/${id}`),
  create: (data: any) => api.post('/routes', data),
  addStop: (id: string, data: any) => api.post(`/routes/${id}/stops`, data),
};

// ============ Invoices ============
export const invoicesApi = {
  list: () => api.get('/invoices'),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  updateStatus: (id: string, status: string) => api.patch(`/invoices/${id}/status`, { status }),
  downloadPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  getByToken: (token: string) => api.get(`/invoices/verify/${token}`),
  verify: (token: string, data: any) => api.post(`/invoices/verify/${token}`, data),
};

// ============ Products / Customers ============
export const productsApi = {
  list: () => api.get('/inventory/products'),
};

export const customersApi = {
  list: () => api.get('/crm/customers'),
};

// ============ Auth ============
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};
