import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import MyAreaBanner from '../../components/Agents/MyAreaBanner';
import { Users, UserPlus, Search, Download, Eye, RefreshCw, UserCheck, ShieldCheck, KeyRound, Copy, IdCard } from 'lucide-react';
import { createFarmer, listUsersPage } from '../../services/usersService';
import { listFarmsPage } from '../../services/farmsService';
import { LocationFields } from './Farms';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed'];
const EDUCATION = ['None', 'Primary', 'Secondary', 'University'];
const AVOCADO_TYPES = ['Hass', 'Fuerte', 'Bacon', 'Zutano', 'Mixed'];
const ASSISTANCE_OPTIONS = ['irrigation', 'fertilizers', 'training', 'equipment', 'seedlings', 'pest_control'];
const VERIFY_TONE = { verified: 'brand', pending: 'amber', rejected: 'rose' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{10,15}$/;

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '—');
const placeOf = (f) => [f?.sector, f?.district].filter(Boolean).join(', ') || f?.province || '—';
const emptyLocation = { province: '', district: '', sector: '', cell: '', village: '' };
const emptyFarmer = () => ({
  full_name: '', email: '', phone: '', gender: '', age: '', marital_status: '', education_level: '', id_number: '',
  home: { ...emptyLocation }, farm: { ...emptyLocation }, farmSameAsHome: true,
  farm_size: '', tree_count: '', avocado_type: '', mixed_percentage: '', planted: '', upi_number: '', assistance: [],
});

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900">{value === null || value === undefined || value === '' ? '—' : value}</dd>
  </div>
);

export default function FarmerList() {
  const toast = useToast();
  const [farmers, setFarmers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [counts, setCounts] = useState({ all: null, active: null, inactive: null });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewFarms, setViewFarms] = useState({ loading: false, data: [] });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsersPage('farmers', { page, limit: PAGE_SIZE, search: debounced || undefined, status: status || undefined });
      setFarmers(res.data);
      setPagination({ page: res.pagination.page || page, totalPages: res.pagination.totalPages || 1, total: res.pagination.total ?? res.data.length });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load farmers');
    } finally {
      setLoading(false);
    }
  }, [page, debounced, status]);

  const loadCounts = useCallback(async () => {
    try {
      const [all, active, inactive] = await Promise.all(
        [undefined, 'active', 'inactive'].map((s) => listUsersPage('farmers', { limit: 1, status: s }))
      );
      setCounts({ all: all.pagination.total ?? 0, active: active.pagination.total ?? 0, inactive: inactive.pagination.total ?? 0 });
    } catch {
      setCounts({ all: null, active: null, inactive: null });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { setPage(1); }, [debounced, status]);

  const openView = async (farmer) => {
    setViewing(farmer);
    setViewFarms({ loading: true, data: [] });
    try {
      const res = await listFarmsPage({ farmer_id: farmer.id, limit: 20 });
      setViewFarms({ loading: false, data: res.data });
    } catch {
      setViewFarms({ loading: false, data: [], error: true });
    }
  };

  // Export every farmer matching the current filters (pages through the API).
  const exportExcel = async () => {
    setExporting(true);
    try {
      const rows = [];
      let p = 1;
      let totalPages = 1;
      do {
        const res = await listUsersPage('farmers', { page: p, limit: 100, search: debounced || undefined, status: status || undefined });
        rows.push(...res.data);
        totalPages = res.pagination.totalPages || 1;
        p += 1;
      } while (p <= totalPages && p <= 50);
      if (rows.length === 0) {
        toast.info('No farmers to export');
        return;
      }
      const sheet = XLSX.utils.json_to_sheet(rows.map((f) => ({
        'Full name': f.full_name,
        Email: f.email,
        Phone: f.phone || '',
        Gender: f.gender || '',
        Age: f.age ?? '',
        Province: f.province || '',
        District: f.district || '',
        Sector: f.sector || '',
        Cell: f.cell || '',
        Village: f.village || '',
        'Farm size (ha)': f.farm_size ?? '',
        Trees: f.tree_count ?? '',
        'Avocado type': f.avocado_type || '',
        Planted: f.planted || '',
        'UPI number': f.upi_number || '',
        Verification: f.verification_status || '',
        Status: f.status,
        Registered: f.created_at ? new Date(f.created_at).toISOString().slice(0, 10) : '',
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, 'Farmers');
      XLSX.writeFile(wb, `farmers_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${rows.length} farmer${rows.length === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAssist = (opt) =>
    setForm((f) => ({ ...f, assistance: f.assistance.includes(opt) ? f.assistance.filter((a) => a !== opt) : [...f.assistance, opt] }));

  const submitFarmer = async (e) => {
    e.preventDefault();
    const f = form;
    if (!f.full_name.trim() || f.full_name.trim().length < 2) return toast.error('Full name is required');
    if (!EMAIL_RE.test(f.email.trim())) return toast.error('Enter a valid email address');
    if (!f.gender) return toast.error('Select a gender');
    if (f.phone && !PHONE_RE.test(f.phone.trim())) return toast.error('Phone must have 10–15 digits, e.g. +250788123456');
    if (f.age && (Number(f.age) < 0 || Number(f.age) > 150)) return toast.error('Age must be between 0 and 150');
    if (f.mixed_percentage && (Number(f.mixed_percentage) < 0 || Number(f.mixed_percentage) > 100)) return toast.error('Mixed percentage must be 0–100');

    const farm = f.farmSameAsHome ? f.home : f.farm;
    const payload = {
      full_name: f.full_name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || undefined,
      gender: f.gender,
      age: f.age ? parseInt(f.age, 10) : undefined,
      marital_status: f.marital_status || undefined,
      education_level: f.education_level || undefined,
      id_number: f.id_number.trim() || undefined,
      ...Object.fromEntries(Object.entries(f.home).map(([k, v]) => [k, v || undefined])),
      ...Object.fromEntries(Object.entries(farm).map(([k, v]) => [`farm_${k}`, v || undefined])),
      farm_size: f.farm_size ? parseFloat(f.farm_size) : undefined,
      tree_count: f.tree_count ? parseInt(f.tree_count, 10) : undefined,
      avocado_type: f.avocado_type || undefined,
      mixed_percentage: f.avocado_type === 'Mixed' && f.mixed_percentage ? parseFloat(f.mixed_percentage) : undefined,
      planted: f.planted || undefined,
      upi_number: f.upi_number.trim() || undefined,
      assistance: f.assistance.length ? f.assistance : undefined,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    setSaving(true);
    try {
      const result = await createFarmer(payload);
      setForm(null);
      setCreated(result);
      toast.success(`${result?.full_name || 'Farmer'} registered`);
      setPage(1);
      load();
      loadCounts();
    } catch (err) {
      const data = err.response?.data;
      const detail = Array.isArray(data?.errors) && data.errors.length ? data.errors.map((x) => x.msg).join('; ') : null;
      toast.error(detail || data?.message || err.message || 'Failed to register farmer');
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied');
    } catch {
      toast.error('Could not copy — select and copy manually');
    }
  };

  const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString());

  return (
    <Page>
      <PageHeader
        icon={Users}
        title="My Farmers"
        subtitle="Farmers in the area assigned to you. Register new farmers and export the list."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { load(); loadCounts(); }} disabled={loading}>Refresh</Button>
            <Button variant="secondary" icon={Download} loading={exporting} onClick={exportExcel}>Export Excel</Button>
            <Button icon={UserPlus} onClick={() => setForm(emptyFarmer())}>Register farmer</Button>
          </>
        }
      />

      <MyAreaBanner />

      <StatGrid cols={3}>
        <StatCard label="Farmers" value={fmt(counts.all)} icon={Users} />
        <StatCard label="Active accounts" value={fmt(counts.active)} icon={UserCheck} tone="blue" />
        <StatCard label="Inactive accounts" value={fmt(counts.inactive)} icon={ShieldCheck} tone="slate" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={inputClass + ' pl-9'}
              placeholder="Search by name or email…"
              aria-label="Search farmers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={inputClass + ' sm:w-48'} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading farmers…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : farmers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={debounced || status ? 'No farmers match your filters' : 'No farmers yet'}
            description={debounced || status ? 'Try a different search or status.' : 'Register the first farmer to get started.'}
            action={!debounced && !status && <Button icon={UserPlus} onClick={() => setForm(emptyFarmer())}>Register farmer</Button>}
          />
        ) : (
          <>
            <Table head={['Farmer', 'Phone', 'Location', 'Farm', 'Verification', 'Status', '']}>
              {farmers.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-medium text-slate-900">{f.full_name || '—'}</p>
                    <p className="text-xs text-slate-500">{f.email}</p>
                  </Td>
                  <Td>{f.phone || '—'}</Td>
                  <Td>{placeOf(f)}</Td>
                  <Td>
                    {f.farm_size != null ? `${f.farm_size} ha` : '—'}
                    <span className="text-slate-400"> · </span>
                    {f.tree_count != null ? `${f.tree_count} trees` : '—'}
                  </Td>
                  <Td><Badge tone={VERIFY_TONE[f.verification_status] || 'slate'}>{cap(f.verification_status || 'unknown')}</Badge></Td>
                  <Td><Badge tone={f.status === 'active' ? 'brand' : 'slate'}>{cap(f.status)}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/dashboard/agent/member-card/${f.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-slate-100" aria-label={`Membership card of ${f.full_name}`}>
                        <IdCard className="h-4 w-4" /> Card
                      </Link>
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => openView(f)} aria-label={`View ${f.full_name}`}>View</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Farmer details */}
      <Dialog open={!!viewing} title={viewing?.full_name || 'Farmer'} subtitle={viewing?.email} onClose={() => setViewing(null)} size="lg"
        footer={<Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>}>
        {viewing && (
          <div className="space-y-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Detail label="Phone" value={viewing.phone} />
              <Detail label="Gender" value={viewing.gender} />
              <Detail label="Age" value={viewing.age} />
              <Detail label="Marital status" value={viewing.marital_status} />
              <Detail label="Education" value={viewing.education_level} />
              <Detail label="National ID" value={viewing.id_number} />
              <Detail label="Home" value={[viewing.village, viewing.cell, viewing.sector, viewing.district, viewing.province].filter(Boolean).join(', ')} />
              <Detail label="Farm location" value={[viewing.farm_village, viewing.farm_cell, viewing.farm_sector, viewing.farm_district, viewing.farm_province].filter(Boolean).join(', ')} />
              <Detail label="UPI number" value={viewing.upi_number} />
              <Detail label="Farm size" value={viewing.farm_size != null ? `${viewing.farm_size} ha` : null} />
              <Detail label="Trees" value={viewing.tree_count} />
              <Detail label="Avocado type" value={viewing.avocado_type} />
              <Detail label="Planted" value={viewing.planted} />
              <Detail label="Assistance needed" value={(viewing.assistance || []).map(cap).join(', ')} />
              <Detail label="Registered" value={viewing.created_at ? new Date(viewing.created_at).toLocaleDateString() : null} />
            </dl>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Farms</h3>
              {viewFarms.loading ? (
                <Spinner label="Loading farms…" />
              ) : viewFarms.error ? (
                <p className="text-sm text-rose-600">Could not load this farmer&apos;s farms.</p>
              ) : viewFarms.data.length === 0 ? (
                <p className="text-sm text-slate-500">No farms registered yet. Add one from the Farms page.</p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {viewFarms.data.map((farm) => (
                    <li key={farm.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <span className="font-medium text-slate-900">{farm.farmName || farm.farm_name || 'Unnamed farm'}</span>
                      <span className="text-slate-500">
                        {farm.farm_size ?? '—'} ha · {farm.tree_count ?? 0} trees · <Badge>{cap(farm.status)}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Register farmer */}
      <Dialog open={!!form} title="Register farmer" subtitle="Creates the farmer's account, profile and first farm." onClose={() => !saving && setForm(null)} size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="farmer-form" icon={UserPlus} loading={saving}>Register farmer</Button>
          </>
        }>
        {form && (
          <form id="farmer-form" onSubmit={submitFarmer} className="space-y-6" noValidate>
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Personal details</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Full name" required><input className={inputClass} value={form.full_name} onChange={(e) => setF('full_name', e.target.value)} placeholder="e.g. Jean Mukeshimana" /></Field>
                <Field label="Email" required hint="Used to sign in."><input type="email" className={inputClass} value={form.email} onChange={(e) => setF('email', e.target.value)} placeholder="farmer@example.com" /></Field>
                <Field label="Phone"><input type="tel" className={inputClass} value={form.phone} onChange={(e) => setF('phone', e.target.value)} placeholder="+250788123456" /></Field>
                <Field label="Gender" required>
                  <select className={inputClass} value={form.gender} onChange={(e) => setF('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Age"><input type="number" min="0" max="150" className={inputClass} value={form.age} onChange={(e) => setF('age', e.target.value)} /></Field>
                <Field label="National ID"><input className={inputClass} value={form.id_number} onChange={(e) => setF('id_number', e.target.value)} /></Field>
                <Field label="Marital status">
                  <select className={inputClass} value={form.marital_status} onChange={(e) => setF('marital_status', e.target.value)}>
                    <option value="">—</option>
                    {MARITAL.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Education level">
                  <select className={inputClass} value={form.education_level} onChange={(e) => setF('education_level', e.target.value)}>
                    <option value="">—</option>
                    {EDUCATION.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Home location</h3>
              <LocationFields value={form.home} onChange={(v) => setF('home', v)} />
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Farm</h3>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" checked={form.farmSameAsHome} onChange={(e) => setF('farmSameAsHome', e.target.checked)} />
                  Farm is at the home location
                </label>
              </div>
              {!form.farmSameAsHome && <div className="mb-3"><LocationFields value={form.farm} onChange={(v) => setF('farm', v)} /></div>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Farm size (ha)"><input type="number" min="0" step="0.01" className={inputClass} value={form.farm_size} onChange={(e) => setF('farm_size', e.target.value)} /></Field>
                <Field label="Number of trees"><input type="number" min="0" className={inputClass} value={form.tree_count} onChange={(e) => setF('tree_count', e.target.value)} /></Field>
                <Field label="Year planted"><input type="number" min="1950" max={new Date().getFullYear()} className={inputClass} value={form.planted} onChange={(e) => setF('planted', e.target.value)} placeholder="e.g. 2019" /></Field>
                <Field label="Avocado type">
                  <select className={inputClass} value={form.avocado_type} onChange={(e) => setF('avocado_type', e.target.value)}>
                    <option value="">—</option>
                    {AVOCADO_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                {form.avocado_type === 'Mixed' && (
                  <Field label="Hass share (%)"><input type="number" min="0" max="100" className={inputClass} value={form.mixed_percentage} onChange={(e) => setF('mixed_percentage', e.target.value)} /></Field>
                )}
                <Field label="UPI number"><input className={inputClass} value={form.upi_number} onChange={(e) => setF('upi_number', e.target.value)} /></Field>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Assistance needed</h3>
              <div className="flex flex-wrap gap-2">
                {ASSISTANCE_OPTIONS.map((opt) => {
                  const on = form.assistance.includes(opt);
                  return (
                    <button key={opt} type="button" aria-pressed={on} onClick={() => toggleAssist(opt)}
                      className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition ${on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
                      {cap(opt)}
                    </button>
                  );
                })}
              </div>
            </section>
          </form>
        )}
      </Dialog>

      {/* Registration result */}
      <Dialog open={!!created} title="Farmer registered" onClose={() => setCreated(null)} size="md"
        footer={<Button onClick={() => setCreated(null)}>Done</Button>}>
        {created && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-700">
              <span className="font-medium text-slate-900">{created.full_name}</span> can now sign in with <span className="font-medium">{created.email}</span>.
              A first farm was created from the details you entered.
            </p>
            {created.default_password && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 font-medium text-amber-900"><KeyRound className="h-4 w-4" /> Temporary password</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded bg-white px-2 py-1 font-mono text-slate-900 ring-1 ring-amber-200">{created.default_password}</code>
                  <Button variant="secondary" size="sm" icon={Copy} onClick={() => copy(created.default_password)} aria-label="Copy password">Copy</Button>
                </div>
                <p className="mt-2 text-amber-900">Share it with the farmer privately and ask them to change it after their first sign-in.</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </Page>
  );
}
