import { useState, useEffect, useCallback } from 'react';
import { Trees, Plus, RefreshCw, Search, Eye, Pencil, Sprout, Ruler, Leaf, Bug, CheckCircle2 } from 'lucide-react';
import {
  listFarmsPage, createFarm, updateFarm, getFarmsOverview,
  getFarmDetails, getFarmHistory, getFarmProductionStats,
} from '../../services/farmsService';
import {
  getFarmTreeSummary, listFarmTrees, addTreeRecord,
  listFarmTreeDiseases, reportTreeDisease, updateTreeDisease,
} from '../../services/treesService';
import { listProvinces, listDistricts, listSectors, listCells, listVillages } from '../../services/geographyService';
import { listUsersPage } from '../../services/usersService';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS } from '../../utils/rwanda';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

const STATUS_OPTIONS = ['preparing', 'planted', 'growing', 'producing', 'harvesting', 'dormant'];
const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_TONE = { preparing: 'slate', planted: 'blue', growing: 'blue', producing: 'brand', harvesting: 'amber', dormant: 'slate' };
const SEVERITY_TONE = { low: 'brand', medium: 'amber', high: 'rose', critical: 'rose' };
const LEVELS = ['province', 'district', 'sector', 'cell', 'village'];
const CHILD_LOADERS = { province: listDistricts, district: listSectors, sector: listCells, cell: listVillages };

const emptyLocation = { province: '', district: '', sector: '', cell: '', village: '' };
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '—');
const farmName = (f) => f?.farmName || f?.farm_name || 'Unnamed farm';
const placeOf = (loc) => [loc?.sector, loc?.district].filter(Boolean).join(', ') || loc?.province || '—';
const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

/**
 * Province → district → sector → cell → village picker. Uses the geography
 * API when it has data; otherwise falls back to the static NISR province /
 * district lists and free-text sector/cell/village. Stores names, not ids.
 */
export const LocationFields = ({ value = emptyLocation, onChange }) => {
  const [opts, setOpts] = useState({ province: [], district: [], sector: [], cell: [], village: [] });
  const [ids, setIds] = useState({});

  useEffect(() => {
    listProvinces()
      .then((p) => setOpts((o) => ({ ...o, province: Array.isArray(p) ? p : [] })))
      .catch(() => {});
  }, []);

  const pick = async (level, id) => {
    const item = opts[level].find((x) => x.id === id);
    const idx = LEVELS.indexOf(level);
    const next = { ...value, [level]: item?.name || '' };
    const nextIds = { ...ids, [level]: id };
    const nextOpts = { ...opts };
    LEVELS.slice(idx + 1).forEach((l) => {
      next[l] = '';
      delete nextIds[l];
      nextOpts[l] = [];
    });
    setIds(nextIds);
    setOpts(nextOpts);
    onChange(next);
    const child = LEVELS[idx + 1];
    if (id && child && CHILD_LOADERS[level]) {
      try {
        const list = await CHILD_LOADERS[level](id);
        setOpts((o) => ({ ...o, [child]: Array.isArray(list) ? list : [] }));
      } catch {
        /* free-text fallback for this level */
      }
    }
  };

  const setText = (level, text) => {
    const idx = LEVELS.indexOf(level);
    const next = { ...value, [level]: text };
    if (level === 'province') LEVELS.slice(idx + 1, idx + 2).forEach((l) => { next[l] = ''; });
    onChange(next);
  };

  const renderLevel = (level) => {
    const label = cap(level);
    const apiOptions = opts[level];
    if (apiOptions.length > 0) {
      const selectedId = ids[level] || apiOptions.find((x) => x.name === value[level])?.id || '';
      return (
        <select className={inputClass} value={selectedId} onChange={(e) => pick(level, e.target.value)}>
          <option value="">Select {level}</option>
          {apiOptions.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      );
    }
    const staticList =
      level === 'province' ? RWANDA_PROVINCES : level === 'district' ? RWANDA_DISTRICTS[value.province] : null;
    if (staticList) {
      const list = value[level] && !staticList.includes(value[level]) ? [value[level], ...staticList] : staticList;
      return (
        <select className={inputClass} value={value[level] || ''} onChange={(e) => setText(level, e.target.value)}>
          <option value="">Select {level}</option>
          {list.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      );
    }
    return (
      <input className={inputClass} value={value[level] || ''} placeholder={label} onChange={(e) => setText(level, e.target.value)} />
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {LEVELS.map((level) => (
        <Field key={level} label={cap(level)}>{renderLevel(level)}</Field>
      ))}
    </div>
  );
};

const emptyFarm = () => ({
  farmer_id: '', farm_name: '', farm_size: '', tree_count: '', varieties: '', planting_date: '',
  expected_harvest: '', status: 'planted', notes: '', location: { ...emptyLocation },
});
const emptyCensus = () => ({
  record_date: today(), total_trees: '', age_0_2: '', age_3_5: '', age_6_10: '', age_above_10: '',
  healthy_count: '', diseased_count: '', dead_count: '', notes: '',
});
const emptyTreeDisease = () => ({ disease_name: '', affected_count: '', severity: 'low', detected_date: today(), notes: '' });

/** Farmer picker with server-side search. */
const FarmerPicker = ({ value, onChange }) => {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      listUsersPage('farmers', { search: search || undefined, limit: 50 })
        .then((res) => alive && setOptions(res.data))
        .catch(() => alive && setOptions([]))
        .finally(() => alive && setLoading(false));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search]);

  return (
    <div className="space-y-2">
      <input className={inputClass} placeholder="Search farmers by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search farmers" />
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Farmer">
        <option value="">{loading ? 'Loading farmers…' : options.length ? 'Select a farmer' : 'No farmers found'}</option>
        {options.map((f) => (
          <option key={f.id} value={f.id}>{f.full_name} — {f.email}</option>
        ))}
      </select>
    </div>
  );
};

const Detail = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900">{children ?? '—'}</dd>
  </div>
);

const Farms = () => {
  const toast = useToast();

  const [farms, setFarms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);

  const [formMode, setFormMode] = useState(null); // 'create' | 'edit'
  const [form, setForm] = useState(emptyFarm);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('overview');
  const [details, setDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState(null);
  const [trees, setTrees] = useState(null); // { summary, records, diseases }
  const [detailLoading, setDetailLoading] = useState(false);

  const [census, setCensus] = useState(null);
  const [treeDisease, setTreeDisease] = useState(null);
  const [subSaving, setSubSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFarmsPage({ page, limit: 15, status: statusFilter || undefined });
      setFarms(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const loadOverview = useCallback(() => {
    getFarmsOverview().then(setOverview).catch(() => setOverview(null));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadOverview(); }, [loadOverview]);

  const term = search.trim().toLowerCase();
  const visible = term
    ? farms.filter((f) => farmName(f).toLowerCase().includes(term) || (f.farmer?.full_name || f.farmerName || '').toLowerCase().includes(term))
    : farms;

  // ---- create / edit ----
  const openCreate = () => {
    setForm(emptyFarm());
    setFormMode('create');
  };
  const openEdit = (farm) => {
    setForm({
      id: farm.id,
      farmer_id: farm.farmer_id,
      farm_name: farmName(farm),
      farm_size: farm.farm_size ?? '',
      tree_count: farm.tree_count ?? '',
      varieties: (farm.varieties || []).join(', '),
      planting_date: farm.planting_date ? farm.planting_date.slice(0, 10) : '',
      expected_harvest: farm.expected_harvest ? farm.expected_harvest.slice(0, 10) : '',
      status: farm.status || 'planted',
      notes: farm.notes || '',
      location: { ...emptyLocation, ...(farm.location || {}) },
    });
    setFormMode('edit');
  };
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitFarm = async (e) => {
    e.preventDefault();
    if (formMode === 'create' && !form.farmer_id) return toast.error('Please select a farmer');
    if (!form.farm_name.trim()) return toast.error('Farm name is required');
    if (form.farm_size !== '' && Number(form.farm_size) < 0) return toast.error('Farm size cannot be negative');
    if (form.tree_count !== '' && (!Number.isInteger(Number(form.tree_count)) || Number(form.tree_count) < 0)) {
      return toast.error('Tree count must be a whole number');
    }
    const payload = {
      farm_name: form.farm_name.trim(),
      farm_size: num(form.farm_size),
      tree_count: num(form.tree_count),
      varieties: form.varieties.split(',').map((v) => v.trim()).filter(Boolean),
      planting_date: form.planting_date || undefined,
      expected_harvest: form.expected_harvest || undefined,
      status: form.status || undefined,
      notes: form.notes.trim() || undefined,
      location: form.location,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    setSaving(true);
    try {
      if (formMode === 'create') {
        await createFarm({ ...payload, farmer_id: form.farmer_id, crop_type: 'avocado' });
        toast.success('Farm registered');
        setPage(1);
      } else {
        await updateFarm(form.id, payload);
        toast.success('Farm updated');
      }
      setFormMode(null);
      load();
      loadOverview();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- detail ----
  const loadTrees = useCallback(async (farmId) => {
    const [summary, records, diseases] = await Promise.all([
      getFarmTreeSummary(farmId),
      listFarmTrees(farmId),
      listFarmTreeDiseases(farmId),
    ]);
    setTrees({ summary, records, diseases });
  }, []);

  const openDetail = async (farm) => {
    setSelected(farm);
    setTab('overview');
    setDetails(null);
    setStats(null);
    setHistory(null);
    setTrees(null);
    setDetailLoading(true);
    try {
      const [d, s] = await Promise.all([getFarmDetails(farm.id), getFarmProductionStats(farm.id)]);
      setDetails(d);
      setStats(s);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const changeTab = async (t) => {
    setTab(t);
    if (!selected) return;
    try {
      if (t === 'trees' && !trees) {
        setDetailLoading(true);
        await loadTrees(selected.id);
      }
      if (t === 'history' && !history) {
        setDetailLoading(true);
        setHistory(await getFarmHistory(selected.id));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitCensus = async (e) => {
    e.preventDefault();
    const counts = ['total_trees', 'age_0_2', 'age_3_5', 'age_6_10', 'age_above_10', 'healthy_count', 'diseased_count', 'dead_count'];
    const payload = { record_date: census.record_date || undefined, notes: census.notes.trim() || undefined };
    for (const k of counts) {
      if (census[k] === '') continue;
      const n = Number(census[k]);
      if (!Number.isInteger(n) || n < 0) return toast.error(`${cap(k)} must be a whole number`);
      payload[k] = n;
    }
    if (payload.total_trees === undefined) return toast.error('Total trees is required');
    const health = (payload.healthy_count || 0) + (payload.diseased_count || 0) + (payload.dead_count || 0);
    if (health > payload.total_trees) return toast.error('Healthy + diseased + dead cannot exceed total trees');
    setSubSaving(true);
    try {
      await addTreeRecord(selected.id, payload);
      toast.success('Tree census recorded');
      setCensus(null);
      await loadTrees(selected.id);
      load();
      loadOverview();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubSaving(false);
    }
  };

  const submitTreeDisease = async (e) => {
    e.preventDefault();
    if (!treeDisease.disease_name.trim()) return toast.error('Disease name is required');
    const affected = num(treeDisease.affected_count);
    if (affected !== undefined && (!Number.isInteger(affected) || affected < 0)) return toast.error('Affected trees must be a whole number');
    setSubSaving(true);
    try {
      await reportTreeDisease(selected.id, {
        disease_name: treeDisease.disease_name.trim(),
        affected_count: affected,
        severity: treeDisease.severity,
        detected_date: treeDisease.detected_date || undefined,
        notes: treeDisease.notes.trim() || undefined,
      });
      toast.success('Tree disease recorded');
      setTreeDisease(null);
      await loadTrees(selected.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubSaving(false);
    }
  };

  const markTreated = async (d) => {
    try {
      await updateTreeDisease(d.id, { treated: true });
      toast.success(`${d.disease_name} marked as treated`);
      await loadTrees(selected.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const latest = trees?.summary?.latest_record;

  return (
    <Page>
      <PageHeader
        icon={Trees}
        title="Farms"
        subtitle="Register farms, record tree censuses and track tree health."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { load(); loadOverview(); }}>Refresh</Button>
            <Button icon={Plus} onClick={openCreate}>Register farm</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Farms" value={overview ? Number(overview.total_farms || 0).toLocaleString() : '—'} icon={Trees} />
        <StatCard label="Producing" value={overview ? Number(overview.by_status?.producing || 0).toLocaleString() : '—'} icon={Sprout} tone="blue" />
        <StatCard label="Trees" value={overview ? Number(overview.total_trees || 0).toLocaleString() : '—'} icon={Leaf} tone="amber" />
        <StatCard label="Area" value={overview ? `${Number(overview.total_area || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} ha` : '—'} icon={Ruler} tone="slate" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Filter this page by farm or farmer…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Filter farms" />
          </div>
          <select className={`${inputClass} sm:w-48`} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Status filter">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading farms…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState icon={Trees} title="No farms found" description={term || statusFilter ? 'Try a different filter.' : 'Register the first farm to get started.'} />
        ) : (
          <Table head={['Farm', 'Farmer', 'Location', 'Size', 'Trees', 'Status', '']}>
            {visible.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">
                  {farmName(f)}
                  {f.archived_at && <Badge className="ml-2">Archived</Badge>}
                </Td>
                <Td>{f.farmer?.full_name || f.farmerName || '—'}</Td>
                <Td>{placeOf(f.location)}</Td>
                <Td>{f.farm_size ? `${f.farm_size} ha` : '—'}</Td>
                <Td>{Number(f.tree_count || 0).toLocaleString()}</Td>
                <Td><Badge tone={STATUS_TONE[f.status]}>{cap(f.status)}</Badge></Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => openDetail(f)} aria-label={`View ${farmName(f)}`}>View</Button>
                    <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(f)} aria-label={`Edit ${farmName(f)}`}>Edit</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
        {!loading && !error && (
          <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
        )}
      </Card>

      {/* Create / edit farm */}
      <Dialog
        open={!!formMode}
        size="lg"
        title={formMode === 'create' ? 'Register farm' : 'Edit farm'}
        onClose={() => !saving && setFormMode(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormMode(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="farm-form" loading={saving}>{formMode === 'create' ? 'Register farm' : 'Save changes'}</Button>
          </>
        }
      >
        <form id="farm-form" onSubmit={submitFarm} className="space-y-4">
          {formMode === 'create' && (
            <Field label="Farmer" required>
              <FarmerPicker value={form.farmer_id} onChange={(v) => setF('farmer_id', v)} />
            </Field>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Farm name" required className="sm:col-span-2">
              <input className={inputClass} value={form.farm_name} onChange={(e) => setF('farm_name', e.target.value)} maxLength={150} />
            </Field>
            <Field label="Size (ha)">
              <input type="number" min="0" step="0.01" className={inputClass} value={form.farm_size} onChange={(e) => setF('farm_size', e.target.value)} />
            </Field>
            <Field label="Number of trees">
              <input type="number" min="0" step="1" className={inputClass} value={form.tree_count} onChange={(e) => setF('tree_count', e.target.value)} />
            </Field>
            <Field label="Varieties" hint="Comma separated, e.g. Hass, Fuerte">
              <input className={inputClass} value={form.varieties} onChange={(e) => setF('varieties', e.target.value)} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setF('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </Field>
            <Field label="Planting date">
              <input type="date" className={inputClass} value={form.planting_date} onChange={(e) => setF('planting_date', e.target.value)} />
            </Field>
            <Field label="Expected harvest">
              <input type="date" className={inputClass} value={form.expected_harvest} onChange={(e) => setF('expected_harvest', e.target.value)} />
            </Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Location</p>
            <LocationFields value={form.location} onChange={(loc) => setF('location', loc)} />
          </div>
          <Field label="Notes">
            <textarea className={textareaClass} value={form.notes} onChange={(e) => setF('notes', e.target.value)} />
          </Field>
        </form>
      </Dialog>

      {/* Farm detail */}
      <Dialog open={!!selected} size="xl" title={farmName(selected)} subtitle={selected?.farmer?.full_name || selected?.farmerName} onClose={() => setSelected(null)}>
        <div className="space-y-4">
          <Tabs
            value={tab}
            onChange={changeTab}
            tabs={[{ id: 'overview', label: 'Overview' }, { id: 'trees', label: 'Trees & health' }, { id: 'history', label: 'History' }]}
          />
          {detailLoading ? (
            <Spinner />
          ) : tab === 'overview' ? (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Detail label="Status"><Badge tone={STATUS_TONE[details?.status]}>{cap(details?.status)}</Badge></Detail>
              <Detail label="Size">{details?.farm_size ? `${details.farm_size} ha` : '—'}</Detail>
              <Detail label="Trees">{Number(details?.tree_count || 0).toLocaleString()}</Detail>
              <Detail label="Varieties">{details?.varieties?.length ? details.varieties.join(', ') : '—'}</Detail>
              <Detail label="Planted">{fmtDate(details?.planting_date)}</Detail>
              <Detail label="Expected harvest">{fmtDate(details?.expected_harvest)}{details?.is_harvest_ready && <Badge tone="brand" className="ml-2">Ready</Badge>}</Detail>
              <Detail label="Estimated yield (per harvest)">{details?.estimated_yield || '—'}</Detail>
              <Detail label="Estimated annual yield">{stats?.estimated_annual_yield || '—'}</Detail>
              <Detail label="Farmer phone">{details?.farmer?.phone || '—'}</Detail>
              <Detail label="Location">{LEVELS.map((l) => details?.location?.[l]).filter(Boolean).join(' › ') || '—'}</Detail>
              <Detail label="Notes">{details?.notes || '—'}</Detail>
            </dl>
          ) : tab === 'trees' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                  {latest
                    ? `Latest census ${fmtDate(latest.record_date)}: ${latest.total_trees} trees (${latest.healthy_count} healthy, ${latest.diseased_count} diseased, ${latest.dead_count} dead)`
                    : 'No tree census recorded yet.'}
                  {trees?.summary?.untreated_diseases_count ? ` · ${trees.summary.untreated_diseases_count} untreated disease report(s)` : ''}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={Bug} onClick={() => setTreeDisease(emptyTreeDisease())}>Report disease</Button>
                  <Button size="sm" icon={Plus} onClick={() => setCensus(emptyCensus())}>Record census</Button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Tree census records</h3>
                {trees?.records?.length ? (
                  <div className="rounded-xl border border-slate-200">
                    <Table head={['Date', 'Total', '0–2 y', '3–5 y', '6–10 y', '10+ y', 'Healthy', 'Diseased', 'Dead', 'Notes']}>
                      {trees.records.map((r) => (
                        <tr key={r.id}>
                          <Td>{fmtDate(r.record_date)}</Td>
                          <Td className="font-medium text-slate-900">{r.total_trees}</Td>
                          <Td>{r.age_0_2}</Td>
                          <Td>{r.age_3_5}</Td>
                          <Td>{r.age_6_10}</Td>
                          <Td>{r.age_above_10}</Td>
                          <Td>{r.healthy_count}</Td>
                          <Td>{r.diseased_count}</Td>
                          <Td>{r.dead_count}</Td>
                          <Td className="max-w-xs truncate">{r.notes || '—'}</Td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                ) : (
                  <EmptyState icon={Leaf} title="No census records" description="Record a tree census to track tree ages and health over time." />
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Tree disease reports</h3>
                {trees?.diseases?.length ? (
                  <div className="rounded-xl border border-slate-200">
                    <Table head={['Detected', 'Disease', 'Affected', 'Severity', 'Status', '']}>
                      {trees.diseases.map((d) => (
                        <tr key={d.id}>
                          <Td>{fmtDate(d.detected_date)}</Td>
                          <Td className="font-medium text-slate-900">{d.disease_name}</Td>
                          <Td>{d.affected_count}</Td>
                          <Td><Badge tone={SEVERITY_TONE[d.severity]}>{cap(d.severity)}</Badge></Td>
                          <Td>{d.treated ? <Badge tone="brand">Treated</Badge> : <Badge tone="amber">Untreated</Badge>}</Td>
                          <Td className="text-right">
                            {!d.treated && (
                              <Button size="sm" variant="ghost" icon={CheckCircle2} onClick={() => markTreated(d)}>Mark treated</Button>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                ) : (
                  <EmptyState icon={Bug} title="No tree diseases reported" />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {[
                ['Farm visits', history?.visits, (v) => [fmtDate(v.scheduled_at), v.purpose || v.visit_number, v.agent?.full_name || '—', cap(v.status)]],
                ['Service requests', history?.service_requests, (r) => [fmtDate(r.created_at), r.title, cap(r.service_type), cap(r.status)]],
                ['Reports', history?.reports, (r) => [fmtDate(r.created_at), r.title, cap(r.report_type), cap(r.status)]],
              ].map(([title, rows, cols]) => (
                <div key={title}>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
                  {rows?.length ? (
                    <div className="rounded-xl border border-slate-200">
                      <Table head={title === 'Farm visits' ? ['Date', 'Purpose', 'Agent', 'Status'] : ['Date', 'Title', 'Type', 'Status']}>
                        {rows.map((row) => (
                          <tr key={row.id}>{cols(row).map((c, i) => <Td key={i}>{c}</Td>)}</tr>
                        ))}
                      </Table>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No {title.toLowerCase()} yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      {/* Tree census */}
      <Dialog
        open={!!census}
        title="Record tree census"
        subtitle={farmName(selected)}
        onClose={() => !subSaving && setCensus(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCensus(null)} disabled={subSaving}>Cancel</Button>
            <Button type="submit" form="census-form" loading={subSaving}>Save census</Button>
          </>
        }
      >
        {census && (
          <form id="census-form" onSubmit={submitCensus} className="grid grid-cols-2 gap-3">
            <Field label="Date" className="col-span-2 sm:col-span-1">
              <input type="date" className={inputClass} value={census.record_date} max={today()} onChange={(e) => setCensus({ ...census, record_date: e.target.value })} />
            </Field>
            <Field label="Total trees" required className="col-span-2 sm:col-span-1">
              <input type="number" min="0" className={inputClass} value={census.total_trees} onChange={(e) => setCensus({ ...census, total_trees: e.target.value })} />
            </Field>
            {[['age_0_2', 'Age 0–2 years'], ['age_3_5', 'Age 3–5 years'], ['age_6_10', 'Age 6–10 years'], ['age_above_10', 'Over 10 years'], ['healthy_count', 'Healthy'], ['diseased_count', 'Diseased'], ['dead_count', 'Dead']].map(([k, label]) => (
              <Field key={k} label={label}>
                <input type="number" min="0" className={inputClass} value={census[k]} onChange={(e) => setCensus({ ...census, [k]: e.target.value })} />
              </Field>
            ))}
            <Field label="Notes" className="col-span-2">
              <textarea className={textareaClass} value={census.notes} onChange={(e) => setCensus({ ...census, notes: e.target.value })} />
            </Field>
          </form>
        )}
      </Dialog>

      {/* Tree disease */}
      <Dialog
        open={!!treeDisease}
        title="Report tree disease"
        subtitle={farmName(selected)}
        onClose={() => !subSaving && setTreeDisease(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTreeDisease(null)} disabled={subSaving}>Cancel</Button>
            <Button type="submit" form="tree-disease-form" loading={subSaving}>Report</Button>
          </>
        }
      >
        {treeDisease && (
          <form id="tree-disease-form" onSubmit={submitTreeDisease} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Disease" required className="sm:col-span-2">
              <input className={inputClass} value={treeDisease.disease_name} onChange={(e) => setTreeDisease({ ...treeDisease, disease_name: e.target.value })} placeholder="e.g. Root rot" />
            </Field>
            <Field label="Affected trees">
              <input type="number" min="0" className={inputClass} value={treeDisease.affected_count} onChange={(e) => setTreeDisease({ ...treeDisease, affected_count: e.target.value })} />
            </Field>
            <Field label="Severity">
              <select className={inputClass} value={treeDisease.severity} onChange={(e) => setTreeDisease({ ...treeDisease, severity: e.target.value })}>
                {SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </Field>
            <Field label="Detected on">
              <input type="date" className={inputClass} max={today()} value={treeDisease.detected_date} onChange={(e) => setTreeDisease({ ...treeDisease, detected_date: e.target.value })} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={treeDisease.notes} onChange={(e) => setTreeDisease({ ...treeDisease, notes: e.target.value })} />
            </Field>
          </form>
        )}
      </Dialog>
    </Page>
  );
};

export default Farms;
