import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // Check if environment variable is set
  const envBaseURL = import.meta.env.VITE_API_BASE_URL;
  
  // In production, use the environment variable or fallback to the default backend URL
  if (import.meta.env.PROD) {
    return envBaseURL || 'https://api.rwandaavocados.rw/api';
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

// Helper: build an Error that still carries the original axios error.response
// so downstream code (e.g. error.response?.data in usersService.js) keeps working.
const rejectWithResponse = (message, originalError) => {
  const err = new Error(message);
  err.response = originalError.response;
  err.status = originalError.response?.status;
  return Promise.reject(err);
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
      return rejectWithResponse(response.data.message || 'API request failed', { response });
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
        window.location.href = '/';
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
          const response = await axios.post(`${getBaseURL()}/auth/refresh`, { refreshToken });
          const { token: newToken } = response.data.data;

          localStorage.setItem('token', newToken);
          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          processQueue(null, newToken);

          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          return Promise.reject(new Error('Session expired. Please log in again.'));
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }
    
    // Handle other error statuses with specific messages
    if (error.response?.status === 403) {
      return rejectWithResponse('Access denied. You do not have permission to perform this action.', error);
    }
    
    // Add specific handling for 409 Conflict errors (user already exists)
    if (error.response?.status === 409) {
      return rejectWithResponse('User with this email already exists.', error);
    }
    
    // Add specific handling for 400/422 validation errors
    if (error.response?.status === 400 || error.response?.status === 422) {
      const data = error.response?.data;
      const details = data?.errors || data?.data?.errors;
      const detailMsg = Array.isArray(details) && details.length > 0
        ? details.map(d => (typeof d === 'string' ? d : d.message || d.msg || JSON.stringify(d))).join('; ')
        : (data?.message || data?.data?.message || 'Validation error. Please check your input data.');

      return rejectWithResponse(detailMsg, error);
    }
    
    // Add specific handling for 429 Too Many Requests errors
    if (error.response?.status === 429) {
      return rejectWithResponse('Too many requests. Please try again later.', error);
    }
    
    if (error.response?.status === 404) {
      const endpoint = error.config?.url || 'endpoint';
      console.error('🚨 404 Not Found:', {
        endpoint,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${endpoint}`,
        method: error.config?.method
      });
      return rejectWithResponse(`Resource not found: ${endpoint}. Please check if the API endpoint is correct.`, error);
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
      return rejectWithResponse(errorMessage, error);
    }
    
    // Extract error message from response if available
    if (error.response?.data?.message) {
      return rejectWithResponse(error.response.data.message, error);
    }
    
    if (error.response?.data?.data?.message) {
      return rejectWithResponse(error.response.data.data.message, error);
    }
    
    return rejectWithResponse('An unexpected error occurred. Please try again.', error);
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