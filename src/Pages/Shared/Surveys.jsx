/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList, Users, Trees, MapPinned, Download, Search, X, Banknote, BarChart3, Table2, Upload,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, Table, Td, EmptyState, Spinner } from '../../components/Ui/kit';
import { useToast } from '../../components/Ui/Toast';
import { getSurveyAnalytics, listSurveys, getSurvey, exportSurveys } from '../../services/surveysService';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS, ALL_DISTRICTS } from '../../utils/rwanda';
import SurveyImport from './SurveyImport';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'records', label: 'Records', icon: Table2 },
  { id: 'import', label: 'Import from Excel', icon: Upload },
];

const fmt = (n, d = 0) => (n === null || n === undefined ? '—' : Number(n).toLocaleString(undefined, { maximumFractionDigits: d }));

function RateBar({ label, rate }) {
  const pct = rate?.pct ?? 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">{rate?.pct == null ? '—' : `${pct}%`} <span className="text-xs font-normal text-slate-400">({rate?.yes ?? 0}/{rate?.answered ?? 0})</span></span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TopList({ title, items, total }) {
  return (
    <Card title={title}>
      {!items?.length ? (
        <p className="text-sm text-slate-500">No answers recorded.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((i) => (
            <li key={i.label}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="truncate text-slate-700" title={i.label}>{i.label}</span>
                <span className="shrink-0 font-medium text-slate-900">{i.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${Math.min(100, (i.count / Math.max(1, total)) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Overview({ filters }) {
  const toast = useToast();
  const [a, setA] = useState(null);

  useEffect(() => {
    setA(null);
    getSurveyAnalytics(filters).then(setA).catch((e) => toast.error(e.message));
  }, [filters, toast]);

  if (!a) return <Spinner label="Calculating indicators…" />;
  const t = a.totals;
  if (!t.surveys) {
    return <Card><EmptyState icon={ClipboardList} title="No survey data yet" description="Import the field-survey Excel file in the “Import from Excel” tab." /></Card>;
  }

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard label="Farmers surveyed" value={fmt(t.surveys)} hint={`${fmt(t.linked_farmers)} linked to accounts`} icon={Users} />
        <StatCard label="Avocado trees counted" value={fmt(t.trees)} hint={`Hass ${fmt(t.hass_trees)} · Fuerte ${fmt(t.fuerte_trees)}`} icon={Trees} tone="blue" />
        <StatCard label="Production reported" value={`${fmt(t.total_tons, 1)} t`} hint={t.avg_price_per_avocado ? `avg ${fmt(t.avg_price_per_avocado)} RWF per avocado at farm` : 'no prices reported'} icon={Banknote} tone="amber" />
        <StatCard label="Farms with GPS" value={fmt(t.with_location)} hint={`${Math.round((t.with_location / t.surveys) * 100)}% of surveys`} icon={MapPinned} tone="slate" />
      </StatGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Farmers by district" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.by_district.slice(0, 15)} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v, n) => [fmt(v), n === 'surveys' ? 'Farmers' : 'Trees']} />
                <Bar dataKey="surveys" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Who the farmers are">
          <div className="space-y-4 text-sm">
            <div className="flex gap-2">
              <Badge tone="blue">Men {fmt(a.sex.male)}</Badge>
              <Badge tone="rose">Women {fmt(a.sex.female)}</Badge>
              {a.sex.unknown > 0 && <Badge>Not recorded {fmt(a.sex.unknown)}</Badge>}
            </div>
            <p className="text-slate-500">Average age: <span className="font-medium text-slate-900">{fmt(t.avg_age, 1)}</span></p>
            <div className="space-y-2">
              {a.age_groups.map((g) => (
                <div key={g.label} className="flex items-center gap-3">
                  <span className="w-16 text-slate-600">{g.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(g.count / Math.max(1, t.surveys)) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right font-medium">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Practices & access" subtitle="Share of farmers who answered yes (of those who answered)">
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
          <RateBar label="Has ever harvested" rate={a.rates.ever_harvested} />
          <RateBar label="Uses fertiliser" rate={a.rates.uses_fertilizer} />
          <RateBar label="Uses pesticides" rate={a.rates.uses_pesticides} />
          <RateBar label="Uses credit" rate={a.rates.uses_credit} />
          <RateBar label="Respondent is the owner" rate={a.rates.respondent_is_owner} />
          <RateBar label="Farmer has a disability" rate={a.rates.has_disability} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <TopList title="Main challenges" items={a.top.challenges} total={t.surveys} />
        <TopList title="How farmers sell" items={a.top.selling_channels} total={t.surveys} />
        <TopList title="Main market outlet" items={a.top.main_market_outlet} total={t.surveys} />
        <TopList title="Source of seedlings" items={a.top.seedling_sources} total={t.surveys} />
        <TopList title="Market information from" items={a.top.market_info_access} total={t.surveys} />
        <TopList title="Production information from" items={a.top.production_info_access} total={t.surveys} />
        <TopList title="Access to credit" items={a.top.credit_access} total={t.surveys} />
        <TopList title="Fertiliser types" items={a.top.fertilizer_types} total={t.surveys} />
        <TopList title="Aggregation model effectiveness" items={a.top.aggregation_effectiveness} total={t.surveys} />
      </div>
    </div>
  );
}

function SurveyDrawer({ id, onClose }) {
  const toast = useToast();
  const [s, setS] = useState(null);
  useEffect(() => {
    getSurvey(id).then(setS).catch((e) => toast.error(e.message));
  }, [id, toast]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-end bg-slate-900/40" onClick={onClose} role="dialog" aria-modal="true" aria-label="Survey details">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">{s ? s.owner_name || s.respondent_name : 'Survey'}</h2>
            {s && <p className="text-sm text-slate-500">{[s.village, s.cell, s.sector, s.district].filter(Boolean).join(', ')}</p>}
          </div>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close" />
        </div>
        {!s ? <Spinner /> : (
          <div className="space-y-5 p-5 text-sm">
            <div className="flex flex-wrap gap-2">
              {s.farmer ? <Badge tone="brand">Account: {s.farmer.full_name}{s.farmer.credentials_claimed ? ' (activated)' : ' (not activated)'}</Badge> : <Badge tone="amber">No farmer account</Badge>}
              {s.farm?.upi && <Badge tone="blue">UPI {s.farm.upi}</Badge>}
              {s.latitude != null && <Badge>GPS {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}</Badge>}
            </div>
            <div>
              <h3 className="mb-2 font-medium text-slate-900">All answers (as in the spreadsheet)</h3>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {Object.entries(s.raw || {}).filter(([, v]) => v !== null && v !== '').map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-3 px-3 py-2">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="break-words text-slate-900">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {s.batch && <p className="text-xs text-slate-400">Imported from {s.batch.file_name}, row {s.row_number}</p>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function Records({ filters }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [filters]);

  useEffect(() => {
    listSurveys({ ...filters, search: debounced, page, limit: 20 }).then(setRes).catch((e) => toast.error(e.message));
  }, [filters, debounced, page, toast]);

  return (
    <Card padded={false}>
      <div className="border-b border-slate-100 p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className={`${inputClass} pl-9`} placeholder="Search name, national ID, phone or village…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {!res ? <Spinner /> : res.data.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No surveys found" description="Try another search or filter." />
      ) : (
        <>
          <Table head={['Farmer', 'Sex / age', 'Location', 'Trees', 'Harvested', 'GPS', 'Account', 'Interview']}>
            {res.data.map((s) => (
              <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpenId(s.id)}>
                <Td className="font-medium text-slate-900">
                  {s.owner_name || s.respondent_name}
                  <div className="text-xs font-normal text-slate-500">{s.farmer_contact || ''}</div>
                </Td>
                <Td>{s.sex || '—'}{s.farmer_age ? ` · ${s.farmer_age}` : ''}</Td>
                <Td>{[s.sector, s.district].filter(Boolean).join(', ')}</Td>
                <Td>{fmt(s.physical_tree_count)}</Td>
                <Td>{s.ever_harvested == null ? '—' : s.ever_harvested ? 'Yes' : 'No'}</Td>
                <Td>{s.latitude != null ? <Badge tone="brand">Yes</Badge> : <Badge>No</Badge>}</Td>
                <Td>{s.farmer_id ? <Badge tone="blue">Linked</Badge> : <Badge tone="amber">None</Badge>}</Td>
                <Td className="text-slate-500">{s.interview_date ? new Date(s.interview_date).toLocaleDateString() : '—'}</Td>
              </tr>
            ))}
          </Table>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-500">{fmt(res.pagination.total)} records</span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-slate-500">Page {page} of {Math.max(1, res.pagination.totalPages)}</span>
              <Button variant="secondary" size="sm" disabled={!res.pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
      {openId && <SurveyDrawer id={openId} onClose={() => setOpenId(null)} />}
    </Card>
  );
}

/**
 * Farmer baseline survey data: indicators, the records themselves, and the
 * Excel import. Admin + agent.
 */
export default function Surveys({ role = 'admin' }) {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [filters, setFilters] = useState({ province: '', district: '', sex: '' });
  const [exporting, setExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, ...(k === 'province' ? { district: '' } : {}) }));
  const districts = filters.province ? RWANDA_DISTRICTS[filters.province] : ALL_DISTRICTS;

  const doExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportSurveys(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setExporting(false);
    }
  }, [filters, toast]);

  return (
    <Page>
      <PageHeader
        icon={ClipboardList}
        title="Farmer Surveys"
        subtitle="Baseline field-survey data for every avocado farmer: who they are, their farms, practices, markets and challenges."
        actions={<Button variant="secondary" icon={Download} loading={exporting} onClick={doExport}>Export to Excel</Button>}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <nav className="inline-flex rounded-xl bg-slate-100 p-1" aria-label="Survey sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        {tab !== 'import' && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Field label="Province">
              <select className={inputClass} value={filters.province} onChange={(e) => setFilter('province', e.target.value)}>
                <option value="">All</option>
                {RWANDA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="District">
              <select className={inputClass} value={filters.district} onChange={(e) => setFilter('district', e.target.value)}>
                <option value="">All</option>
                {districts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Sex">
              <select className={inputClass} value={filters.sex} onChange={(e) => setFilter('sex', e.target.value)}>
                <option value="">All</option>
                <option value="female">Women</option>
                <option value="male">Men</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      {tab === 'overview' && <Overview key={refreshKey} filters={filters} />}
      {tab === 'records' && <Records key={refreshKey} filters={filters} />}
      {tab === 'import' && <SurveyImport role={role} onImported={() => setRefreshKey((k) => k + 1)} />}
    </Page>
  );
}
