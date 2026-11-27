import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCog, Plus, Search, Pencil, Trash2, Power, KeyRound, IdCard, ShieldCheck, Users as UsersIcon, UserX, Copy } from 'lucide-react';
import { listUsersPage, createUser, updateUser, deleteUser, updateUserStatus, updateUserRole, resetUserPassword } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = [
  { value: 'admin', label: 'Admin', tone: 'rose' },
  { value: 'agent', label: 'Field agent (VBA)', tone: 'blue' },
  { value: 'farmer', label: 'Farmer', tone: 'brand' },
  { value: 'shop_manager', label: 'Shop manager', tone: 'amber' },
];
const roleLabel = (r) => ROLES.find((x) => x.value === r)?.label || r;
const errMsg = (e, fallback) => e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.message || e?.message || fallback;
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');
const emptyForm = { full_name: '', email: '', phone: '', role: 'shop_manager' };

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * Admin: every account in one place — create other admins, change anyone's
 * role, reset passwords, deactivate or delete. The server blocks changes that
 * would lock admins out (demoting yourself, removing the last active admin).
 */
export default function AllUsers() {
  const toast = useToast();
  const confirm = useConfirm();
  const myId = localStorage.getItem('id');

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [counts, setCounts] = useState(null);
  const [busyId, setBusyId] = useState('');

  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsersPage('all', { page, limit: PAGE_SIZE, search: debouncedSearch, role, status });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, role, status]);

  const loadCounts = useCallback(async () => {
    try {
      const [all, admins, inactive] = await Promise.all([
        listUsersPage('all', { limit: 1 }),
        listUsersPage('all', { limit: 1, role: 'admin' }),
        listUsersPage('all', { limit: 1, status: 'inactive' }),
      ]);
      setCounts({ all: all.pagination.total ?? 0, admins: admins.pagination.total ?? 0, inactive: inactive.pagination.total ?? 0 });
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { setPage(1); }, [debouncedSearch, role, status]);
  const refresh = () => { load(); loadCounts(); };

  const openCreate = () => { setForm(emptyForm); setDialog({ type: 'create' }); };
  const openEdit = (u) => { setForm({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', role: u.role }); setDialog({ type: 'edit', user: u }); };

  const submit = async (e) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) { toast.error('Full name must be at least 2 characters'); return; }
    if (!EMAIL_RE.test(form.email.trim())) { toast.error('Enter a valid email address'); return; }
    setSaving(true);
    try {
      const payload = { full_name: form.full_name.trim(), email: form.email.trim() };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (dialog.type === 'create') {
        const created = await createUser({ ...payload, role: form.role });
        toast.success(`${roleLabel(form.role)} account created`);
        setDialog({ type: 'credentials', title: 'Account created', user: created, password: created?.default_password });
      } else {
        await updateUser(dialog.user.id, payload);
        toast.success('User updated');
        setDialog(null);
      }
      refresh();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to save user'));
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (u, next) => {
    if (next === u.role) return;
    const toAdmin = next === 'admin';
    const ok = await confirm(
      `Change ${u.full_name} from ${roleLabel(u.role)} to ${roleLabel(next)}?${toAdmin ? ' Admins can see and change everything, including other admins.' : ''}`,
      { confirmLabel: 'Change role', danger: toAdmin || u.role === 'admin' }
    );
    if (!ok) return;
    setBusyId(u.id);
    try {
      await updateUserRole(u.id, next);
      toast.success(`${u.full_name} is now ${roleLabel(next)}`);
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to change role'));
    } finally {
      setBusyId('');
    }
  };

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    const ok = await confirm(`${next === 'inactive' ? 'Deactivate' : 'Reactivate'} ${u.full_name}?${next === 'inactive' ? ' They will no longer be able to sign in.' : ''}`, {
      confirmLabel: next === 'inactive' ? 'Deactivate' : 'Reactivate', danger: next === 'inactive',
    });
    if (!ok) return;
    setBusyId(u.id);
    try {
      await updateUserStatus(u.id, next);
      toast.success(`${u.full_name} ${next === 'active' ? 'reactivated' : 'deactivated'}`);
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update status'));
    } finally {
      setBusyId('');
    }
  };

  const resetPassword = async (u) => {
    const ok = await confirm(`Reset ${u.full_name}'s password? Their current password stops working at once and you get a new one-time password to share with them privately.`, { confirmLabel: 'Reset password', danger: true });
    if (!ok) return;
    setBusyId(u.id);
    try {
      const res = await resetUserPassword(u.id);
      setDialog({ type: 'credentials', title: 'Password reset', user: u, password: res?.default_password });
    } catch (e) {
      toast.error(errMsg(e, 'Failed to reset password'));
    } finally {
      setBusyId('');
    }
  };

  const remove = async (u) => {
    const ok = await confirm(`Delete ${u.full_name}? This cannot be undone.`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteUser(u.id);
      toast.success('User deleted');
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to delete user'), 8000);
    }
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success('Copied'); } catch { toast.error('Copy it by hand'); }
  };

  const hasFilters = debouncedSearch || role || status;

  return (
    <Page>
      <PageHeader
        icon={UserCog}
        title="All Users & Admins"
        subtitle="Every account in the system. Add other admins, change roles, reset passwords, or deactivate accounts."
        actions={<Button icon={Plus} onClick={openCreate}>Add user</Button>}
      />

      <StatGrid cols={3}>
        <StatCard label="All accounts" value={counts ? counts.all : '—'} icon={UsersIcon} />
        <StatCard label="Admins" value={counts ? counts.admins : '—'} icon={ShieldCheck} tone="rose" />
        <StatCard label="Deactivated" value={counts ? counts.inactive : '—'} icon={UserX} tone="slate" />
      </StatGrid>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_200px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name or email" aria-label="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={inputClass} aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Any role</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select className={inputClass} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading users…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={hasFilters ? 'No users match these filters' : 'No users yet'}
            action={hasFilters ? <Button variant="secondary" onClick={() => { setSearch(''); setRole(''); setStatus(''); }}>Clear filters</Button> : null}
          />
        ) : (
          <>
            <Table head={['User', 'Role', 'Phone', 'Joined', 'Status', '']}>
              {rows.map((u) => {
                const me = u.id === myId;
                const busy = busyId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="flex items-center gap-2 font-medium text-slate-900">{u.full_name}{me && <Badge tone="blue">You</Badge>}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </Td>
                    <Td>
                      <select
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
                        value={u.role} disabled={me || busy} title={me ? 'You cannot change your own role' : undefined}
                        aria-label={`Role of ${u.full_name}`} onChange={(e) => changeRole(u, e.target.value)}
                      >
                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </Td>
                    <Td>{u.phone || '—'}</Td>
                    <Td>{fmtDate(u.created_at)}</Td>
                    <Td><Badge tone={u.status === 'active' ? 'brand' : 'slate'}>{u.status}</Badge></Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        {(u.role === 'farmer' || u.role === 'agent') && (
                          <Link to={`/dashboard/admin/member-card/${u.id}`} title={u.role === 'agent' ? 'Agent ID card' : 'Membership card'} aria-label={`Card of ${u.full_name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"><IdCard className="h-4 w-4" /></Link>
                        )}
                        <Button size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${u.full_name}`} onClick={() => openEdit(u)} />
                        {!me && <Button size="sm" variant="ghost" icon={KeyRound} aria-label={`Reset password of ${u.full_name}`} title="Reset password" onClick={() => resetPassword(u)} disabled={busy} />}
                        {!me && <Button size="sm" variant="ghost" icon={Power} aria-label={`${u.status === 'active' ? 'Deactivate' : 'Reactivate'} ${u.full_name}`} onClick={() => toggleStatus(u)} disabled={busy} />}
                        {!me && <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-600 hover:bg-rose-50" aria-label={`Delete ${u.full_name}`} onClick={() => remove(u)} />}
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
        For safety you can&apos;t change your own role, deactivate or delete yourself, and the last active admin can&apos;t be removed.
        Accounts with history (farms, orders, reports…) can only be deactivated, not deleted.
      </p>

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <Dialog
          title={dialog.type === 'create' ? 'Add user' : `Edit ${dialog.user.full_name}`}
          subtitle={dialog.type === 'create' ? 'A login is created with a temporary password you can share.' : 'Change the role from the table.'}
          onClose={() => !saving && setDialog(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="user-form" loading={saving}>{dialog.type === 'create' ? 'Create' : 'Save changes'}</Button>
            </>
          )}
        >
          <form id="user-form" onSubmit={submit} className="grid gap-4">
            <Field label="Full name" required><input className={inputClass} required minLength={2} value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></Field>
            <Field label="Email" required><input className={inputClass} type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
            <Field label="Phone"><input className={inputClass} placeholder="+2507…" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
            {dialog.type === 'create' && (
              <Field label="Role" required hint={form.role === 'admin' ? 'Admins can see and change everything, including other admins.' : form.role === 'agent' ? 'Assign their area afterwards on Manage Agents.' : undefined}>
                <select className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
            )}
          </form>
        </Dialog>
      )}

      {dialog?.type === 'credentials' && (
        <Dialog title={dialog.title} onClose={() => setDialog(null)} size="sm" footer={<Button onClick={() => setDialog(null)}>Done</Button>}>
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">{dialog.user?.full_name}</span> can now sign in with:</p>
            <dl className="space-y-2 rounded-xl bg-slate-50 p-4">
              <div><dt className="text-xs font-medium uppercase text-slate-500">Email</dt><dd>{dialog.user?.email}</dd></div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Temporary password</dt>
                <dd className="flex items-center gap-2">
                  <code className="inline-flex items-center gap-1 font-mono"><KeyRound className="h-3.5 w-3.5" />{dialog.password || '—'}</code>
                  {dialog.password && <Button size="sm" variant="ghost" icon={Copy} aria-label="Copy password" onClick={() => copy(dialog.password)} />}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-slate-500">This password is shown only once. Share it privately and ask them to change it after signing in.</p>
          </div>
        </Dialog>
      )}
    </Page>
  );
}
