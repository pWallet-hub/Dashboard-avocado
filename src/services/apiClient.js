import axios from 'axios';

// API Configuration based on backend documentation
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dash-api-hnyp.onrender.com/api';
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:5000';

console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 Public Base URL:', PUBLIC_BASE_URL);

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});



// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;