import apiClient, { extractData } from './apiClient';

// Get dashboard statistics
export async function getDashboardStatistics() {
  const response = await apiClient.get('/analytics/dashboard');
  return extractData(response);
}

// Get sales analytics
export async function getSalesAnalytics(options = {}) {
  const params = {};
  if (options.start_date) params.start_date = options.start_date;
  if (options.end_date) params.end_date = options.end_date;
  
  const response = await apiClient.get('/analytics/sales', { params });
  return extractData(response);
}

// Get product analytics
export async function getProductAnalytics(options = {}) {
  const params = {};
  if (options.start_date) params.start_date = options.start_date;
  if (options.end_date) params.end_date = options.end_date;
  
  const response = await apiClient.get('/analytics/products', { params });
  return extractData(response);
}

// Get user analytics
export async function getUserAnalytics(options = {}) {
  const params = {};
  if (options.start_date) params.start_date = options.start_date;
  if (options.end_date) params.end_date = options.end_date;
  
  const response = await apiClient.get('/analytics/users', { params });
  return extractData(response);
}

// Get monthly order trends
export async function getMonthlyOrderTrends(options = {}) {
  const params = {};
  if (options.start_date) params.start_date = options.start_date;
  if (options.end_date) params.end_date = options.end_date;
  
  const response = await apiClient.get('/analytics/orders/monthly', { params });
  return extractData(response);
}