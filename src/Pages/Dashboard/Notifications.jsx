import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Check, Trash2, RefreshCw, Info, CheckCircle2, AlertTriangle, XCircle, ShoppingCart } from 'lucide-react';
import { listNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, Badge, Button, EmptyState, ErrorState, Spinner, Pagination } from '../../components/Ui/kit';

const TYPE_META = {
  success: { icon: CheckCircle2, cls: 'bg-brand-50 text-brand-700' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700' },
  error: { icon: XCircle, cls: 'bg-rose-50 text-rose-700' },
  order: { icon: ShoppingCart, cls: 'bg-blue-50 text-blue-700' },
  info: { icon: Info, cls: 'bg-slate-100 text-slate-600' },
  system: { icon: Bell, cls: 'bg-slate-100 text-slate-600' },
};

const PAGE_SIZE = 20;

const when = (v) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

/** Notifications for the signed-in user (any role): /dashboard/notifications */
export default function Notifications() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listNotifications({ page, limit: PAGE_SIZE });
      setItems(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.meta?.pagination || { totalPages: 1, total: 0 });
      setUnread(res?.meta?.unreadCount ?? 0);
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const read = async (n) => {
    setBusy(n.id);
    try {
      await markAsRead(n.id);
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (e) {
      toast.error(e.message || 'Failed to mark as read');
    } finally {
      setBusy(null);
    }
  };

  const readAll = async () => {
    setBusy('all');
    try {
      await markAllAsRead();
      setItems((list) => list.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e.message || 'Failed to mark all as read');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (n) => {
    const ok = await confirm(`Delete the notification “${n.title}”?`, { title: 'Delete notification', confirmLabel: 'Delete' });
    if (!ok) return;
    setBusy(n.id);
    try {
      await deleteNotification(n.id);
      toast.success('Notification deleted');
      if (items.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (e) {
      toast.error(e.message || 'Failed to delete notification');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page>
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle={unread ? `You have ${unread} unread notification${unread === 1 ? '' : 's'}.` : 'You are all caught up.'}
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={CheckCheck} onClick={readAll} loading={busy === 'all'} disabled={!unread}>Mark all as read</Button>
          </>
        }
      />
      <Card padded={false}>
        {loading ? (
          <Spinner label="Loading notifications…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="Updates about your requests, orders and harvest lots will appear here." />
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.info;
                const Icon = meta.icon;
                return (
                  <li key={n.id} className={`flex gap-3 px-5 py-4 ${n.is_read ? '' : 'bg-brand-50/40'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.cls}`}><Icon className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm ${n.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</p>
                        {!n.is_read && <Badge tone="brand">New</Badge>}
                      </div>
                      <p className="mt-0.5 break-words text-sm text-slate-600">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{when(n.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-start gap-1">
                      {!n.is_read && (
                        <button type="button" onClick={() => read(n)} disabled={busy === n.id} aria-label={`Mark “${n.title}” as read`} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-700 disabled:opacity-40">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => remove(n)} disabled={busy === n.id} aria-label={`Delete “${n.title}”`} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {(pagination.totalPages || 1) > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />}
          </>
        )}
      </Card>
    </Page>
  );
}
