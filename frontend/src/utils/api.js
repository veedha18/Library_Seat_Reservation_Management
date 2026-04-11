import axios from 'axios';

// ✅ HARDCODED BACKEND URL (NO ENV, NO FALLBACK)
const BASE_URL = "https://library-seat-reservation-management-3.onrender.com/api";

console.log("✅ API BASE URL:", BASE_URL); // 🔍 helps you verify in browser console

const API = axios.create({
  baseURL: BASE_URL,
});

// ✅ Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ API ERROR:", err.response?.data || err.message);

    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default API;