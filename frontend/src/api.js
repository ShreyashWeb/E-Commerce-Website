import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

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
