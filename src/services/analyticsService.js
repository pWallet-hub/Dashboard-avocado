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

// Get regional analytics (farm and harvest stats by province/district)
export async function getRegionalAnalytics() {
  const response = await apiClient.get('/analytics/regional');
  return extractData(response);
}

// Get agent performance analytics (visits, service requests, reports)
export async function getAgentAnalytics() {
  const response = await apiClient.get('/analytics/agents');
  return extractData(response);
}

// Get farmer engagement analytics (farm size, tree count, verification rate)
export async function getFarmerAnalytics() {
  const response = await apiClient.get('/analytics/farmers');
  return extractData(response);
}