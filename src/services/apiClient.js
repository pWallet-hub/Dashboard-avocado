import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'https://dash-api-hnyp.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;