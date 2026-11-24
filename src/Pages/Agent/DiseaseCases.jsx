import { useCallback, useEffect, useState } from 'react';
import { Bug, Plus, RefreshCw, Pencil, Activity, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import {
  listDiseaseCasesPage, reportDiseaseCase, updateDiseaseCase, listDiseaseRegistryPage, getDiseaseStatistics,
} from '../../services/diseasesService';
import { listFarmsPage } from '../../services/farmsService';
import { listUsersPage } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['active', 'monitoring', 'treated', 'resolved'];
const SEVERITY_TONE = { low: 'brand', medium: 'amber', high: 'rose', critical: 'rose' };
const STATUS_TONE = { active: 'rose', monitoring: 'amber', treated: 'blue', resolved: 'brand' };
const STATUS_TABS = [{ id: '', label: 'All' }, ...STATUSES.map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1) }))];

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const farmLabel = (f) => f?.farmName || f?.farm_name || 'Unnamed farm';
const emptyReport = () => ({ farmer_id: '', farm_id: '', disease_name: '', severity: 'low', affected_trees: '', symptoms: '', treatment: '', notes: '' });

/** Pick a farmer (server-side search), then one of their farms. onChange gets { farmer_id, farm_id, farm }. */
export const FarmerFarmPicker = ({ farmerId, farmId, onChange }) => {
  const [search, setSearch] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(false);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      listUsersPage('farmers', { search: search.trim() || undefined, limit: 50 })
        .then((res) => alive && setFarmers(res.data))
        .catch(() => alive && setFarmers([]));
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [search]);

  useEffect(() => {
    if (!farmerId) { setFarms([]); return undefined; }
    let alive = true;
    setLoadingFarms(true);
    listFarmsPage({ farmer_id: farmerId, limit: 100 })
      .then((res) => {
        if (!alive) return;
        setFarms(res.data);
        if (res.data.length === 1) onChange({ farmer_id: farmerId, farm_id: res.data[0].id, farm: res.data[0] });
      })
      .catch(() => alive && setFarms([]))
      .finally(() => alive && setLoadingFarms(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when the farmer changes
  }, [farmerId]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Farmer" required className="sm:col-span-2">
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={inputClass + ' pl-9'} placeholder="Search farmers by name or email…" aria-label="Search farmers" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={inputClass} value={farmerId} onChange={(e) => onChange({ farmer_id: e.target.value, farm_id: '', farm: null })}>
            <option value="">Select farmer</option>
            {farmers.map((f) => <option key={f.id} value={f.id}>{f.full_name} — {f.district || f.email}</option>)}
          </select>
        </div>
      </Field>
      <Field label="Farm" required className="sm:col-span-2" hint={farmerId && !loadingFarms && farms.length === 0 ? 'This farmer has no registered farm yet — register one on the Farms page first.' : undefined}>
        <select className={inputClass} value={farmId} disabled={!farmerId || loadingFarms} onChange={(e) => onChange({ farmer_id: farmerId, farm_id: e.target.value, farm: farms.find((f) => f.id === e.target.value) || null })}>
          <option value="">{loadingFarms ? 'Loading farms…' : farmerId ? 'Select farm' : 'Select a farmer first'}</option>
          {farms.map((f) => <option key={f.id} value={f.id}>{farmLabel(f)}</option>)}
        </select>
      </Field>
    </div>
  );
};

export default function DiseaseCases() {
  const toast = useToast();
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [registry, setRegistry] = useState([]);

  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDiseaseCasesPage({ page, limit: PAGE_SIZE, status: status || undefined, severity: severity || undefined });
      setCases(res.data);
      setPagination({ page: res.pagination.page || page, totalPages: res.pagination.totalPages || 1, total: res.pagination.total ?? res.data.length });
    } catch (err) {
      setError(err.message || 'Failed to load disease cases');
    } finally {
      setLoading(false);
    }
  }, [page, status, severity]);

  const loadStats = useCallback(() => {
    getDiseaseStatistics().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status, severity]);
  useEffect(() => {
    loadStats();
    listDiseaseRegistryPage({ is_active: 'true', limit: 100 }).then((r) => setRegistry(r.data)).catch(() => setRegistry([]));
  }, [loadStats]);

  const countBy = (list, key, value) => list?.find((x) => x[key] === value)?.count ?? 0;
  const totalCases = stats ? stats.cases_by_status.reduce((s, x) => s + x.count, 0) : null;

  const submitReport = async (e) => {
    e.preventDefault();
    if (!report.farm_id) return toast.error('Select the farmer and farm');
    if (!report.disease_name.trim()) return toast.error('Enter the disease name');
    if (report.affected_trees !== '' && (!Number.isInteger(Number(report.affected_trees)) || Number(report.affected_trees) < 0)) {
      return toast.error('Affected trees must be a whole number');
    }
    setSaving(true);
    try {
      const payload = {
        farm_id: report.farm_id,
        disease_name: report.disease_name.trim(),
        severity: report.severity,
      };
      if (report.affected_trees !== '') payload.affected_trees = Number(report.affected_trees);
      ['symptoms', 'treatment', 'notes'].forEach((k) => { if (report[k].trim()) payload[k] = report[k].trim(); });
      const created = await reportDiseaseCase(payload);
      toast.success(`Case ${created?.case_number || ''} reported`.trim());
      setReport(null);
      setPage(1);
      load();
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Failed to report case');
    } finally {
      setSaving(false);
    }
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (editing.affected_trees !== '' && (!Number.isInteger(Number(editing.affected_trees)) || Number(editing.affected_trees) < 0)) {
      return toast.error('Affected trees must be a whole number');
    }
    setSaving(true);
    try {
      const payload = {
        status: editing.status,
        severity: editing.severity,
        treatment: editing.treatment,
        notes: editing.notes,
      };
      if (editing.affected_trees !== '') payload.affected_trees = Number(editing.affected_trees);
      if (editing.status === 'resolved' && !editing.resolved_date) payload.resolved_date = new Date().toISOString();
      await updateDiseaseCase(editing.id, payload);
      toast.success('Case updated');
      setEditing(null);
      load();
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Failed to update case');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString());

  return (
    <Page>
      <PageHeader
        icon={Bug}
        title="Disease Cases"
        subtitle="Report pest and disease cases on farms and track them until resolved."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { load(); loadStats(); }} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={() => setReport(emptyReport())}>Report case</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="All cases" value={fmt(totalCases)} icon={Bug} tone="slate" />
        <StatCard label="Active" value={fmt(stats ? countBy(stats.cases_by_status, 'status', 'active') : null)} icon={AlertTriangle} tone="rose" />
        <StatCard label="Monitoring / treated" value={fmt(stats ? countBy(stats.cases_by_status, 'status', 'monitoring') + countBy(stats.cases_by_status, 'status', 'treated') : null)} icon={Activity} tone="amber" />
        <StatCard label="Resolved" value={fmt(stats ? countBy(stats.cases_by_status, 'status', 'resolved') : null)} icon={CheckCircle2} />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs tabs={STATUS_TABS} value={status} onChange={setStatus} />
          <select className={inputClass + ' lg:w-48'} aria-label="Filter by severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </div>
        {loading ? (
          <Spinner label="Loading cases…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={Bug}
            title={status || severity ? 'No cases match these filters' : 'No disease cases reported'}
            description={status || severity ? 'Try another status or severity.' : 'Report a case when you find pests or disease on a farm.'}
            action={!status && !severity && <Button icon={Plus} onClick={() => setReport(emptyReport())}>Report case</Button>}
          />
        ) : (
          <>
            <Table head={['Case', 'Disease', 'Farm', 'Severity', 'Trees', 'Detected', 'Status', '']}>
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <Td className="font-mono text-xs">{c.case_number}</Td>
                  <Td className="font-medium text-slate-900">{c.disease_name}</Td>
                  <Td>
                    <p>{farmLabel(c.farm)}</p>
                    {c.farm?.farmerName && <p className="text-xs text-slate-500">{c.farm.farmerName}</p>}
                  </Td>
                  <Td><Badge tone={SEVERITY_TONE[c.severity]}>{cap(c.severity)}</Badge></Td>
                  <Td>{c.affected_trees ?? 0}</Td>
                  <Td>{fmtDate(c.detected_date)}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[c.status]}>{cap(c.status)}</Badge>
                    {c.resolved_date && <p className="mt-1 text-xs text-slate-500">on {fmtDate(c.resolved_date)}</p>}
                  </Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" icon={Pencil} aria-label={`Update case ${c.case_number}`}
                      onClick={() => setEditing({
                        id: c.id, case_number: c.case_number, disease_name: c.disease_name, status: c.status, severity: c.severity,
                        affected_trees: c.affected_trees ?? '', treatment: c.treatment || '', notes: c.notes || '', resolved_date: c.resolved_date,
                      })}>
                      Update
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      <Dialog open={!!report} title="Report disease case" onClose={() => !saving && setReport(null)} size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReport(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="report-case-form" icon={Plus} loading={saving}>Report case</Button>
          </>
        }>
        {report && (
          <form id="report-case-form" onSubmit={submitReport} className="space-y-4" noValidate>
            <FarmerFarmPicker farmerId={report.farmer_id} farmId={report.farm_id} onChange={(v) => setReport((r) => ({ ...r, ...v }))} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Disease / pest" required className="sm:col-span-2" hint={registry.length ? 'Pick from the registry or type a name.' : undefined}>
                <input className={inputClass} list="disease-registry" value={report.disease_name} onChange={(e) => setReport({ ...report, disease_name: e.target.value })} placeholder="e.g. Anthracnose" />
                <datalist id="disease-registry">
                  {registry.map((d) => <option key={d.id} value={d.name} />)}
                </datalist>
              </Field>
              <Field label="Severity">
                <select className={inputClass} value={report.severity} onChange={(e) => setReport({ ...report, severity: e.target.value })}>
                  {SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </Field>
              <Field label="Affected trees">
                <input type="number" min="0" step="1" className={inputClass} value={report.affected_trees} onChange={(e) => setReport({ ...report, affected_trees: e.target.value })} />
              </Field>
              <Field label="Symptoms" className="sm:col-span-2">
                <textarea className={textareaClass} value={report.symptoms} onChange={(e) => setReport({ ...report, symptoms: e.target.value })} />
              </Field>
              <Field label="Treatment applied / recommended" className="sm:col-span-2">
                <textarea className={textareaClass} value={report.treatment} onChange={(e) => setReport({ ...report, treatment: e.target.value })} />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <textarea className={textareaClass} value={report.notes} onChange={(e) => setReport({ ...report, notes: e.target.value })} />
              </Field>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!editing} title={editing ? `Update ${editing.case_number}` : ''} subtitle={editing?.disease_name} onClose={() => !saving && setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="update-case-form" loading={saving}>Save</Button>
          </>
        }>
        {editing && (
          <form id="update-case-form" onSubmit={submitUpdate} className="grid grid-cols-1 gap-3 sm:grid-cols-2" noValidate>
            <Field label="Status">
              <select className={inputClass} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </Field>
            <Field label="Severity">
              <select className={inputClass} value={editing.severity} onChange={(e) => setEditing({ ...editing, severity: e.target.value })}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </Field>
            <Field label="Affected trees">
              <input type="number" min="0" step="1" className={inputClass} value={editing.affected_trees} onChange={(e) => setEditing({ ...editing, affected_trees: e.target.value })} />
            </Field>
            <Field label="Treatment" className="sm:col-span-2">
              <textarea className={textareaClass} value={editing.treatment} onChange={(e) => setEditing({ ...editing, treatment: e.target.value })} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </Field>
          </form>
        )}
      </Dialog>
    </Page>
  );
}
