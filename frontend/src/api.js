import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Category APIs
export const getCategories = async (status = 'all') => {
  const response = await api.get('/categories', { params: { status } });
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await api.post('/categories', payload);
  return response.data;
};

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/categories/${id}`, payload);
  return response.data;
};

export const updateCategoryStatus = async (id, payload) => {
  const response = await api.patch(`/categories/${id}/status`, payload);
  return response.data;
};

// Order APIs
export const placeOrder = async (payload) => {
  const response = await api.post('/orders', payload);
  return response.data;
};

export const getOrders = async (filters = {}) => {
  const response = await api.get('/orders', { params: filters });
  return response.data;
};

export const getOrderDetails = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, payload) => {
  const response = await api.put(`/orders/${id}/status`, payload);
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.patch(`/orders/${id}/cancel`);
  return response.data;
};

// Customer APIs
export const createCustomer = async (payload) => {
  const response = await api.post('/customers', payload);
  return response.data;
};

export const getCustomers = async (filters = {}) => {
  const response = await api.get('/customers', { params: filters });
  return response.data;
};

export const getCustomerDetails = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const updateCustomer = async (id, payload) => {
  const response = await api.put(`/customers/${id}`, payload);
  return response.data;
};

export const deactivateCustomer = async (id) => {
  const response = await api.patch(`/customers/${id}/deactivate`);
  return response.data;
};

export const reactivateCustomer = async (id) => {
  const response = await api.patch(`/customers/${id}/reactivate`);
  return response.data;
};

