import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '../config';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: config.api.url,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token if it exists
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    register: (userData: any) =>
      api.post('/auth/register', userData),
    logout: () =>
      api.post('/auth/logout'),
    forgotPassword: (email: string) =>
      api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
      api.post('/auth/reset-password', { token, password }),
    verifyToken: () =>
      api.get('/auth/verify'),
  },

  // User endpoints
  users: {
    getProfile: () =>
      api.get('/users/profile'),
    updateProfile: (data: any) =>
      api.put('/users/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/users/change-password', data),
    getAll: (params?: any) =>
      api.get('/users', { params }),
    getById: (id: string) =>
      api.get(`/users/${id}`),
    create: (data: any) =>
      api.post('/users', data),
    update: (id: string, data: any) =>
      api.put(`/users/${id}`, data),
    delete: (id: string) =>
      api.delete(`/users/${id}`),
  },

  // Hospital endpoints
  hospitals: {
    getAll: (params?: any) =>
      api.get('/hospitals', { params }),
    getById: (id: string) =>
      api.get(`/hospitals/${id}`),
    create: (data: any) =>
      api.post('/hospitals', data),
    update: (id: string, data: any) =>
      api.put(`/hospitals/${id}`, data),
    delete: (id: string) =>
      api.delete(`/hospitals/${id}`),
    getStatistics: (id: string) =>
      api.get(`/hospitals/${id}/statistics`),
  },

  // Onboarding endpoints
  onboarding: {
    submitApplication: (data: any) =>
      api.post('/onboarding/applications', data),
    getApplications: (params?: any) =>
      api.get('/onboarding/applications', { params }),
    getApplicationById: (id: string) =>
      api.get(`/onboarding/applications/${id}`),
    updateApplicationStatus: (id: string, status: string) =>
      api.put(`/onboarding/applications/${id}/status`, { status }),
    uploadDocument: (applicationId: string, formData: FormData) =>
      api.post(`/onboarding/applications/${applicationId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    generateContract: (applicationId: string) =>
      api.post(`/onboarding/applications/${applicationId}/contract`),
    signContract: (applicationId: string, signature: any) =>
      api.post(`/onboarding/applications/${applicationId}/sign`, signature),
  },

  // Patient endpoints
  patients: {
    getAll: (params?: any) =>
      api.get('/patients', { params }),
    getById: (id: string) =>
      api.get(`/patients/${id}`),
    create: (data: any) =>
      api.post('/patients', data),
    update: (id: string, data: any) =>
      api.put(`/patients/${id}`, data),
    delete: (id: string) =>
      api.delete(`/patients/${id}`),
    getMedicalHistory: (id: string) =>
      api.get(`/patients/${id}/medical-history`),
    addMedicalRecord: (id: string, data: any) =>
      api.post(`/patients/${id}/medical-records`, data),
  },

  // Appointment endpoints
  appointments: {
    getAll: (params?: any) =>
      api.get('/appointments', { params }),
    getById: (id: string) =>
      api.get(`/appointments/${id}`),
    create: (data: any) =>
      api.post('/appointments', data),
    update: (id: string, data: any) =>
      api.put(`/appointments/${id}`, data),
    cancel: (id: string, reason?: string) =>
      api.delete(`/appointments/${id}`, { data: { reason } }),
    getAvailableSlots: (doctorId: string, date: string) =>
      api.get(`/appointments/slots`, { params: { doctorId, date } }),
  },

  // Billing endpoints
  billing: {
    getInvoices: (params?: any) =>
      api.get('/billing/invoices', { params }),
    getInvoiceById: (id: string) =>
      api.get(`/billing/invoices/${id}`),
    createInvoice: (data: any) =>
      api.post('/billing/invoices', data),
    updateInvoice: (id: string, data: any) =>
      api.put(`/billing/invoices/${id}`, data),
    processPayment: (invoiceId: string, paymentData: any) =>
      api.post(`/billing/invoices/${invoiceId}/pay`, paymentData),
    getPaymentMethods: () =>
      api.get('/billing/payment-methods'),
    submitInsuranceClaim: (data: any) =>
      api.post('/billing/insurance-claims', data),
  },

  // Inventory endpoints
  inventory: {
    getItems: (params?: any) =>
      api.get('/inventory/items', { params }),
    getItemById: (id: string) =>
      api.get(`/inventory/items/${id}`),
    createItem: (data: any) =>
      api.post('/inventory/items', data),
    updateItem: (id: string, data: any) =>
      api.put(`/inventory/items/${id}`, data),
    updateStock: (id: string, quantity: number) =>
      api.post(`/inventory/items/${id}/stock`, { quantity }),
    getStockAlerts: () =>
      api.get('/inventory/alerts'),
    createPurchaseOrder: (data: any) =>
      api.post('/inventory/purchase-orders', data),
  },

  // Analytics endpoints
  analytics: {
    getDashboardMetrics: (params?: any) =>
      api.get('/analytics/dashboard', { params }),
    getHospitalMetrics: (hospitalId: string, params?: any) =>
      api.get(`/analytics/hospitals/${hospitalId}`, { params }),
    getPatientMetrics: (params?: any) =>
      api.get('/analytics/patients', { params }),
    getFinancialMetrics: (params?: any) =>
      api.get('/analytics/financial', { params }),
    generateReport: (type: string, params: any) =>
      api.post('/analytics/reports', { type, params }),
  },

  // Operations endpoints
  operations: {
    getCommandCenter: () =>
      api.get('/operations/command-center'),
    getAlerts: (params?: any) =>
      api.get('/operations/alerts', { params }),
    acknowledgeAlert: (id: string) =>
      api.put(`/operations/alerts/${id}/acknowledge`),
    getProjects: (params?: any) =>
      api.get('/operations/projects', { params }),
    createProject: (data: any) =>
      api.post('/operations/projects', data),
    updateProject: (id: string, data: any) =>
      api.put(`/operations/projects/${id}`, data),
  },

  // Communication endpoints
  communication: {
    sendSMS: (data: { to: string; message: string }) =>
      api.post('/communication/sms', data),
    sendWhatsApp: (data: { to: string; message: string; mediaUrl?: string }) =>
      api.post('/communication/whatsapp', data),
    sendEmail: (data: { to: string; subject: string; body: string }) =>
      api.post('/communication/email', data),
    getCampaigns: (params?: any) =>
      api.get('/communication/campaigns', { params }),
    createCampaign: (data: any) =>
      api.post('/communication/campaigns', data),
  },
};

export default api;
