import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Sprout, Plus, Search, Download, Eye, Pencil, Trash2, Power, CheckCircle2, XCircle, Users as UsersIcon, ShieldCheck, Clock, KeyRound, IdCard } from 'lucide-react';
import { createFarmer, updateUser, deleteUser, updateUserStatus } from '../../services/usersService';
import {
  listFarmerProfiles, getFarmerProfileById, updateFarmerProfileById, verifyFarmerProfile,
} from '../../services/farmer-information';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS, ALL_DISTRICTS } from '../../utils/rwanda';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed'];
const EDUCATION = ['Primary', 'Secondary', 'University', 'None'];
const ASSISTANCE = ['Training', 'Financial Support', 'Equipment', 'Technical Advice'];
const INT_FIELDS = ['age', 'farm_age', 'tree_count'];
const FLOAT_FIELDS = ['farm_size', 'mixed_percentage'];
const PROFILE_FIELDS = [
  'age', 'id_number', 'gender', 'marital_status', 'education_level', 'province', 'district', 'sector', 'cell', 'village',
  'farm_province', 'farm_district', 'farm_sector', 'farm_cell', 'farm_village', 'farm_age', 'planted', 'avocado_type',
  'mixed_percentage', 'farm_size', 'tree_count', 'upi_number', 'assistance',
];

const emptyFarmer = () => ({
  full_name: '', email: '', phone: '', age: '', id_number: '', gender: '', marital_status: '', education_level: '',
  province: '', district: '', sector: '', cell: '', village: '',
  farm_province: '', farm_district: '', farm_sector: '', farm_cell: '', farm_village: '',
  farm_age: '', planted: '', avocado_type: '', mixed_percentage: '', farm_size: '', tree_count: '', upi_number: '', assistance: [],
});

const errMsg = (e, fallback) => e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.message || e?.message || fallback;
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');
const verificationTone = { verified: 'brand', rejected: 'rose', pending: 'amber' };

/** Convert form strings into the typed payload the API expects; drop blanks. */
function toProfilePayload(form) {
  const out = {};
  PROFILE_FIELDS.forEach((k) => {
    const v = form[k];
    if (k === 'assistance') { out.assistance = Array.isArray(v) ? v : []; return; }
    if (v === '' || v === null || v === undefined) return;
    if (INT_FIELDS.includes(k)) out[k] = parseInt(v, 10);
    else if (FLOAT_FIELDS.includes(k)) out[k] = parseFloat(v);
    else out[k] = typeof v === 'string' ? v.trim() : v;
  });
  return out;
}

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

/** Shared create/edit form body for a grower. */
function FarmerForm({ form, setForm, includeAccount }) {
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === 'province' ? { district: '' } : {}), ...(k === 'farm_province' ? { farm_district: '' } : {}) }));
  const text = (k, label, props = {}) => (
    <Field label={label} required={props.required}>
      <input className={inputClass} value={form[k] ?? ''} onChange={(e) => set(k)(e.target.value)} {...props} />
    </Field>
  );
  const toggleAssist = (a) => setForm((f) => ({ ...f, assistance: f.assistance?.includes(a) ? f.assistance.filter((x) => x !== a) : [...(f.assistance || []), a] }));
  return (
    <div className="space-y-6">
      {includeAccount && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Account</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {text('full_name', 'Full name', { required: true, minLength: 2 })}
            {text('email', 'Email', { required: true, type: 'email' })}
            {text('phone', 'Phone', { placeholder: '+2507…' })}
          </div>
        </section>
      )}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Personal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gender" required={includeAccount}>
            <Select value={form.gender ?? ''} onChange={set('gender')} options={GENDERS} placeholder="Select…" required={includeAccount} />
          </Field>
          {text('age', 'Age', { type: 'number', min: 0, max: 150 })}
          {text('id_number', 'National ID')}
          <Field label="Marital status"><Select value={form.marital_status ?? ''} onChange={set('marital_status')} options={MARITAL} placeholder="—" /></Field>
          <Field label="Education level"><Select value={form.education_level ?? ''} onChange={set('education_level')} options={EDUCATION} placeholder="—" /></Field>
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Home location</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Province"><Select value={form.province ?? ''} onChange={set('province')} options={RWANDA_PROVINCES} placeholder="—" /></Field>
          <Field label="District"><Select value={form.district ?? ''} onChange={set('district')} options={RWANDA_DISTRICTS[form.province] || ALL_DISTRICTS} placeholder="—" /></Field>
          {text('sector', 'Sector')}
          {text('cell', 'Cell')}
          {text('village', 'Village')}
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Farm</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Farm province"><Select value={form.farm_province ?? ''} onChange={set('farm_province')} options={RWANDA_PROVINCES} placeholder="—" /></Field>
          <Field label="Farm district"><Select value={form.farm_district ?? ''} onChange={set('farm_district')} options={RWANDA_DISTRICTS[form.farm_province] || ALL_DISTRICTS} placeholder="—" /></Field>
          {text('farm_sector', 'Farm sector')}
          {text('farm_cell', 'Farm cell')}
          {text('farm_village', 'Farm village')}
          {text('upi_number', 'Land UPI number')}
          {text('farm_size', 'Farm size (ha)', { type: 'number', min: 0, step: '0.01' })}
          {text('tree_count', 'Tree count', { type: 'number', min: 0, step: 1 })}
          {text('farm_age', 'Farm age (years)', { type: 'number', min: 0, step: 1 })}
          {text('planted', 'Year planted', { placeholder: 'e.g. 2019' })}
          {text('avocado_type', 'Avocado varieties', { placeholder: 'e.g. Hass, Fuerte' })}
          {text('mixed_percentage', 'Mixed crop %', { type: 'number', min: 0, max: 100 })}
        </div>
        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-medium text-slate-700">Assistance needed</legend>
          <div className="flex flex-wrap gap-3">
            {ASSISTANCE.map((a) => (
              <label key={a} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={!!form.assistance?.includes(a)} onChange={() => toggleAssist(a)} />
                {a}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
    </div>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900">{value === null || value === undefined || value === '' ? '—' : value}</dd>
  </div>
);

export default function Users() {
  const toast = useToast();
  const confirm = useConfirm();

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [filters, setFilters] = useState({ province: '', district: '', verification_status: '', status: '' });
  const [counts, setCounts] = useState(null);

  const [dialog, setDialog] = useState(null); // { type: 'create'|'edit'|'view'|'created', ... }
  const [form, setForm] = useState(emptyFarmer);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const query = { search: debouncedSearch, ...filters };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFarmerProfiles({ page, limit: PAGE_SIZE, search: debouncedSearch, ...filters });
      setRows(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.meta?.pagination || {});
    } catch (e) {
      setError(errMsg(e, 'Failed to load growers'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  const loadCounts = useCallback(async () => {
    try {
      const total = (r) => r?.meta?.pagination?.total ?? 0;
      const [all, verified, pending, inactive] = await Promise.all([
        listFarmerProfiles({ limit: 1 }),
        listFarmerProfiles({ limit: 1, verification_status: 'verified' }),
        listFarmerProfiles({ limit: 1, verification_status: 'pending' }),
        listFarmerProfiles({ limit: 1, status: 'inactive' }),
      ]);
      setCounts({ all: total(all), verified: total(verified), pending: total(pending), inactive: total(inactive) });
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  const refresh = () => { load(); loadCounts(); };
  const setFilter = (k) => (v) => setFilters((f) => ({ ...f, [k]: v, ...(k === 'province' ? { district: '' } : {}) }));

  const openCreate = () => { setForm(emptyFarmer()); setDialog({ type: 'create' }); };

  const openView = async (row) => {
    setDialog({ type: 'view', row, loading: true });
    try {
      const res = await getFarmerProfileById(row.farmer_id);
      setDialog({ type: 'view', row, detail: res?.data || res });
    } catch (e) {
      setDialog({ type: 'view', row, detail: row, error: errMsg(e, 'Could not load the latest profile') });
    }
  };

  const openEdit = (row) => {
    const p = row.farmer_profile || {};
    const next = { ...emptyFarmer(), full_name: row.user_info?.full_name || '', phone: row.user_info?.phone || '', email: row.user_info?.email || '' };
    PROFILE_FIELDS.forEach((k) => { if (p[k] !== null && p[k] !== undefined) next[k] = k === 'assistance' ? p[k] : String(p[k]); });
    setForm(next);
    setDialog({ type: 'edit', row });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.gender) {
      toast.error('Full name, email and gender are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { full_name: form.full_name.trim(), email: form.email.trim(), ...toProfilePayload(form) };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const created = await createFarmer(payload);
      toast.success(`Grower ${created?.full_name || ''} created`);
      setDialog({ type: 'created', user: created });
      refresh();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to create grower'));
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const { row } = dialog;
    if (form.full_name.trim().length < 2) { toast.error('Full name must be at least 2 characters'); return; }
    setSaving(true);
    try {
      const account = { full_name: form.full_name.trim() };
      if (form.phone.trim()) account.phone = form.phone.trim();
      await updateUser(row.farmer_id, account);
      await updateFarmerProfileById(row.farmer_id, toProfilePayload(form));
      toast.success('Grower updated');
      setDialog(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to update grower'));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (row) => {
    const next = row.user_info?.status === 'active' ? 'inactive' : 'active';
    const ok = await confirm(`${next === 'inactive' ? 'Deactivate' : 'Reactivate'} ${row.user_info?.full_name}? ${next === 'inactive' ? 'They will no longer be able to sign in.' : ''}`, {
      confirmLabel: next === 'inactive' ? 'Deactivate' : 'Reactivate', danger: next === 'inactive',
    });
    if (!ok) return;
    try {
      await updateUserStatus(row.farmer_id, next);
      toast.success(`Grower ${next === 'active' ? 'reactivated' : 'deactivated'}`);
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update status'));
    }
  };

  const remove = async (row) => {
    const ok = await confirm(`Delete ${row.user_info?.full_name}? This permanently removes the account and cannot be undone.`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteUser(row.farmer_id);
      toast.success('Grower deleted');
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      refresh();
    } catch (e) {
      toast.error(`Couldn't delete ${row.user_info?.full_name} (${errMsg(e, 'server error')}). Accounts with linked records such as profiles, farms or shops can't be deleted — deactivate them instead.`, 8000);
    }
  };

  const verify = async (status) => {
    const profileId = dialog?.detail?.farmer_profile?.id;
    if (!profileId) { toast.error('This grower has no profile record to verify yet'); return; }
    const ok = await confirm(`${status === 'verified' ? 'Verify' : 'Reject'} this grower's profile?`, {
      confirmLabel: status === 'verified' ? 'Verify' : 'Reject', danger: status !== 'verified',
    });
    if (!ok) return;
    setSaving(true);
    try {
      await verifyFarmerProfile(profileId, status);
      toast.success(status === 'verified' ? 'Profile verified' : 'Profile rejected');
      setDialog((d) => ({ ...d, detail: { ...d.detail, farmer_profile: { ...d.detail.farmer_profile, verification_status: status } } }));
      refresh();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update verification'));
    } finally {
      setSaving(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const all = [];
      for (let p = 1; p <= 50; p += 1) {
        const res = await listFarmerProfiles({ page: p, limit: 100, ...query });
        all.push(...(res?.data || []));
        if (!res?.meta?.pagination?.hasNext) break;
      }
      if (!all.length) { toast.info('Nothing to export'); return; }
      const sheet = all.map(({ user_info: u = {}, farmer_profile: f = {} }) => ({
        'Full name': u.full_name, Email: u.email, Phone: u.phone, Status: u.status, Verification: f.verification_status,
        Gender: f.gender, Age: f.age, 'National ID': f.id_number, Province: f.province, District: f.district, Sector: f.sector,
        Cell: f.cell, Village: f.village, 'Farm province': f.farm_province, 'Farm district': f.farm_district, 'Farm sector': f.farm_sector,
        'Farm size (ha)': f.farm_size, Trees: f.tree_count, Planted: f.planted, Varieties: f.avocado_type, UPI: f.upi_number,
        Assistance: Array.isArray(f.assistance) ? f.assistance.join(', ') : '', Registered: fmtDate(u.created_at),
      }));
      const ws = XLSX.utils.json_to_sheet(sheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Growers');
      XLSX.writeFile(wb, `growers_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${all.length} growers`);
    } catch (e) {
      toast.error(errMsg(e, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = debouncedSearch || Object.values(filters).some(Boolean);
  const detail = dialog?.detail;
  const dp = detail?.farmer_profile || {};
  const du = detail?.user_info || {};

  return (
    <Page>
      <PageHeader
        icon={Sprout}
        title="Manage Growers"
        subtitle="Register, verify and maintain avocado grower accounts."
        actions={(
          <>
            <Button variant="secondary" icon={Download} loading={exporting} onClick={exportExcel}>Export</Button>
            <Button icon={Plus} onClick={openCreate}>Add grower</Button>
          </>
        )}
      />

      <StatGrid>
        <StatCard label="Registered growers" value={counts ? counts.all.toLocaleString() : '—'} icon={UsersIcon} />
        <StatCard label="Verified profiles" value={counts ? counts.verified.toLocaleString() : '—'} icon={ShieldCheck} tone="blue" />
        <StatCard label="Awaiting verification" value={counts ? counts.pending.toLocaleString() : '—'} icon={Clock} tone="amber" />
        <StatCard label="Deactivated accounts" value={counts ? counts.inactive.toLocaleString() : '—'} icon={Power} tone="slate" />
      </StatGrid>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name or national ID" aria-label="Search growers" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select aria-label="Province" value={filters.province} onChange={setFilter('province')} options={RWANDA_PROVINCES} placeholder="All provinces" />
          <Select aria-label="District" value={filters.district} onChange={setFilter('district')} options={RWANDA_DISTRICTS[filters.province] || ALL_DISTRICTS} placeholder="All districts" />
          <Select aria-label="Verification" value={filters.verification_status} onChange={setFilter('verification_status')} options={[{ value: 'pending', label: 'Pending' }, { value: 'verified', label: 'Verified' }, { value: 'rejected', label: 'Rejected' }]} placeholder="Any verification" />
          <Select aria-label="Account status" value={filters.status} onChange={setFilter('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} placeholder="Any status" />
        </div>

        {loading ? (
          <Spinner label="Loading growers…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title={hasFilters ? 'No growers match these filters' : 'No growers yet'}
            description={hasFilters ? 'Try a different search or clear the filters.' : 'Add the first grower to get started.'}
            action={hasFilters
              ? <Button variant="secondary" onClick={() => { setSearch(''); setFilters({ province: '', district: '', verification_status: '', status: '' }); }}>Clear filters</Button>
              : <Button icon={Plus} onClick={openCreate}>Add grower</Button>}
          />
        ) : (
          <>
            <Table head={['Grower', 'Phone', 'Location', 'Farm', 'Verification', 'Status', '']}>
              {rows.map((row) => {
                const u = row.user_info || {};
                const f = row.farmer_profile || {};
                return (
                  <tr key={row.farmer_id} className="hover:bg-slate-50">
                    <Td>
                      <div className="font-medium text-slate-900">{u.full_name || '—'}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </Td>
                    <Td>{u.phone || '—'}</Td>
                    <Td>{[f.district, f.province].filter(Boolean).join(', ') || '—'}</Td>
                    <Td>{f.tree_count ? `${f.tree_count} trees` : '—'}{f.farm_size ? ` · ${f.farm_size} ha` : ''}</Td>
                    <Td><Badge tone={verificationTone[f.verification_status] || 'slate'}>{f.verification_status || 'pending'}</Badge></Td>
                    <Td><Badge tone={u.status === 'active' ? 'brand' : 'slate'}>{u.status || '—'}</Badge></Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={Eye} aria-label={`View ${u.full_name}`} onClick={() => openView(row)} />
                        <Link to={`/dashboard/admin/member-card/${u.id}`} title="Membership card" aria-label={`Membership card of ${u.full_name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"><IdCard className="h-4 w-4" /></Link>
                        <Button size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${u.full_name}`} onClick={() => openEdit(row)} />
                        <Button size="sm" variant="ghost" icon={Power} aria-label={`${u.status === 'active' ? 'Deactivate' : 'Reactivate'} ${u.full_name}`} onClick={() => toggleStatus(row)} />
                        <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-600 hover:bg-rose-50" aria-label={`Delete ${u.full_name}`} onClick={() => remove(row)} />
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

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <Dialog
          title={dialog.type === 'create' ? 'Add grower' : `Edit ${dialog.row.user_info?.full_name || 'grower'}`}
          subtitle={dialog.type === 'create' ? 'A login is created with a temporary password you can share with the grower.' : undefined}
          size="xl"
          onClose={() => !saving && setDialog(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="grower-form" loading={saving}>{dialog.type === 'create' ? 'Create grower' : 'Save changes'}</Button>
            </>
          )}
        >
          <form id="grower-form" onSubmit={dialog.type === 'create' ? submitCreate : submitEdit}>
            {dialog.type === 'edit' && (
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required><input className={inputClass} required minLength={2} value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></Field>
                <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
                <Field label="Email" hint="Email can't be changed here."><input className={inputClass} value={form.email} disabled /></Field>
              </div>
            )}
            <FarmerForm form={form} setForm={setForm} includeAccount={dialog.type === 'create'} />
          </form>
        </Dialog>
      )}

      {dialog?.type === 'created' && (
        <Dialog title="Grower created" onClose={() => setDialog(null)} size="sm" footer={<Button onClick={() => setDialog(null)}>Done</Button>}>
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">{dialog.user?.full_name}</span> can now sign in with:</p>
            <dl className="space-y-2 rounded-xl bg-slate-50 p-4">
              <Detail label="Email" value={dialog.user?.email} />
              <Detail label="Temporary password" value={<code className="inline-flex items-center gap-1 font-mono"><KeyRound className="h-3.5 w-3.5" />{dialog.user?.default_password || '—'}</code>} />
            </dl>
            <p className="text-xs text-slate-500">Ask the grower to change this password after their first sign-in.</p>
          </div>
        </Dialog>
      )}

      {dialog?.type === 'view' && (
        <Dialog
          title={dialog.row.user_info?.full_name || 'Grower'}
          subtitle={dialog.row.user_info?.email}
          size="lg"
          onClose={() => setDialog(null)}
          footer={!dialog.loading && (
            <>
              {dp.id && dp.verification_status !== 'rejected' && <Button variant="secondary" icon={XCircle} disabled={saving} onClick={() => verify('rejected')}>Reject</Button>}
              {dp.id && dp.verification_status !== 'verified' && <Button icon={CheckCircle2} loading={saving} onClick={() => verify('verified')}>Verify profile</Button>}
              <Button variant="secondary" icon={Pencil} onClick={() => openEdit(dialog.row)}>Edit</Button>
            </>
          )}
        >
          {dialog.loading ? <Spinner /> : (
            <div className="space-y-5">
              {dialog.error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{dialog.error}</p>}
              <div className="flex flex-wrap gap-2">
                <Badge tone={verificationTone[dp.verification_status] || 'slate'}>Profile {dp.verification_status || 'pending'}</Badge>
                <Badge tone={du.status === 'active' ? 'brand' : 'slate'}>Account {du.status || '—'}</Badge>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                <Detail label="Phone" value={du.phone} />
                <Detail label="Gender" value={dp.gender} />
                <Detail label="Age" value={dp.age} />
                <Detail label="National ID" value={dp.id_number} />
                <Detail label="Marital status" value={dp.marital_status} />
                <Detail label="Education" value={dp.education_level} />
                <Detail label="Home" value={[dp.village, dp.cell, dp.sector, dp.district, dp.province].filter(Boolean).join(', ')} />
                <Detail label="Farm location" value={[dp.farm_village, dp.farm_cell, dp.farm_sector, dp.farm_district, dp.farm_province].filter(Boolean).join(', ')} />
                <Detail label="Land UPI" value={dp.upi_number} />
                <Detail label="Farm size" value={dp.farm_size ? `${dp.farm_size} ha` : null} />
                <Detail label="Trees" value={dp.tree_count} />
                <Detail label="Year planted" value={dp.planted} />
                <Detail label="Varieties" value={dp.avocado_type} />
                <Detail label="Mixed crop %" value={dp.mixed_percentage} />
                <Detail label="Assistance" value={Array.isArray(dp.assistance) && dp.assistance.length ? dp.assistance.join(', ') : null} />
                <Detail label="Registered" value={fmtDate(du.created_at)} />
              </dl>
            </div>
          )}
        </Dialog>
      )}
    </Page>
  );
}
