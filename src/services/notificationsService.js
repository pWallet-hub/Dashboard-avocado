import apiClient, { extractData } from './apiClient';

/**
 * Notifications Service
 * Implements endpoints from API documentation:
 * Base Path: /notifications
 * - GET    /notifications                List notifications (Private)
 * - GET    /notifications/unread-count   Get unread count (Private)
 * - GET    /notifications/:id            Get notification by ID (Private)
 * - PUT    /notifications/:id/read       Mark a notification as read (Private)
 * - PUT    /notifications/read-all       Mark all notifications as read (Private)
 * - DELETE /notifications/:id            Delete a notification (Private)
 * - POST   /notifications                Create notification (Admin)
 */

// List notifications with pagination
export async function listNotifications(options = {}) {
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;

  const response = await apiClient.get('/notifications', { params });
  // Some endpoints return { success, data, meta }, preserve meta if present
  return response.data?.success ? response.data : { success: true, data: extractData(response) };
}

// Get a single notification by ID
export async function getNotification(notificationId) {
  if (!notificationId) throw new Error('Notification ID is required');
  const response = await apiClient.get(`/notifications/${notificationId}`);
  return extractData(response);
}

// Get unread notifications count
export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread-count');
  // API returns { success, data: { count } }
  return extractData(response);
}

// Mark a single notification as read
export async function markAsRead(notificationId) {
  if (!notificationId) throw new Error('Notification ID is required');
  const response = await apiClient.put(`/notifications/${notificationId}/read`);
  return extractData(response);
}

// Mark all notifications as read
export async function markAllAsRead() {
  const response = await apiClient.put('/notifications/read-all');
  return extractData(response);
}

// Delete a notification
export async function deleteNotification(notificationId) {
  if (!notificationId) throw new Error('Notification ID is required');
  const response = await apiClient.delete(`/notifications/${notificationId}`);
  return extractData(response);
}

// Admin: Create a notification for a user or broadcast
// Example payload: { title, body, userId?, role?, type?, metadata? }
export async function createNotification(notificationData) {
  if (!notificationData || typeof notificationData !== 'object') {
    throw new Error('Valid notification data is required');
  }
  const response = await apiClient.post('/notifications', notificationData);
  return extractData(response);
}

export default {
  listNotifications,
  getNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
