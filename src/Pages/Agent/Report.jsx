import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Plus, RefreshCw, Download, Eye, Pencil, Search, Clock, Play, CheckCircle2, ClipboardList, Paperclip } from 'lucide-react';
import {
  listReportsPage, getReportStatistics, getReport, createReport, updateReport, uploadReportAttachments, downloadReportAttachment, exportReports,
} from '../../services/reportsService';
import { listFarmers } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

// Attachment limits mirror the API (reports.ts attachmentUpload): 5 files per upload, 5 MB each, 20 per report
const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 20;
// Stored keys look like "private/reports/<id>/<ts>-<rand>-<original name>"
const attachmentName = (key) => key.split('/').pop().replace(/^\d+-[0-9a-f]+-/, '');

const REPORT_TYPES = ['inspection', 'audit', 'assessment', 'survey', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUS_TONE = { pending: 'amber', in_progress: 'blue', completed: 'brand', cancelled: 'rose' };
const PRIORITY_TONE = { low: 'slate', medium: 'blue', high: 'amber', urgent: 'rose' };
const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const label = (s) => (s ? s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') : '—');
const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
// The API stores location as JSON: older rows hold a plain string, newer ones may hold {address, lat, lng}
const locationText = (loc) => (typeof loc === 'string' ? loc : loc?.address || '—');
const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  title: '', description: '', report_type: 'inspection', priority: 'medium', status: 'pending',
  farmer_id: '', scheduled_date: today(), location: '', findings: '', recommendations: '', notes: '',
});

export default function Report() {
  const toast = useToast();
  const myId = localStorage.getItem('id');

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);

  const [form, setForm] = useState(null); // { id?, ...values }
  const [viewing, setViewing] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listReportsPage({ status, report_type: type, page, limit: 15 });
      setReports(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, type, page]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getReportStatistics());
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    listFarmers({ limit: 100 })
      .then((res) => setFarmers(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setFarmers([]));
  }, []);

  const refresh = () => Promise.all([load(), loadStats()]);
  const farmerName = useCallback((id) => farmers.find((f) => f.id === id)?.full_name, [farmers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((r) => [r.title, r.description, locationText(r.location), farmerName(r.farmer_id)].some((x) => (x || '').toLowerCase().includes(term)));
  }, [reports, search, farmerName]);

  const openEdit = (r) => setForm({
    id: r.id,
    title: r.title || '',
    description: r.description || '',
    report_type: r.report_type || 'inspection',
    priority: r.priority || 'medium',
    status: r.status || 'pending',
    farmer_id: r.farmer_id || '',
    scheduled_date: r.scheduled_date ? r.scheduled_date.slice(0, 10) : today(),
    location: locationText(r.location) === '—' ? '' : locationText(r.location),
    findings: r.findings || '',
    recommendations: r.recommendations || '',
    notes: r.notes || '',
    wasCompleted: r.status === 'completed',
  });

  const submit = async (e) => {
    e.preventDefault();
    const v = form;
    if (!v.title.trim()) return toast.error('Title is required');
    if (!v.description.trim()) return toast.error('Description is required');
    if (!v.location.trim()) return toast.error('Location is required');
    if (!v.scheduled_date) return toast.error('Date is required');
    const payload = {
      title: v.title.trim(),
      description: v.description.trim(),
      report_type: v.report_type,
      priority: v.priority,
      scheduled_date: new Date(v.scheduled_date).toISOString(),
      location: v.location.trim(),
      findings: v.findings.trim() || null,
      recommendations: v.recommendations.trim() || null,
      notes: v.notes.trim() || null,
      farmer_id: v.farmer_id || null,
    };
    setBusy(true);
    try {
      if (v.id) {
        payload.status = v.status;
        if (v.status === 'completed' && !v.wasCompleted) payload.completed_date = new Date().toISOString();
        await updateReport(v.id, payload);
        toast.success('Report updated');
      } else {
        await createReport(payload);
        toast.success('Report submitted');
        setPage(1);
      }
      setForm(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const view = async (r) => {
    setRowBusy(r.id);
    try {
      setViewing(await getReport(r.id));
      setFiles([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRowBusy(null);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return toast.error('Choose at least one file');
    if (files.length > 5) return toast.error('Upload at most 5 files at a time');
    if ((viewing.attachments?.length || 0) + files.length > MAX_ATTACHMENTS) return toast.error(`A report can have at most ${MAX_ATTACHMENTS} attachments`);
    const bad = files.find((f) => !ATTACHMENT_TYPES.includes(f.type) || f.size > MAX_FILE_BYTES);
    if (bad) return toast.error(`${bad.name}: use a PDF, PNG, JPEG or WEBP file up to 5 MB`);
    setBusy(true);
    try {
      await uploadReportAttachments(viewing.id, files);
      toast.success('Attachments uploaded');
      setViewing(await getReport(viewing.id));
      setFiles([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doExport = async (format) => {
    setExporting(true);
    try {
      // agent_id keeps the export scoped to the signed-in agent's own reports
      await exportReports({ format, status, report_type: type, agent_id: myId });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Page>
      <PageHeader
        icon={FileText}
        title="Reports"
        subtitle="Write up inspections, assessments and surveys from your field work."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>
            <Button variant="secondary" icon={Download} loading={exporting} onClick={() => doExport('csv')}>Export CSV</Button>
            <Button icon={Plus} onClick={() => setForm(emptyForm())}>New report</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Total reports" value={stats?.total ?? '—'} icon={ClipboardList} tone="slate" />
        <StatCard label="Pending" value={stats ? stats.byStatus?.pending || 0 : '—'} icon={Clock} tone="amber" />
        <StatCard label="In progress" value={stats ? stats.byStatus?.in_progress || 0 : '—'} icon={Play} tone="blue" />
        <StatCard label="Completed" value={stats ? stats.byStatus?.completed || 0 : '—'} icon={CheckCircle2} />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs tabs={STATUS_TABS} value={status} onChange={(s) => { setStatus(s); setPage(1); }} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className={`${inputClass} sm:w-44`} aria-label="Filter by type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
            </select>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-9`} placeholder="Search this page…" aria-label="Search reports" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading reports…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={search || status || type ? 'No reports match your filters' : 'No reports yet'}
            description={search || status || type ? 'Try changing the filters.' : 'Submit your first field report.'}
            action={!(search || status || type) && <Button icon={Plus} onClick={() => setForm(emptyForm())}>New report</Button>}
          />
        ) : (
          <>
            <Table head={['Report', 'Type', 'Farmer', 'Date', 'Priority', 'Status', 'Actions']}>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <Td className="max-w-[260px]">
                    <p className="truncate font-medium text-slate-900">{r.title}</p>
                    <p className="truncate text-xs text-slate-500">{locationText(r.location)}</p>
                  </Td>
                  <Td>{label(r.report_type)}</Td>
                  <Td>{r.farmer_id ? farmerName(r.farmer_id) || 'Farmer' : '—'}</Td>
                  <Td>{fmtDate(r.scheduled_date)}</Td>
                  <Td><Badge tone={PRIORITY_TONE[r.priority]}>{label(r.priority)}</Badge></Td>
                  <Td><Badge tone={STATUS_TONE[r.status]}>{label(r.status)}</Badge></Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" icon={Eye} loading={rowBusy === r.id} onClick={() => view(r)}>View</Button>
                      <Button size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(r)}>Edit</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {form && (
        <Dialog
          size="lg"
          title={form.id ? 'Edit report' : 'New report'}
          onClose={() => !busy && setForm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="report-form" loading={busy}>{form.id ? 'Save changes' : 'Submit report'}</Button>
            </>
          }
        >
          <form id="report-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" required className="sm:col-span-2">
              <input className={inputClass} maxLength={200} value={form.title} onChange={set('title')} placeholder="e.g. Quarterly orchard inspection" required />
            </Field>
            <Field label="Type" required>
              <select className={inputClass} value={form.report_type} onChange={set('report_type')}>
                {REPORT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={inputClass} value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
              </select>
            </Field>
            <Field label="Date" required>
              <input type="date" className={inputClass} value={form.scheduled_date} onChange={set('scheduled_date')} required />
            </Field>
            {form.id ? (
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={set('status')}>
                  {STATUS_TABS.slice(1).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
            ) : (
              <div className="hidden sm:block" />
            )}
            <Field label="Farmer" hint="Optional — link the report to a farmer.">
              <select className={inputClass} value={form.farmer_id} onChange={set('farmer_id')}>
                <option value="">No farmer</option>
                {farmers.map((f) => <option key={f.id} value={f.id}>{f.full_name}{f.district ? ` — ${f.district}` : ''}</option>)}
              </select>
            </Field>
            <Field label="Location" required>
              <input className={inputClass} value={form.location} onChange={set('location')} placeholder="Village, sector, district" required />
            </Field>
            <Field label="Description" required className="sm:col-span-2">
              <textarea className={textareaClass} maxLength={2000} value={form.description} onChange={set('description')} required />
            </Field>
            <Field label="Findings" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.findings} onChange={set('findings')} />
            </Field>
            <Field label="Recommendations" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.recommendations} onChange={set('recommendations')} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.notes} onChange={set('notes')} />
            </Field>
          </form>
        </Dialog>
      )}

      {viewing && (
        <Dialog
          size="lg"
          title={viewing.title}
          subtitle={`${label(viewing.report_type)} · ${fmtDate(viewing.scheduled_date)}`}
          onClose={() => !busy && setViewing(null)}
          footer={<Button variant="secondary" icon={Pencil} onClick={() => { openEdit(viewing); setViewing(null); }}>Edit</Button>}
        >
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge tone={STATUS_TONE[viewing.status]}>{label(viewing.status)}</Badge>
              <Badge tone={PRIORITY_TONE[viewing.priority]}>{label(viewing.priority)} priority</Badge>
            </div>
            <dl className="space-y-3">
              {[
                ['Location', locationText(viewing.location)],
                ['Farmer', viewing.farmer_id ? farmerName(viewing.farmer_id) || viewing.farmer_id : '—'],
                ['Completed', fmtDate(viewing.completed_date)],
                ['Description', viewing.description],
                ['Findings', viewing.findings || '—'],
                ['Recommendations', viewing.recommendations || '—'],
                ['Notes', viewing.notes || '—'],
              ].map(([k, val]) => (
                <div key={k}>
                  <dt className="font-medium text-slate-500">{k}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-slate-900">{val}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="font-medium text-slate-700">Attachments</p>
              {viewing.attachments?.length ? (
                <ul className="space-y-1">
                  {viewing.attachments.map((a, i) => (
                    <li key={a} className="flex items-center justify-between gap-2 text-slate-700">
                      <span className="flex min-w-0 items-center gap-2"><Paperclip className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{attachmentName(a)}</span></span>
                      <Button size="sm" variant="ghost" icon={Download} aria-label={`Download ${attachmentName(a)}`} onClick={() => downloadReportAttachment(viewing.id, i, attachmentName(a)).catch((err) => toast.error(err.message))}>
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No attachments.</p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input type="file" multiple accept="application/pdf,image/png,image/jpeg,image/webp" className={inputClass} aria-label="Choose attachments" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                <Button icon={Paperclip} loading={busy} onClick={uploadFiles}>Upload</Button>
              </div>
              <p className="text-xs text-slate-500">PDF or images, up to 5 files of 5 MB each.</p>
            </div>
          </div>
        </Dialog>
      )}
    </Page>
  );
}
