import { useCallback, useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle2, AlertTriangle, Eye, Pencil, Trash2, Download, Plus, RefreshCw, Loader } from 'lucide-react';
import {
  listReportsPage,
  getReportStatistics,
  createReport,
  updateReport,
  deleteReport,
  exportReports,
} from '../../services/reportsService';
import { listUsersPage } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

// Backend enums (dash-api prisma/schema.prisma: ReportType, ReportStatus, ReportPriority).
const REPORT_TYPES = ['inspection', 'audit', 'assessment', 'survey', 'other'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUS_TONES = { pending: 'amber', in_progress: 'blue', completed: 'brand', cancelled: 'slate' };
const PRIORITY_TONES = { low: 'slate', medium: 'blue', high: 'amber', urgent: 'rose' };

const label = (v) => (v ? v.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '—');
const formatDate = (v, withTime = false) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) });
};
// location is JSON on the backend: a plain string from this page, or {lat, lng, address} from other clients.
const formatLocation = (loc) => {
  if (!loc) return '—';
  if (typeof loc === 'string') return loc;
  if (loc.address) return loc.address;
  if (loc.lat !== undefined && loc.lng !== undefined) return `${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}`;
  return '—';
};
const toDateTimeLocal = (v) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm = {
  title: '', description: '', report_type: 'inspection', priority: 'medium', status: 'pending',
  agent_id: '', farmer_id: '', scheduled_date: '', location: '', findings: '', recommendations: '', notes: '',
};
const emptyFilters = { report_type: '', status: '', agent_id: '', date_from: '', date_to: '' };

const Reports = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [agents, setAgents] = useState([]);
  const [farmers, setFarmers] = useState([]);

  const [view, setView] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [form, setForm] = useState(null); // { id?, values }
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, st] = await Promise.all([
        listReportsPage({ ...filters, page, limit: 15 }),
        getReportStatistics().catch(() => null),
      ]);
      setReports(list.data);
      setPagination(list.pagination);
      setStats(st);
    } catch (err) {
      setError(err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listUsersPage('agents', { limit: 100 }).then((r) => setAgents(r.data)).catch(() => setAgents([]));
    listUsersPage('farmers', { limit: 100 }).then((r) => setFarmers(r.data)).catch(() => setFarmers([]));
  }, []);

  const agentName = (id, fallback) => fallback?.full_name || agents.find((a) => a.id === id)?.full_name || '—';
  const farmerName = (id) => (id ? farmers.find((f) => f.id === id)?.full_name || 'Unknown farmer' : '—');

  const setFilter = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const openForm = (report) => {
    if (report) {
      setForm({
        id: report.id,
        completedDate: report.completed_date,
        values: {
          title: report.title || '',
          description: report.description || '',
          report_type: report.report_type || 'inspection',
          priority: report.priority || 'medium',
          status: report.status || 'pending',
          agent_id: report.agent_id || '',
          farmer_id: report.farmer_id || '',
          scheduled_date: report.scheduled_date ? toDateTimeLocal(report.scheduled_date) : '',
          location: formatLocation(report.location) === '—' ? '' : formatLocation(report.location),
          findings: report.findings || '',
          recommendations: report.recommendations || '',
          notes: report.notes || '',
        },
      });
    } else {
      setForm({ values: { ...emptyForm, agent_id: agents.length === 1 ? agents[0].id : '' } });
    }
  };
  const setValue = (k, v) => setForm((f) => ({ ...f, values: { ...f.values, [k]: v } }));

  const submitForm = async (e) => {
    e.preventDefault();
    const v = form.values;
    if (!v.title.trim() || !v.description.trim() || !v.location.trim() || !v.scheduled_date || !v.agent_id) {
      toast.error('Title, description, agent, scheduled date and location are required');
      return;
    }
    const payload = {
      title: v.title.trim(),
      description: v.description.trim(),
      report_type: v.report_type,
      priority: v.priority,
      agent_id: v.agent_id,
      farmer_id: v.farmer_id || null,
      scheduled_date: new Date(v.scheduled_date).toISOString(),
      location: v.location.trim(),
      findings: v.findings.trim() || null,
      recommendations: v.recommendations.trim() || null,
      notes: v.notes.trim() || null,
    };
    setSaving(true);
    try {
      if (form.id) {
        payload.status = v.status;
        // Record the completion time the first time a report is marked completed.
        if (v.status === 'completed' && !form.completedDate) payload.completed_date = new Date().toISOString();
        await updateReport(form.id, payload);
        toast.success('Report updated');
      } else {
        await createReport(payload);
        toast.success('Report created');
      }
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (report, status) => {
    setStatusSaving(true);
    try {
      const payload = { status };
      if (status === 'completed' && !report.completed_date) payload.completed_date = new Date().toISOString();
      const updated = await updateReport(report.id, payload);
      setView((cur) => (cur ? { ...cur, ...updated } : cur));
      toast.success(`Report marked ${label(status).toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStatusSaving(false);
    }
  };

  const remove = async (report) => {
    const ok = await confirm(`Delete report “${report.title}”? This cannot be undone.`, { title: 'Delete report', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteReport(report.id);
      toast.success('Report deleted');
      if (reports.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReports({
        format: 'csv',
        report_type: filters.report_type,
        status: filters.status,
        agent_id: filters.agent_id,
        from: filters.date_from,
        to: filters.date_to,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const byStatus = stats?.byStatus || {};
  const byPriority = stats?.byPriority || {};
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Page>
      <PageHeader
        icon={FileText}
        title="Field reports"
        subtitle="Inspections, audits and assessments logged by field agents"
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button variant="secondary" icon={Download} onClick={handleExport} loading={exporting}>Export CSV</Button>
            <Button icon={Plus} onClick={() => openForm(null)}>New report</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Total reports" value={stats ? stats.total ?? 0 : '—'} icon={FileText} />
        <StatCard label="Pending" value={stats ? byStatus.pending || 0 : '—'} icon={Clock} tone="amber" />
        <StatCard label="In progress" value={stats ? byStatus.in_progress || 0 : '—'} icon={Loader} tone="blue" />
        <StatCard
          label="Completed"
          value={stats ? byStatus.completed || 0 : '—'}
          hint={stats ? `${(byPriority.high || 0) + (byPriority.urgent || 0)} high/urgent priority overall` : undefined}
          icon={CheckCircle2}
        />
      </StatGrid>

      <Card padded={false}>
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <select className={inputClass} value={filters.report_type} onChange={(e) => setFilter('report_type', e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
          </select>
          <select className={inputClass} value={filters.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <select className={inputClass} value={filters.agent_id} onChange={(e) => setFilter('agent_id', e.target.value)} aria-label="Filter by agent">
            <option value="">All agents</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name || a.email}</option>)}
          </select>
          <input type="date" className={inputClass} value={filters.date_from} onChange={(e) => setFilter('date_from', e.target.value)} aria-label="Scheduled from" title="Scheduled from" />
          <input type="date" className={inputClass} value={filters.date_to} onChange={(e) => setFilter('date_to', e.target.value)} aria-label="Scheduled to" title="Scheduled to" />
          <Button variant="secondary" onClick={() => { setFilters(emptyFilters); setPage(1); }} disabled={!hasFilters}>Clear filters</Button>
        </div>

        {loading ? (
          <Spinner label="Loading reports…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasFilters ? 'No reports match these filters' : 'No reports yet'}
            description={hasFilters ? 'Try clearing the filters.' : 'Reports created by agents (or by you) appear here.'}
            action={!hasFilters && <Button icon={Plus} onClick={() => openForm(null)}>New report</Button>}
          />
        ) : (
          <>
            <Table head={['Title', 'Type', 'Status', 'Priority', 'Agent', 'Location', 'Scheduled', 'Actions']}>
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td className="max-w-[16rem]">
                    <button type="button" onClick={() => setView(r)} className="block max-w-full truncate text-left font-medium text-slate-900 hover:text-brand-700">
                      {r.title}
                    </button>
                  </Td>
                  <Td>{label(r.report_type)}</Td>
                  <Td><Badge tone={STATUS_TONES[r.status]}>{label(r.status)}</Badge></Td>
                  <Td><Badge tone={PRIORITY_TONES[r.priority]}>{label(r.priority)}</Badge></Td>
                  <Td>{agentName(r.agent_id, r.agent)}</Td>
                  <Td className="max-w-[12rem] truncate">{formatLocation(r.location)}</Td>
                  <Td>{formatDate(r.scheduled_date)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} onClick={() => setView(r)} aria-label={`View ${r.title}`} />
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openForm(r)} aria-label={`Edit ${r.title}`} />
                      <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove(r)} aria-label={`Delete ${r.title}`} className="text-rose-600 hover:bg-rose-50" />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {view && (
        <Dialog
          title={view.title}
          subtitle={`${label(view.report_type)} · scheduled ${formatDate(view.scheduled_date, true)}`}
          size="lg"
          onClose={() => setView(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setView(null)}>Close</Button>
              <Button variant="secondary" icon={Pencil} onClick={() => { openForm(view); setView(null); }}>Edit</Button>
            </>
          }
        >
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONES[view.status]}>{label(view.status)}</Badge>
              <Badge tone={PRIORITY_TONES[view.priority]}>{label(view.priority)} priority</Badge>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ['Agent', agentName(view.agent_id, view.agent)],
                ['Farmer', farmerName(view.farmer_id)],
                ['Location', formatLocation(view.location)],
                ['Completed', formatDate(view.completed_date, true)],
                ['Created', formatDate(view.created_at, true)],
                ['Last updated', formatDate(view.updated_at, true)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className="mt-0.5 text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            {[['Description', view.description], ['Findings', view.findings], ['Recommendations', view.recommendations], ['Notes', view.notes]]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">{k}</h3>
                  <p className="mt-1 whitespace-pre-line text-slate-800">{v}</p>
                </div>
              ))}
            {Array.isArray(view.attachments) && view.attachments.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Attachments</h3>
                <ul className="mt-1 list-inside list-disc text-slate-700">
                  {view.attachments.map((a) => <li key={a} className="truncate">{a.split('/').pop()}</li>)}
                </ul>
              </div>
            )}
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-slate-900">Review</h3>
              <div className="flex flex-wrap gap-2">
                {view.status !== 'in_progress' && view.status !== 'completed' && (
                  <Button size="sm" variant="secondary" onClick={() => changeStatus(view, 'in_progress')} disabled={statusSaving}>Mark in progress</Button>
                )}
                {view.status !== 'completed' && (
                  <Button size="sm" icon={CheckCircle2} onClick={() => changeStatus(view, 'completed')} disabled={statusSaving}>Mark completed</Button>
                )}
                {view.status !== 'cancelled' && view.status !== 'completed' && (
                  <Button size="sm" variant="secondary" icon={AlertTriangle} onClick={() => changeStatus(view, 'cancelled')} disabled={statusSaving}>Cancel report</Button>
                )}
                {(view.status === 'completed' || view.status === 'cancelled') && (
                  <Button size="sm" variant="secondary" onClick={() => changeStatus(view, 'pending')} disabled={statusSaving}>Reopen</Button>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {form && (
        <Dialog
          title={form.id ? 'Edit report' : 'New report'}
          size="lg"
          onClose={() => !saving && setForm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="report-form" loading={saving}>{form.id ? 'Save changes' : 'Create report'}</Button>
            </>
          }
        >
          <form id="report-form" onSubmit={submitForm} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" required className="sm:col-span-2">
              <input className={inputClass} value={form.values.title} onChange={(e) => setValue('title', e.target.value)} maxLength={200} required />
            </Field>
            <Field label="Description" required className="sm:col-span-2">
              <textarea className={textareaClass} value={form.values.description} onChange={(e) => setValue('description', e.target.value)} required />
            </Field>
            <Field label="Type" required>
              <select className={inputClass} value={form.values.report_type} onChange={(e) => setValue('report_type', e.target.value)}>
                {REPORT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={inputClass} value={form.values.priority} onChange={(e) => setValue('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
              </select>
            </Field>
            <Field label="Agent" required>
              <select className={inputClass} value={form.values.agent_id} onChange={(e) => setValue('agent_id', e.target.value)} required>
                <option value="">Select agent…</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name || a.email}</option>)}
              </select>
            </Field>
            <Field label="Farmer">
              <select className={inputClass} value={form.values.farmer_id} onChange={(e) => setValue('farmer_id', e.target.value)}>
                <option value="">None</option>
                {form.values.farmer_id && !farmers.some((f) => f.id === form.values.farmer_id) && (
                  <option value={form.values.farmer_id}>Current farmer</option>
                )}
                {farmers.map((f) => <option key={f.id} value={f.id}>{f.full_name || f.email}</option>)}
              </select>
            </Field>
            <Field label="Scheduled date" required>
              <input type="datetime-local" className={inputClass} value={form.values.scheduled_date} onChange={(e) => setValue('scheduled_date', e.target.value)} required />
            </Field>
            <Field label="Location" required>
              <input className={inputClass} value={form.values.location} onChange={(e) => setValue('location', e.target.value)} placeholder="Farm / site location" required />
            </Field>
            {form.id && (
              <Field label="Status">
                <select className={inputClass} value={form.values.status} onChange={(e) => setValue('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                </select>
              </Field>
            )}
            <Field label="Findings" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.values.findings} onChange={(e) => setValue('findings', e.target.value)} />
            </Field>
            <Field label="Recommendations" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.values.recommendations} onChange={(e) => setValue('recommendations', e.target.value)} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.values.notes} onChange={(e) => setValue('notes', e.target.value)} />
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default Reports;
