import { useCallback, useEffect, useState } from 'react';
import { UserCheck, Plus, Search, Eye, Pencil, Trash2, Power, Users as UsersIcon, ClipboardCheck, MapPinned, KeyRound } from 'lucide-react';
import { listUsersPage, createAgent, updateUser, deleteUser, updateUserStatus } from '../../services/usersService';
import { getAgentProfileById, updateAgentProfileById } from '../../services/agent-information';
import { getAgentAnalytics } from '../../services/analyticsService';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS, ALL_DISTRICTS } from '../../utils/rwanda';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const errMsg = (e, fallback) => e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.message || e?.message || fallback;
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');
const territoryText = (t) => (Array.isArray(t) ? t.map((x) => (typeof x === 'string' ? x : [x?.sector, x?.district].filter(Boolean).join(', '))).filter(Boolean).join('; ') : '');

const emptyAgent = () => ({
  full_name: '', email: '', phone: '', province: '', district: '', sector: '', territory: '', specialization: '', experience: '', certification: '',
});

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const Select = ({ value, onChange, options, placeholder, ...rest }) => (
  <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
  </select>
);

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900">{value === null || value === undefined || value === '' ? '—' : value}</dd>
  </div>
);

export default function Agents() {
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
  const [perf, setPerf] = useState({}); // agentId -> stats from /analytics/agents

  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyAgent);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsersPage('agents', { page, limit: PAGE_SIZE, search: debouncedSearch, status });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Failed to load agents'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  const loadSummary = useCallback(async () => {
    try {
      const [all, active, analytics] = await Promise.all([
        listUsersPage('agents', { limit: 1 }),
        listUsersPage('agents', { limit: 1, status: 'active' }),
        getAgentAnalytics().catch(() => []),
      ]);
      const list = Array.isArray(analytics) ? analytics : [];
      const map = {};
      list.forEach((a) => { map[a.id] = a.stats || {}; });
      setPerf(map);
      setCounts({
        all: all.pagination.total ?? 0,
        active: active.pagination.total ?? 0,
        visits: list.reduce((s, a) => s + (a.stats?.total_visits || 0), 0),
        requests: list.reduce((s, a) => s + (a.stats?.total_service_requests || 0), 0),
      });
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const refresh = () => { load(); loadSummary(); };
  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === 'province' ? { district: '' } : {}) }));

  const openCreate = () => { setForm(emptyAgent()); setDialog({ type: 'create' }); };

  const openView = async (agent) => {
    setDialog({ type: 'view', agent, loading: true });
    try {
      const detail = await getAgentProfileById(agent.id);
      setDialog({ type: 'view', agent, detail });
    } catch (e) {
      setDialog({ type: 'view', agent, detail: null, error: errMsg(e, 'Could not load the agent profile') });
    }
  };

  const openEdit = (agent) => {
    setForm({
      ...emptyAgent(),
      full_name: agent.full_name || '', email: agent.email || '', phone: agent.phone || '',
      province: agent.province || '', district: agent.district || '', sector: agent.sector || '',
      territory: territoryText(agent.territory), specialization: agent.specialization || '',
      experience: agent.experience || '', certification: agent.certification || '',
    });
    setDialog({ type: 'edit', agent });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) { toast.error('Full name must be at least 2 characters'); return; }
    if (dialog.type === 'create' && !EMAIL_RE.test(form.email.trim())) { toast.error('Enter a valid email address'); return; }
    setSaving(true);
    try {
      if (dialog.type === 'create') {
        const payload = { full_name: form.full_name.trim(), email: form.email.trim() };
        ['phone', 'province', 'district', 'sector'].forEach((k) => { if (form[k].trim()) payload[k] = form[k].trim(); });
        const created = await createAgent(payload);
        const extra = { specialization: form.specialization.trim(), experience: form.experience.trim(), certification: form.certification.trim() };
        if (Object.values(extra).some(Boolean) && created?.id) {
          await updateAgentProfileById(created.id, Object.fromEntries(Object.entries(extra).filter(([, v]) => v)));
        }
        toast.success('Agent created');
        setDialog({ type: 'created', user: created });
      } else {
        const account = { full_name: form.full_name.trim() };
        if (form.phone.trim()) account.phone = form.phone.trim();
        await updateUser(dialog.agent.id, account);
        await updateAgentProfileById(dialog.agent.id, {
          province: form.province, district: form.district, sector: form.sector.trim(),
          territory: form.territory.split(/[;,]/).map((t) => t.trim()).filter(Boolean),
          specialization: form.specialization.trim(), experience: form.experience.trim(), certification: form.certification.trim(),
        });
        toast.success('Agent updated');
        setDialog(null);
      }
      refresh();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to save agent'));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (agent) => {
    const next = agent.status === 'active' ? 'inactive' : 'active';
    const ok = await confirm(`${next === 'inactive' ? 'Deactivate' : 'Reactivate'} ${agent.full_name}?${next === 'inactive' ? ' They will no longer be able to sign in.' : ''}`, {
      confirmLabel: next === 'inactive' ? 'Deactivate' : 'Reactivate', danger: next === 'inactive',
    });
    if (!ok) return;
    try {
      await updateUserStatus(agent.id, next);
      toast.success(`Agent ${next === 'active' ? 'reactivated' : 'deactivated'}`);
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update status'));
    }
  };

  const remove = async (agent) => {
    const ok = await confirm(`Delete ${agent.full_name}? This permanently removes the account and cannot be undone.`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteUser(agent.id);
      toast.success('Agent deleted');
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      refresh();
    } catch (e) {
      toast.error(`Couldn't delete ${agent.full_name} (${errMsg(e, 'server error')}). Accounts with linked records such as profiles, farms or shops can't be deleted — deactivate them instead.`, 8000);
    }
  };

  const text = (k, label, props = {}) => (
    <Field label={label} required={props.required}>
      <input className={inputClass} value={form[k]} onChange={(e) => setField(k)(e.target.value)} {...props} />
    </Field>
  );

  const hasFilters = debouncedSearch || status;
  const d = dialog?.detail;
  const dp = d?.agent_profile || {};
  const stats = dialog?.agent ? perf[dialog.agent.id] : null;

  return (
    <Page>
      <PageHeader
        icon={UserCheck}
        title="Manage Agents"
        subtitle="Field agents who visit growers, handle service requests and file reports."
        actions={<Button icon={Plus} onClick={openCreate}>Add agent</Button>}
      />

      <StatGrid>
        <StatCard label="Agents" value={counts ? counts.all : '—'} icon={UsersIcon} />
        <StatCard label="Active" value={counts ? counts.active : '—'} icon={Power} tone="blue" />
        <StatCard label="Farm visits logged" value={counts ? counts.visits : '—'} icon={MapPinned} tone="amber" hint="Across active agents" />
        <StatCard label="Service requests handled" value={counts ? counts.requests : '—'} icon={ClipboardCheck} tone="slate" hint="Across active agents" />
      </StatGrid>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name or email" aria-label="Search agents" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select aria-label="Status" value={status} onChange={setStatus} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} placeholder="Any status" />
        </div>

        {loading ? (
          <Spinner label="Loading agents…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={hasFilters ? 'No agents match these filters' : 'No agents yet'}
            action={hasFilters ? <Button variant="secondary" onClick={() => { setSearch(''); setStatus(''); }}>Clear filters</Button> : <Button icon={Plus} onClick={openCreate}>Add agent</Button>}
          />
        ) : (
          <>
            <Table head={['Agent', 'Phone', 'Area', 'Specialization', 'Visits', 'Status', '']}>
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="font-medium text-slate-900">{a.full_name}</div>
                    <div className="text-xs text-slate-500">{a.email}</div>
                  </Td>
                  <Td>{a.phone || '—'}</Td>
                  <Td>{[a.sector, a.district, a.province].filter(Boolean).join(', ') || '—'}</Td>
                  <Td>{a.specialization || '—'}</Td>
                  <Td>{perf[a.id] ? `${perf[a.id].completed_visits ?? 0}/${perf[a.id].total_visits ?? 0}` : '—'}</Td>
                  <Td><Badge tone={a.status === 'active' ? 'brand' : 'slate'}>{a.status}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} aria-label={`View ${a.full_name}`} onClick={() => openView(a)} />
                      <Button size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${a.full_name}`} onClick={() => openEdit(a)} />
                      <Button size="sm" variant="ghost" icon={Power} aria-label={`${a.status === 'active' ? 'Deactivate' : 'Reactivate'} ${a.full_name}`} onClick={() => toggleStatus(a)} />
                      <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-600 hover:bg-rose-50" aria-label={`Delete ${a.full_name}`} onClick={() => remove(a)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <Dialog
          title={dialog.type === 'create' ? 'Add agent' : `Edit ${dialog.agent.full_name}`}
          subtitle={dialog.type === 'create' ? 'A login is created with a temporary password you can share with the agent.' : undefined}
          size="lg"
          onClose={() => !saving && setDialog(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="agent-form" loading={saving}>{dialog.type === 'create' ? 'Create agent' : 'Save changes'}</Button>
            </>
          )}
        >
          <form id="agent-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {text('full_name', 'Full name', { required: true, minLength: 2 })}
            {dialog.type === 'create'
              ? text('email', 'Email', { required: true, type: 'email' })
              : <Field label="Email" hint="Email can't be changed here."><input className={inputClass} value={form.email} disabled /></Field>}
            {text('phone', 'Phone', { placeholder: '+2507…' })}
            <Field label="Province"><Select value={form.province} onChange={setField('province')} options={RWANDA_PROVINCES} placeholder="—" /></Field>
            <Field label="District"><Select value={form.district} onChange={setField('district')} options={RWANDA_DISTRICTS[form.province] || ALL_DISTRICTS} placeholder="—" /></Field>
            {text('sector', 'Sector')}
            {dialog.type === 'edit' && text('territory', 'Territory', { placeholder: 'Areas covered, comma separated' })}
            {text('specialization', 'Specialization', { placeholder: 'e.g. Pest management' })}
            {text('experience', 'Experience', { placeholder: 'e.g. 5 years' })}
            {text('certification', 'Certification')}
          </form>
        </Dialog>
      )}

      {dialog?.type === 'created' && (
        <Dialog title="Agent created" onClose={() => setDialog(null)} size="sm" footer={<Button onClick={() => setDialog(null)}>Done</Button>}>
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">{dialog.user?.full_name}</span> can now sign in with:</p>
            <dl className="space-y-2 rounded-xl bg-slate-50 p-4">
              <Detail label="Email" value={dialog.user?.email} />
              <Detail label="Temporary password" value={<code className="inline-flex items-center gap-1 font-mono"><KeyRound className="h-3.5 w-3.5" />{dialog.user?.default_password || '—'}</code>} />
            </dl>
            <p className="text-xs text-slate-500">Ask the agent to change this password after their first sign-in.</p>
          </div>
        </Dialog>
      )}

      {dialog?.type === 'view' && (
        <Dialog
          title={dialog.agent.full_name}
          subtitle={dialog.agent.email}
          size="lg"
          onClose={() => setDialog(null)}
          footer={<Button variant="secondary" icon={Pencil} onClick={() => openEdit(dialog.agent)}>Edit</Button>}
        >
          {dialog.loading ? <Spinner /> : (
            <div className="space-y-5">
              {dialog.error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{dialog.error}</p>}
              <dl className="grid gap-4 sm:grid-cols-3">
                <Detail label="Status" value={<Badge tone={dialog.agent.status === 'active' ? 'brand' : 'slate'}>{dialog.agent.status}</Badge>} />
                <Detail label="Phone" value={dialog.agent.phone} />
                <Detail label="Joined" value={fmtDate(dialog.agent.created_at)} />
                <Detail label="Area" value={[dp.sector ?? dialog.agent.sector, dp.district ?? dialog.agent.district, dp.province ?? dialog.agent.province].filter(Boolean).join(', ')} />
                <Detail label="Territory" value={territoryText(dp.territory ?? dialog.agent.territory)} />
                <Detail label="Specialization" value={dp.specialization ?? dialog.agent.specialization} />
                <Detail label="Experience" value={dp.experience ?? dialog.agent.experience} />
                <Detail label="Certification" value={dp.certification ?? dialog.agent.certification} />
                <Detail label="Farmers assisted" value={dp.farmersAssisted ?? dialog.agent.farmersAssisted} />
              </dl>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Activity</h3>
                {stats ? (
                  <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                    <Detail label="Farm visits" value={`${stats.completed_visits ?? 0} completed of ${stats.total_visits ?? 0}`} />
                    <Detail label="Service requests" value={`${stats.completed_service_requests ?? 0} completed of ${stats.total_service_requests ?? 0}`} />
                    <Detail label="Reports filed" value={stats.total_reports ?? 0} />
                  </dl>
                ) : <p className="text-sm text-slate-500">No activity recorded (activity is tracked for active agents only).</p>}
              </div>
            </div>
          )}
        </Dialog>
      )}
    </Page>
  );
}
