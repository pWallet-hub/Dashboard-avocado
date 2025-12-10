import React, { useState, useEffect } from 'react';
import { Bell, Plus, Search, Filter, Eye, Trash2, Send, Users, User, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  listNotifications, 
  createNotification, 
  deleteNotification, 
  markAsRead, 
  markAllAsRead,
  getUnreadCount 
} from '../../services/notificationsService';
import { listUsers } from '../../services/usersService';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'info',
    userId: '',
    role: '',
    metadata: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [notificationsData, usersData, unreadData] = await Promise.allSettled([
        listNotifications({ limit: 100 }),
        listUsers({ limit: 1000 }),
        getUnreadCount()
      ]);

      if (notificationsData.status === 'fulfilled') {
        const notifs = notificationsData.value?.data || notificationsData.value || [];
        setNotifications(Array.isArray(notifs) ? notifs : []);
      }

      if (usersData.status === 'fulfilled') {
        const userData = usersData.value?.data || usersData.value || [];
        setUsers(Array.isArray(userData) ? userData : []);
      }

      if (unreadData.status === 'fulfilled') {
        setUnreadCount(unreadData.value?.count || 0);
      }

      // Check if any requests failed
      const failedRequests = [notificationsData, usersData, unreadData].filter(result => result.status === 'rejected');
      if (failedRequests.length > 0) {
        setError(`Some data could not be loaded. ${failedRequests.length} request(s) failed.`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load notifications data');
      // Set fallback data
      setNotifications([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.body) {
        alert('Title and message are required');
        return;
      }

      const notificationData = {
        title: newNotification.title,
        body: newNotification.body,
        type: newNotification.type,
        metadata: newNotification.metadata
      };

      // Add recipient information
      if (newNotification.userId) {
        notificationData.userId = newNotification.userId;
      } else if (newNotification.role) {
        notificationData.role = newNotification.role;
      }

      await createNotification(notificationData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Error sending notification: ' + error.message);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await deleteNotification(id);
      await loadData();
      alert('Notification deleted successfully!');
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error deleting notification: ' + error.message);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      await loadData();
    } catch (error) {
      console.error('Error marking as read:', error);
      alert('Error marking notification as read: ' + error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await loadData();
      alert('All notifications marked as read!');
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Error marking all notifications as read: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewNotification({
      title: '',
      body: '',
      type: 'info',
      userId: '',
      role: '',
      metadata: {}
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!notification) return false;
    
    const matchesSearch = (notification.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (notification.body?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 ring-green-500';
      case 'warning': return 'bg-yellow-100 text-yellow-800 ring-yellow-500';
      case 'error': return 'bg-red-100 text-red-800 ring-red-500';
      case 'info': return 'bg-blue-100 text-blue-800 ring-blue-500';
      default: return 'bg-gray-100 text-gray-800 ring-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="h-7 w-7 mr-3 text-blue-600" />
              Notifications Management
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Send and manage system notifications</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Notification
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Total: <span className="font-semibold">{filteredNotifications.length}</span>
            </span>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ring-1 ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                        <span className="ml-1 capitalize">{notification.type || 'info'}</span>
                      </span>
                      {!notification.read_at && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {notification.title || 'No Title'}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {notification.body || 'No message content'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Created: {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Unknown'}
                      </span>
                      {notification.user_id && (
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          User ID: {notification.user_id}
                        </span>
                      )}
                      {notification.role && (
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Role: {notification.role}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read_at && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Send New Notification</h3>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={newNotification.body}
                  onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Enter notification message"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send to Role</label>
                  <select
                    value={newNotification.role}
                    onChange={(e) => setNewNotification({...newNotification, role: e.target.value, userId: ''})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Users</option>
                    <option value="admin">Admins</option>
                    <option value="agent">Agents</option>
                    <option value="farmer">Farmers</option>
                    <option value="shop_manager">Shop Managers</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Send to Specific User
                </label>
                <select
                  value={newNotification.userId}
                  onChange={(e) => setNewNotification({...newNotification, userId: e.target.value, role: ''})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={newNotification.role !== ''}
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={!newNotification.title || !newNotification.body}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;