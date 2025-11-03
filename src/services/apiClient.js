import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // Check if environment variable is set
  const envBaseURL = import.meta.env.VITE_API_BASE_URL;
  
  // In production, use the environment variable or fallback to the default backend URL
  if (import.meta.env.PROD) {
    return envBaseURL || 'https://dash-api-hnyp.onrender.com/api';
  }
  
  // In development, use the Vite proxy
  return '/api';
};

console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔗 API Base URL:', getBaseURL());

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds timeout (for backend cold starts on Render.com)
});

// Track if we're already refreshing token to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`, response.data);
    // If response has success: false, reject with error message
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'API request failed'));
    }
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }
    
    // Handle token refresh for 401 errors (except for refresh token requests)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh token requests
      if (originalRequest.url.includes('/auth/refresh')) {
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post('https://dash-api-hnyp.onrender.com/api/auth/refresh', { refreshToken });
          const { token: newToken } = response.data.data;
          
          localStorage.setItem('token', newToken);
          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          processQueue(null, newToken);
          
          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired. Please log in again.'));
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }
    
    // Handle other error statuses with specific messages
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
    }
    
    // Add specific handling for 409 Conflict errors (user already exists)
    if (error.response?.status === 409) {
      return Promise.reject(new Error('User with this email already exists.'));
    }
    
    // Add specific handling for 422 Unprocessable Entity errors
    if (error.response?.status === 422) {
      return Promise.reject(new Error('Validation error. Please check your input data.'));
    }
    
    // Add specific handling for 429 Too Many Requests errors
    if (error.response?.status === 429) {
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }
    
    if (error.response?.status === 404) {
      const endpoint = error.config?.url || 'endpoint';
      console.error('🚨 404 Not Found:', {
        endpoint,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${endpoint}`,
        method: error.config?.method
      });
      return Promise.reject(new Error(`Resource not found: ${endpoint}. Please check if the API endpoint is correct.`));
    }
    
    if (error.response?.status === 500) {
      console.error('🚨 500 Server Error:', {
        endpoint: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        responseData: error.response?.data,
        fullError: error.response
      });
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Server error. Please try again later.';
      return Promise.reject(new Error(errorMessage));
    }
    
    // Extract error message from response if available
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    
    if (error.response?.data?.data?.message) {
      return Promise.reject(new Error(error.response.data.data.message));
    }
    
    return Promise.reject(new Error('An unexpected error occurred. Please try again.'));
  }
);

// Helper function to extract data from standardized API response
export const extractData = (response) => {
  if (response && response.data && response.data.success) {
    return response.data.data;
  }
  return response;
};

export default apiClient;