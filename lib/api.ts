import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9760',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn token nếu có (cho tính năng login sau này)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;