import { useEffect, useState } from 'react';
import { listNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationsService';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [listRes, unreadRes] = await Promise.all([
        listNotifications({ page: 1, limit: 50 }),
        getUnreadCount(),
      ]);
      const listData = listRes?.data || listRes || [];
      const unreadCount = unreadRes?.count ?? unreadRes?.unread ?? 0;
      setItems(Array.isArray(listData) ? listData : listData.items || []);
      setUnread(unreadCount);
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      await load();
    } catch (e) { setError(e.message); }
  };

  const onMarkAll = async () => {
    try {
      await markAllAsRead();
      await load();
    } catch (e) { setError(e.message); }
  };

  const onDelete = async (id) => {
    try {
      await deleteNotification(id);
      await load();
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="p-4">Loading notifications...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Unread: {unread}</span>
          <button onClick={onMarkAll} className="px-3 py-1 bg-blue-600 text-white rounded">Mark all as read</button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="text-gray-600">No notifications</div>}
        {items.map((n) => (
          <div key={n.id || n._id} className={`border p-3 rounded flex items-start justify-between ${n.read || n.isRead ? 'bg-white' : 'bg-yellow-50'}`}>
            <div>
              <div className="font-medium">{n.title || n.type || 'Notification'}</div>
              <div className="text-sm text-gray-700">{n.body || n.message}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at || n.createdAt || Date.now()).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              {!n.read && !n.isRead && (
                <button onClick={() => onMarkAsRead(n.id || n._id)} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Mark read</button>
              )}
              <button onClick={() => onDelete(n.id || n._id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
