import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Eye, Play, CheckCircle2, XCircle, CalendarClock, RefreshCw, Inbox, Clock, ListChecks, Hand } from 'lucide-react';
import {
  listServiceRequestsForAgentPage,
  listServiceRequestsByType,
  getServiceRequest,
  startServiceRequest,
  completeServiceRequestByType,
  cancelServiceRequest,
  scheduleEvaluationVisit,
  rescheduleEvaluationVisit,
} from '../../services/serviceRequestsService';
import { listFarmers } from '../../services/usersService';
import { claimServiceRequest } from '../../services/serviceRequestsService';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { SERVICE_TYPES, typeLabel, STATUSES, statusMeta, PRIORITY_TONES, uiType, formatDate } from '../Admin/serviceRequests/helpers';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

// UI type key -> backend service_type value used by /service-requests/agent/:id?service_type=
const BACKEND_TYPE = { property_evaluation: 'other' };
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1).replace(/_/g, ' ') : '—');
const myId = () => localStorage.getItem('id');

const locationText = (loc) => {
  if (!loc || typeof loc !== 'object') return '—';
  return [loc.farm_name, loc.sector, loc.district].filter(Boolean).join(', ') || loc.province || '—';
};

// Fields the backend accepts on each type's complete-* endpoint (dash-api serviceRequests.ts)
const COMPLETE_FIELDS = {
  harvest: [
    { key: 'actual_workers_used', label: 'Workers used', type: 'number' },
    { key: 'actual_harvest_amount', label: 'Harvested amount (kg)', type: 'number' },
    { key: 'harvest_quality_notes', label: 'Quality notes', type: 'textarea' },
  ],
  harvesting_plan: [{ key: 'actual_yield', label: 'Actual yield (kg)', type: 'number' }],
  ipm_routine: [{ key: 'treatment_outcome', label: 'Treatment outcome', type: 'textarea' }],
  pest_control: [{ key: 'treatment_applied', label: 'Treatment applied', type: 'textarea' }],
  property_evaluation: [
    { key: 'evaluation_report', label: 'Evaluation report', type: 'textarea', required: true },
    { key: 'follow_up_date', label: 'Follow-up date (optional)', type: 'date' },
  ],
};

// Actions an assigned agent may take (mirrors backend guards)
const agentActions = (r, me) => {
  const mine = r.agent_id && r.agent_id === me;
  const s = r.status;
  return {
    start: mine && (s === 'approved' || s === 'assigned'),
    complete: mine && s === 'in_progress',
    visit: mine && r.service_type === 'other' && ['approved', 'assigned', 'in_progress'].includes(s),
    cancel: mine && !['completed', 'cancelled', 'rejected'].includes(s),
  };
};

// Flatten a details JSON object into [label, value] rows (primitives and primitive arrays only)
const detailRows = (obj) =>
  obj && typeof obj === 'object'
    ? Object.entries(obj).flatMap(([k, v]) => {
        if (Array.isArray(v)) return v.length && v.every((x) => typeof x !== 'object') ? [[k, v.join(', ')]] : [];
        if (v === null || v === undefined || v === '' || typeof v === 'object') return [];
        return [[k, v]];
      })
    : [];

const Item = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 break-words text-sm text-slate-900">{children || '—'}</dd>
  </div>
);

export default function ServiceHistory() {
  const toast = useToast();
  const me = myId();

  const [tab, setTab] = useState('mine');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({});
  const [farmerNames, setFarmerNames] = useState({});

  const [detail, setDetail] = useState(null); // { loading, request }
  const [action, setAction] = useState(null); // { kind, request, values }
  const [busy, setBusy] = useState(false);

  const confirmDialog = useConfirm();
  const [claimingId, setClaimingId] = useState(null);
  const claim = async (r) => {
    const ok = await confirmDialog(`Take on ${r.request_number || 'this request'} for ${farmerName(r)}? It will be assigned to you and the farmer will be notified.`, { confirmLabel: 'Claim request', danger: false });
    if (!ok) return;
    setClaimingId(r.id);
    try {
      await claimServiceRequest(r.id);
      toast.success('Request claimed — it is now in “Assigned to me”');
      load();
    } catch (e) {
      toast.error(e.message);
      load();
    } finally {
      setClaimingId(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'mine') {
        const res = await listServiceRequestsForAgentPage(me, {
          page, limit: 15, status, service_type: type ? BACKEND_TYPE[type] || type : '',
        });
        setRows(res.data);
        setPagination(res.pagination);
      } else {
        // Unassigned pool: each type list returns assigned + unassigned for agents; keep agent_id === null
        const types = type ? [type] : SERVICE_TYPES.map((t) => t.id);
        const lists = await Promise.all(types.map((t) => listServiceRequestsByType(t, { limit: 100, status })));
        const open = lists
          .flatMap((l) => l.data)
          .filter((r) => !r.agent_id && !['completed', 'cancelled', 'rejected'].includes(r.status))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRows(open);
        setPagination({ page: 1, totalPages: 1, total: open.length });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, page, status, type, me]);

  const loadCounts = useCallback(async () => {
    try {
      const entries = await Promise.all(
        ['assigned', 'approved', 'in_progress', 'completed'].map(async (s) => [
          s,
          (await listServiceRequestsForAgentPage(me, { status: s, limit: 1 })).pagination.total || 0,
        ])
      );
      setCounts(Object.fromEntries(entries));
    } catch {
      setCounts({});
    }
  }, [me]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => {
    listFarmers({ limit: 100 })
      .then((res) => setFarmerNames(Object.fromEntries((res?.data || []).map((f) => [f.id, f.full_name]))))
      .catch(() => setFarmerNames({}));
  }, []);

  const refresh = () => { load(); loadCounts(); };
  const farmerName = (r) => r.farmer?.full_name || farmerNames[r.farmer_id] || r.farmer_info?.name || '—';

  const openDetail = async (r) => {
    setDetail({ loading: true, request: r });
    try {
      setDetail({ loading: false, request: await getServiceRequest(r.id) });
    } catch (err) {
      toast.error(err.message);
      setDetail(null);
    }
  };

  const openAction = (kind, request) => {
    let values = {};
    if (kind === 'complete') values = { completion_notes: '', follow_up_required: false };
    if (kind === 'visit') {
      const v = request.visit_details || {};
      values = v.visit_date
        ? { reschedule: true, new_visit_date: '', new_visit_time: v.visit_time || '09:00', reason: '' }
        : { visit_date: '', visit_time: '09:00', estimated_duration: '', preparation_notes: '', farmer_instructions: '' };
    }
    setAction({ kind, request, values });
  };
  const setVal = (k, v) => setAction((a) => ({ ...a, values: { ...a.values, [k]: v } }));

  const submitAction = async (e) => {
    e.preventDefault();
    const { kind, request, values } = action;
    const t = uiType(request.service_type);
    setBusy(true);
    try {
      if (kind === 'start') {
        await startServiceRequest(request.id, values.start_notes ? { start_notes: values.start_notes.trim() } : {});
        toast.success('Request started');
      } else if (kind === 'complete') {
        const body = {};
        Object.entries(values).forEach(([k, v]) => {
          if (k === 'follow_up_required') return;
          if (v !== '' && v !== null && v !== undefined) body[k] = typeof v === 'string' ? v.trim() : v;
        });
        if (t === 'property_evaluation') {
          if (!body.evaluation_report) throw new Error('Evaluation report is required');
          body.follow_up_required = !!values.follow_up_required;
        }
        if (body.actual_workers_used) body.actual_workers_used = Number(body.actual_workers_used);
        await completeServiceRequestByType(request.id, t, body);
        toast.success('Request marked as completed');
      } else if (kind === 'cancel') {
        if (!values.reason?.trim()) throw new Error('Please give a reason for cancelling');
        await cancelServiceRequest(request.id, values.reason.trim());
        toast.success('Request cancelled');
      } else if (kind === 'visit') {
        if (values.reschedule) {
          if (!values.new_visit_date || !values.reason?.trim()) throw new Error('New date and reason are required');
          await rescheduleEvaluationVisit(request.id, { new_visit_date: values.new_visit_date, new_visit_time: values.new_visit_time, reason: values.reason.trim() });
          toast.success('Visit rescheduled');
        } else {
          if (!values.visit_date || !values.visit_time) throw new Error('Visit date and time are required');
          await scheduleEvaluationVisit(request.id, values);
          toast.success('Visit scheduled — the farmer has been notified');
        }
      }
      setAction(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const tabs = useMemo(() => [
    { id: 'mine', label: 'Assigned to me', icon: ListChecks },
    { id: 'pool', label: 'Unassigned', icon: Inbox },
  ], []);

  const actionTitle = action && {
    start: 'Start request',
    complete: 'Complete request',
    cancel: 'Cancel request',
    visit: action.values.reschedule ? 'Reschedule evaluation visit' : 'Schedule evaluation visit',
  }[action.kind];

  return (
    <Page>
      <PageHeader
        icon={ClipboardList}
        title="Service requests"
        subtitle="Requests assigned to you — start them, record the outcome and complete them."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={refresh}>Refresh</Button>}
      />

      <StatGrid>
        <StatCard label="Waiting to start" value={(counts.assigned || 0) + (counts.approved || 0)} icon={Clock} tone="amber" />
        <StatCard label="In progress" value={counts.in_progress ?? 0} icon={Play} tone="blue" />
        <StatCard label="Completed" value={counts.completed ?? 0} icon={CheckCircle2} />
        <StatCard label="Total assigned" value={tab === 'mine' && !status && !type ? pagination.total ?? 0 : '—'} icon={ClipboardList} tone="slate" hint={tab === 'mine' && !status && !type ? undefined : 'Clear filters to see total'} />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs tabs={tabs} value={tab} onChange={(v) => { setTab(v); setPage(1); }} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select aria-label="Filter by type" className={inputClass} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              {SERVICE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select aria-label="Filter by status" className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {tab === 'pool' && (
          <p className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
            Open requests not yet assigned to an agent. Claim one to take it on — it then moves to “Assigned to me”.
          </p>
        )}

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={tab === 'mine' ? 'No requests assigned to you' : 'No unassigned requests'}
            description={status || type ? 'Try clearing the filters.' : tab === 'mine' ? 'When an administrator assigns you a request it will show up here.' : 'Everything has been assigned.'}
          />
        ) : (
          <>
            <Table head={['Request', 'Type', 'Farmer', 'Status', 'Priority', 'Date', '']}>
              {rows.map((r) => {
                const st = statusMeta(r.status);
                const can = agentActions(r, me);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-900">{r.request_number || r.id.slice(0, 8)}</Td>
                    <Td>{typeLabel(uiType(r.service_type))}</Td>
                    <Td>
                      <div className="text-slate-900">{farmerName(r)}</div>
                      <div className="text-xs text-slate-500">{locationText(r.location)}</div>
                    </Td>
                    <Td><Badge tone={st.tone}>{st.label}</Badge></Td>
                    <Td><Badge tone={PRIORITY_TONES[r.priority] || 'slate'}>{cap(r.priority)}</Badge></Td>
                    <Td>{formatDate(r.scheduled_date || r.requested_date || r.created_at)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={Eye} onClick={() => openDetail(r)} aria-label={`View ${r.request_number}`} title="View details" />
                        {tab === 'pool' && !r.agent_id && ['pending', 'approved'].includes(r.status) && (
                          <Button size="sm" icon={Hand} loading={claimingId === r.id} onClick={() => claim(r)}>Claim</Button>
                        )}
                        {can.start && <Button size="sm" variant="secondary" icon={Play} onClick={() => openAction('start', r)}>Start</Button>}
                        {can.complete && <Button size="sm" icon={CheckCircle2} onClick={() => openAction('complete', r)}>Complete</Button>}
                        {can.visit && <Button size="sm" variant="secondary" icon={CalendarClock} onClick={() => openAction('visit', r)}>{r.visit_details?.visit_date ? 'Reschedule' : 'Schedule visit'}</Button>}
                        {can.cancel && <Button size="sm" variant="ghost" icon={XCircle} onClick={() => openAction('cancel', r)} aria-label={`Cancel ${r.request_number}`} title="Cancel request" />}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </Table>
            {tab === 'mine' && (
              <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
            )}
          </>
        )}
      </Card>

      {detail && (
        <Dialog title={detail.request.request_number || 'Service request'} subtitle={typeLabel(uiType(detail.request.service_type))} onClose={() => setDetail(null)} size="lg"
          footer={<Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>}>
          {detail.loading ? <Spinner /> : <RequestDetail r={detail.request} farmerName={farmerName(detail.request)} />}
        </Dialog>
      )}

      {action && (
        <Dialog
          title={actionTitle}
          subtitle={`${action.request.request_number} · ${farmerName(action.request)}`}
          onClose={() => !busy && setAction(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAction(null)} disabled={busy}>Close</Button>
              <Button type="submit" form="sr-action-form" loading={busy} variant={action.kind === 'cancel' ? 'danger' : 'primary'}>
                {action.kind === 'start' ? 'Start' : action.kind === 'complete' ? 'Mark completed' : action.kind === 'cancel' ? 'Cancel request' : 'Save'}
              </Button>
            </>
          }
        >
          <form id="sr-action-form" onSubmit={submitAction} className="space-y-3">
            {action.kind === 'start' && (
              <Field label="Start notes (optional)">
                <textarea className={textareaClass} value={action.values.start_notes || ''} onChange={(e) => setVal('start_notes', e.target.value)} placeholder="e.g. Arrived on site with 3 workers" />
              </Field>
            )}
            {action.kind === 'complete' && (
              <>
                {(COMPLETE_FIELDS[uiType(action.request.service_type)] || []).map((f) => (
                  <Field key={f.key} label={f.label} required={f.required}>
                    {f.type === 'textarea' ? (
                      <textarea className={textareaClass} value={action.values[f.key] || ''} onChange={(e) => setVal(f.key, e.target.value)} required={f.required} />
                    ) : (
                      <input type={f.type} min={f.type === 'number' ? 0 : undefined} className={inputClass} value={action.values[f.key] || ''} onChange={(e) => setVal(f.key, e.target.value)} />
                    )}
                  </Field>
                ))}
                {uiType(action.request.service_type) === 'property_evaluation' && (
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={!!action.values.follow_up_required} onChange={(e) => setVal('follow_up_required', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                    Follow-up visit required
                  </label>
                )}
                <Field label="Completion notes">
                  <textarea className={textareaClass} value={action.values.completion_notes || ''} onChange={(e) => setVal('completion_notes', e.target.value)} />
                </Field>
              </>
            )}
            {action.kind === 'cancel' && (
              <Field label="Reason" required>
                <textarea className={textareaClass} value={action.values.reason || ''} onChange={(e) => setVal('reason', e.target.value)} required />
              </Field>
            )}
            {action.kind === 'visit' && (action.values.reschedule ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="New date" required><input type="date" className={inputClass} value={action.values.new_visit_date} onChange={(e) => setVal('new_visit_date', e.target.value)} required /></Field>
                <Field label="New time"><input type="time" className={inputClass} value={action.values.new_visit_time} onChange={(e) => setVal('new_visit_time', e.target.value)} /></Field>
                <Field label="Reason" required className="sm:col-span-2"><textarea className={textareaClass} value={action.values.reason} onChange={(e) => setVal('reason', e.target.value)} required /></Field>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Visit date" required><input type="date" className={inputClass} value={action.values.visit_date} onChange={(e) => setVal('visit_date', e.target.value)} required /></Field>
                <Field label="Visit time" required><input type="time" className={inputClass} value={action.values.visit_time} onChange={(e) => setVal('visit_time', e.target.value)} required /></Field>
                <Field label="Estimated duration" className="sm:col-span-2"><input className={inputClass} value={action.values.estimated_duration} onChange={(e) => setVal('estimated_duration', e.target.value)} placeholder="e.g. 2 hours" /></Field>
                <Field label="Preparation notes" className="sm:col-span-2"><textarea className={textareaClass} value={action.values.preparation_notes} onChange={(e) => setVal('preparation_notes', e.target.value)} /></Field>
                <Field label="Instructions for the farmer" className="sm:col-span-2"><textarea className={textareaClass} value={action.values.farmer_instructions} onChange={(e) => setVal('farmer_instructions', e.target.value)} /></Field>
              </div>
            ))}
          </form>
        </Dialog>
      )}
    </Page>
  );
}

function RequestDetail({ r, farmerName }) {
  const details = r.harvest_details || r.harvesting_plan_details || r.ipm_routine_details || r.pest_management_details;
  const st = statusMeta(r.status);
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Item label="Status"><Badge tone={st.tone}>{st.label}</Badge></Item>
        <Item label="Priority">{cap(r.priority)}</Item>
        <Item label="Farmer">{farmerName}{r.farmer?.phone ? ` · ${r.farmer.phone}` : ''}</Item>
        <Item label="Location">{locationText(r.location)}</Item>
        <Item label="Requested">{formatDate(r.requested_date || r.created_at)}</Item>
        <Item label="Scheduled">{formatDate(r.scheduled_date)}</Item>
        {r.due_date && <Item label="Due">{formatDate(r.due_date)}</Item>}
        {r.visit_details?.visit_date && <Item label="Evaluation visit">{`${formatDate(r.visit_details.visit_date)} ${r.visit_details.visit_time || ''}`}</Item>}
      </dl>
      {r.description && <p className="text-sm text-slate-700">{r.description}</p>}
      {detailRows(details).length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Request details</h3>
          <dl className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
            {detailRows(details).map(([k, v]) => (
              <Item key={k} label={cap(k)}>{/date/i.test(k) ? formatDate(v) : String(v)}</Item>
            ))}
          </dl>
        </div>
      )}
      {(r.notes || r.start_notes || r.completion_notes) && (
        <dl className="grid grid-cols-1 gap-3">
          {r.notes && <Item label="Notes">{r.notes}</Item>}
          {r.start_notes && <Item label="Start notes">{r.start_notes}</Item>}
          {r.completion_notes && <Item label="Completion notes">{r.completion_notes}</Item>}
        </dl>
      )}
    </div>
  );
}
