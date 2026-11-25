import { useCallback, useEffect, useState } from 'react';
import { Store, Plus, Search, Pencil, Trash2, Power, Users as UsersIcon, UserX, KeyRound, Link2 } from 'lucide-react';
import { listUsersPage, createUser, updateUser, deleteUser, updateUserStatus } from '../../services/usersService';
import { getAllShops } from '../../services/shopService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const errMsg = (e, fallback) => e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.message || e?.message || fallback;
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ShopManagers() {
  const toast = useToast();
  const confirm = useConfirm();

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [status, setStatus] = useState('');
  const [counts, setCounts] = useState(null);
  const [shopsByManager, setShopsByManager] = useState({});

  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsersPage('shop-managers', { page, limit: PAGE_SIZE, search: debouncedSearch, status });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Failed to load shop managers'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  const loadSummary = useCallback(async () => {
    try {
      const [all, inactive, shopsRes] = await Promise.all([
        listUsersPage('shop-managers', { limit: 1 }),
        listUsersPage('shop-managers', { limit: 1, status: 'inactive' }),
        getAllShops().catch(() => null),
      ]);
      const shops = Array.isArray(shopsRes?.data) ? shopsRes.data : [];
      const map = {};
      shops.forEach((s) => { if (s.manager_id) map[s.manager_id] = s; });
      setShopsByManager(map);
      setCounts({ all: all.pagination.total ?? 0, inactive: inactive.pagination.total ?? 0, linked: Object.keys(map).length });
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const refresh = () => { load(); loadSummary(); };

  const openCreate = () => { setForm({ full_name: '', email: '', phone: '' }); setDialog({ type: 'create' }); };
  const openEdit = (m) => { setForm({ full_name: m.full_name || '', email: m.email || '', phone: m.phone || '' }); setDialog({ type: 'edit', manager: m }); };

  const submit = async (e) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) { toast.error('Full name must be at least 2 characters'); return; }
    if (dialog.type === 'create' && !EMAIL_RE.test(form.email.trim())) { toast.error('Enter a valid email address'); return; }
    setSaving(true);
    try {
      if (dialog.type === 'create') {
        const payload = { full_name: form.full_name.trim(), email: form.email.trim(), role: 'shop_manager' };
        if (form.phone.trim()) payload.phone = form.phone.trim();
        const created = await createUser(payload);
        toast.success('Shop manager created');
        setDialog({ type: 'created', user: created });
      } else {
        const payload = { full_name: form.full_name.trim() };
        if (form.phone.trim()) payload.phone = form.phone.trim();
        await updateUser(dialog.manager.id, payload);
        toast.success('Shop manager updated');
        setDialog(null);
      }
      refresh();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to save shop manager'));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (m) => {
    const next = m.status === 'active' ? 'inactive' : 'active';
    const ok = await confirm(`${next === 'inactive' ? 'Deactivate' : 'Reactivate'} ${m.full_name}?${next === 'inactive' ? ' They will no longer be able to sign in.' : ''}`, {
      confirmLabel: next === 'inactive' ? 'Deactivate' : 'Reactivate', danger: next === 'inactive',
    });
    if (!ok) return;
    try {
      await updateUserStatus(m.id, next);
      toast.success(`Shop manager ${next === 'active' ? 'reactivated' : 'deactivated'}`);
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update status'));
    }
  };

  const remove = async (m) => {
    const shop = shopsByManager[m.id];
    const ok = await confirm(`Delete ${m.full_name}?${shop ? ` They manage "${shop.shopName}".` : ''} This cannot be undone.`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteUser(m.id);
      toast.success('Shop manager deleted');
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      refresh();
    } catch (e) {
      toast.error(`Couldn't delete ${m.full_name} (${errMsg(e, 'server error')}). Accounts with linked records such as profiles, farms or shops can't be deleted — deactivate them instead.`, 8000);
    }
  };

  const hasFilters = debouncedSearch || status;

  return (
    <Page>
      <PageHeader
        icon={Store}
        title="Shop Managers"
        subtitle="Accounts that run input shops and sell to growers."
        actions={<Button icon={Plus} onClick={openCreate}>Add shop manager</Button>}
      />

      <StatGrid cols={3}>
        <StatCard label="Shop managers" value={counts ? counts.all : '—'} icon={UsersIcon} />
        <StatCard label="Managing a shop" value={counts ? counts.linked : '—'} icon={Link2} tone="blue" />
        <StatCard label="Deactivated" value={counts ? counts.inactive : '—'} icon={UserX} tone="slate" />
      </StatGrid>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name or email" aria-label="Search shop managers" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={inputClass} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading shop managers…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Store}
            title={hasFilters ? 'No shop managers match these filters' : 'No shop managers yet'}
            action={hasFilters ? <Button variant="secondary" onClick={() => { setSearch(''); setStatus(''); }}>Clear filters</Button> : <Button icon={Plus} onClick={openCreate}>Add shop manager</Button>}
          />
        ) : (
          <>
            <Table head={['Manager', 'Phone', 'Shop', 'Joined', 'Status', '']}>
              {rows.map((m) => {
                const shop = shopsByManager[m.id];
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="font-medium text-slate-900">{m.full_name}</div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </Td>
                    <Td>{m.phone || '—'}</Td>
                    <Td>{shop ? <span>{shop.shopName} <span className="text-xs text-slate-500">· {shop.district}</span></span> : <span className="text-slate-400">No shop</span>}</Td>
                    <Td>{fmtDate(m.created_at)}</Td>
                    <Td><Badge tone={m.status === 'active' ? 'brand' : 'slate'}>{m.status}</Badge></Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${m.full_name}`} onClick={() => openEdit(m)} />
                        <Button size="sm" variant="ghost" icon={Power} aria-label={`${m.status === 'active' ? 'Deactivate' : 'Reactivate'} ${m.full_name}`} onClick={() => toggleStatus(m)} />
                        <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-600 hover:bg-rose-50" aria-label={`Delete ${m.full_name}`} onClick={() => remove(m)} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>
      <p className="text-xs text-slate-500">
        A shop manager is linked to a shop when they register their shop themselves. Admins can&apos;t yet reassign a shop to a different manager.
      </p>

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <Dialog
          title={dialog.type === 'create' ? 'Add shop manager' : `Edit ${dialog.manager.full_name}`}
          subtitle={dialog.type === 'create' ? 'A login is created with a temporary password you can share.' : undefined}
          onClose={() => !saving && setDialog(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="sm-form" loading={saving}>{dialog.type === 'create' ? 'Create' : 'Save changes'}</Button>
            </>
          )}
        >
          <form id="sm-form" onSubmit={submit} className="grid gap-4">
            <Field label="Full name" required><input className={inputClass} required minLength={2} value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></Field>
            <Field label="Email" required={dialog.type === 'create'} hint={dialog.type === 'edit' ? "Email can't be changed here." : undefined}>
              <input className={inputClass} type="email" required={dialog.type === 'create'} disabled={dialog.type === 'edit'} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Phone"><input className={inputClass} placeholder="+2507…" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
          </form>
        </Dialog>
      )}

      {dialog?.type === 'created' && (
        <Dialog title="Shop manager created" onClose={() => setDialog(null)} size="sm" footer={<Button onClick={() => setDialog(null)}>Done</Button>}>
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">{dialog.user?.full_name}</span> can now sign in with:</p>
            <dl className="space-y-2 rounded-xl bg-slate-50 p-4">
              <div><dt className="text-xs font-medium uppercase text-slate-500">Email</dt><dd>{dialog.user?.email}</dd></div>
              <div><dt className="text-xs font-medium uppercase text-slate-500">Temporary password</dt><dd><code className="inline-flex items-center gap-1 font-mono"><KeyRound className="h-3.5 w-3.5" />{dialog.user?.default_password || '—'}</code></dd></div>
            </dl>
          </div>
        </Dialog>
      )}
    </Page>
  );
}
