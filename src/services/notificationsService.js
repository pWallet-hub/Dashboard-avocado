import apiClient from './apiClient';

// Get user notifications
export const getNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
  }
};

// Get notification by ID
export const getNotificationById = async (notificationId) => {
  try {
    const response = await apiClient.get(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notification');
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
};

// Create notification (Admin only)
export const createNotification = async (notificationData) => {
  try {
    const response = await apiClient.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create notification');
  }
};