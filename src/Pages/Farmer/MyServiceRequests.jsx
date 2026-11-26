import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw, Eye, XCircle, Pencil, Star, CalendarCheck, Bug, MapPin } from 'lucide-react';
import {
  listServiceRequestsForFarmerPage,
  getServiceRequest,
  cancelServiceRequest,
  submitServiceRequestFeedback,
} from '../../services/serviceRequestsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs } from '../../components/Ui/kit';
import { serviceTypeLabel, requestStatusMeta, REQUEST_STATUSES, formatDate, formatLocation, currentUserId, rwf, errMsg } from './farmerShared';

const TYPE_TABS = [
  { id: '', label: 'All' },
  { id: 'harvest', label: 'Harvesting' },
  { id: 'pest_control', label: 'Pest management' },
  { id: 'other', label: 'Property evaluation' },
  { id: 'harvesting_plan', label: 'Harvest plans' },
  { id: 'ipm_routine', label: 'IPM routines' },
];

const PAGE_SIZE = 10;

const scheduleOf = (r) => {
  const h = r.harvest_details || {};
  const d = r.pest_management_details || {};
  if (r.scheduled_date) return formatDate(r.scheduled_date);
  if (h.harvest_date_from) return `${formatDate(h.harvest_date_from)} – ${formatDate(h.harvest_date_to)}`;
  if (d.visit_start_date) return `${formatDate(d.visit_start_date)} – ${formatDate(d.visit_end_date)}`;
  return '—';
};

const Detail = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900">{children || '—'}</dd>
  </div>
);

const isImage = (url) => typeof url === 'string' && /^https?:\/\//.test(url) && !/\.pdf($|\?)/i.test(url);

function RequestDetails({ r }) {
  const h = r.harvest_details || {};
  const d = r.pest_management_details || {};
  const pd = d.property_details || {};
  const photos = [...(Array.isArray(r.attachments) ? r.attachments : []), ...(Array.isArray(h.harvest_images) ? h.harvest_images : [])].filter(isImage);
  const status = requestStatusMeta(r.status);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={status.tone}>{status.label}</Badge>
        <Badge>{serviceTypeLabel(r.service_type)}</Badge>
        {r.priority && <Badge tone={r.priority === 'urgent' || r.priority === 'high' ? 'rose' : 'slate'}>Priority: {r.priority}</Badge>}
      </div>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Detail label="Reference">{r.request_number}</Detail>
        <Detail label="Submitted">{formatDate(r.created_at || r.requested_date, true)}</Detail>
        <Detail label="Schedule">{scheduleOf(r)}</Detail>
        <Detail label="Location">{formatLocation(r.location)}</Detail>
        {r.agent && <Detail label="Agent">{[r.agent.full_name, r.agent.phone].filter(Boolean).join(' · ')}</Detail>}
        {r.cost_estimate != null && <Detail label="Cost estimate">{rwf(r.cost_estimate)}</Detail>}
        {r.service_type === 'harvest' && (
          <>
            <Detail label="Trees to harvest">{h.trees_to_harvest}</Detail>
            <Detail label="Workers needed">{h.workers_needed}</Detail>
            <Detail label="Equipment">{(h.equipment_needed || []).join(', ')}</Detail>
          </>
        )}
        {r.service_type === 'pest_control' && (
          <>
            <Detail label="Issues">{(d.pests_diseases || []).map((p) => p.name).join(', ')}</Detail>
            <Detail label="Severity">{d.severity_level}</Detail>
            <Detail label="First noticed">{d.first_noticed}</Detail>
            <Detail label="Control methods tried">{d.control_methods_tried}</Detail>
          </>
        )}
        {r.service_type === 'other' && (
          <>
            <Detail label="Irrigation upgrade">{d.irrigation_source}{d.irrigation_timing ? ` (${d.irrigation_timing})` : ''}</Detail>
            <Detail label="Soil testing done">{d.soil_testing}</Detail>
            <Detail label="Certified valuation">{d.certified_valuation_requested ? `Yes — ${d.evaluation_purpose || ''}` : 'No'}</Detail>
            <Detail label="Farm size">{pd.farm_size ? `${pd.farm_size} ha` : null}</Detail>
          </>
        )}
      </dl>
      {r.description && <Detail label="Description">{r.description}</Detail>}
      {r.notes && <Detail label="Notes">{r.notes}</Detail>}
      {photos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Photos</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((src) => (
              <a key={src} href={src} target="_blank" rel="noreferrer" className="h-20 w-20 overflow-hidden rounded-lg ring-1 ring-slate-200">
                <img src={src} alt="Request attachment" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      {r.feedback && (
        <Detail label="Your feedback">
          {'★'.repeat(r.feedback.rating || 0)}{'☆'.repeat(5 - (r.feedback.rating || 0))} {r.feedback.comment}
        </Detail>
      )}
    </div>
  );
}

export default function MyServiceRequests() {
  const toast = useToast();
  const confirm = useConfirm();
  const farmerId = currentUserId();

  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [viewing, setViewing] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const load = useCallback(async () => {
    if (!farmerId) {
      setError('Your session is missing — please sign in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await listServiceRequestsForFarmerPage(farmerId, { page, limit: PAGE_SIZE, service_type: type || undefined, status: status || undefined });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Failed to load your requests'));
    } finally {
      setLoading(false);
    }
  }, [farmerId, page, type, status]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (r) => {
    setViewing(r);
    setViewLoading(true);
    try {
      setViewing(await getServiceRequest(r.id));
    } catch (e) {
      toast.error(errMsg(e, 'Could not load full details'));
    } finally {
      setViewLoading(false);
    }
  };

  const cancel = async (r) => {
    const ok = await confirm(`Cancel ${serviceTypeLabel(r.service_type).toLowerCase()} request ${r.request_number}? This cannot be undone.`, {
      title: 'Cancel request',
      confirmLabel: 'Cancel request',
    });
    if (!ok) return;
    setBusyId(r.id);
    try {
      await cancelServiceRequest(r.id, 'Cancelled by farmer');
      toast.success('Request cancelled');
      setViewing(null);
      await load();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to cancel request'));
    } finally {
      setBusyId(null);
    }
  };

  const sendFeedback = async () => {
    setSendingFeedback(true);
    try {
      await submitServiceRequestFeedback(feedbackFor.id, { rating: Number(feedback.rating), comment: feedback.comment.trim() });
      toast.success('Thank you for your feedback');
      setFeedbackFor(null);
      await load();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to send feedback'));
    } finally {
      setSendingFeedback(false);
    }
  };

  const actionsFor = (r) => (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => open(r)} aria-label={`View ${r.request_number}`} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
        <Eye className="h-4 w-4" />
      </button>
      {r.status === 'pending' && r.service_type === 'other' && (
        <Link to={`/dashboard/farmer/PropertyEvaluation?edit=${r.id}`} aria-label={`Edit ${r.request_number}`} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
          <Pencil className="h-4 w-4" />
        </Link>
      )}
      {r.status === 'pending' && (
        <button type="button" onClick={() => cancel(r)} disabled={busyId === r.id} aria-label={`Cancel ${r.request_number}`} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40">
          <XCircle className="h-4 w-4" />
        </button>
      )}
      {r.status === 'completed' && !r.feedback && (
        <Button size="sm" variant="secondary" icon={Star} onClick={() => { setFeedback({ rating: 5, comment: '' }); setFeedbackFor(r); }}>
          Rate
        </Button>
      )}
    </div>
  );

  return (
    <Page>
      <PageHeader
        icon={ClipboardList}
        title="My Requests"
        subtitle="Track your harvesting, pest management and property evaluation requests."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { to: '/dashboard/farmer/HarvestingDay', icon: CalendarCheck, label: 'Book harvesting day' },
          { to: '/dashboard/farmer/PestManagement', icon: Bug, label: 'Book IPM day' },
          { to: '/dashboard/farmer/PropertyEvaluation', icon: MapPin, label: 'Book property evaluation' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm hover:border-brand-300 hover:bg-brand-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Icon className="h-5 w-5" /></span>
            {label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={TYPE_TABS} value={type} onChange={(v) => { setType(v); setPage(1); }} />
        <select className={`${inputClass} lg:w-56`} aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {REQUEST_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card padded={false}>
        {loading ? (
          <Spinner label="Loading requests…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No requests yet" description={type || status ? 'No requests match these filters.' : 'Book a service above and it will appear here.'} />
        ) : (
          <>
            <Table head={['Reference', 'Service', 'Submitted', 'Schedule', 'Status', '']}>
              {rows.map((r) => {
                const s = requestStatusMeta(r.status);
                return (
                  <tr key={r.id}>
                    <Td className="font-mono text-xs">{r.request_number}</Td>
                    <Td>{serviceTypeLabel(r.service_type)}</Td>
                    <Td>{formatDate(r.created_at || r.requested_date)}</Td>
                    <Td>{scheduleOf(r)}</Td>
                    <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                    <Td>{actionsFor(r)}</Td>
                  </tr>
                );
              })}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      <Dialog
        open={Boolean(viewing)}
        title={viewing ? serviceTypeLabel(viewing.service_type) : ''}
        subtitle={viewing?.title}
        size="lg"
        onClose={() => setViewing(null)}
        footer={
          viewing?.status === 'pending' && (
            <Button variant="danger" icon={XCircle} loading={busyId === viewing.id} onClick={() => cancel(viewing)}>Cancel request</Button>
          )
        }
      >
        {viewing && (viewLoading && !viewing.service_type ? <Spinner /> : <RequestDetails r={viewing} />)}
      </Dialog>

      <Dialog
        open={Boolean(feedbackFor)}
        title="Rate this service"
        subtitle={feedbackFor?.request_number}
        onClose={() => !sendingFeedback && setFeedbackFor(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFeedbackFor(null)} disabled={sendingFeedback}>Cancel</Button>
            <Button onClick={sendFeedback} loading={sendingFeedback}>Send feedback</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Rating</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={feedback.rating === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setFeedback((f) => ({ ...f, rating: n }))}
                  className={n <= feedback.rating ? 'text-amber-500' : 'text-slate-300'}
                >
                  <Star className="h-7 w-7" fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <Field label="Comment">
            <textarea className={textareaClass} maxLength={1000} value={feedback.comment} onChange={(e) => setFeedback((f) => ({ ...f, comment: e.target.value }))} />
          </Field>
        </div>
      </Dialog>
    </Page>
  );
}
