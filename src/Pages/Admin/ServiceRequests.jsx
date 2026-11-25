import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, RefreshCw, Search, Eye, CheckCircle2, XCircle, UserPlus, Play, CheckSquare, Ban, CalendarClock, Hourglass, AlertTriangle } from 'lucide-react';
import {
  listServiceRequestsByType,
  approveServiceRequestByType,
  completeServiceRequestByType,
  startServiceRequest,
  rejectServiceRequest,
  assignAgentToServiceRequest,
  cancelServiceRequest,
  scheduleEvaluationVisit,
  rescheduleEvaluationVisit,
} from '../../services/serviceRequestsService';
import { listUsersPage, getUser } from '../../services/usersService';
import { createNotification } from '../../services/notificationsService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Tabs, Pagination } from '../../components/Ui/kit';
import { SERVICE_TYPES, STATUSES, PRIORITY_TONES, statusMeta, allowedActions, formatDate, formatLocation } from './serviceRequests/helpers';
import RequestDetailDialog from './serviceRequests/RequestDetailDialog';
import ActionDialog from './serviceRequests/ActionDialog';

const PAGE_SIZE = 15;

const ACTIONS = [
  { id: 'approve', label: 'Approve', icon: CheckCircle2 },
  { id: 'assign', label: 'Assign agent', icon: UserPlus },
  { id: 'reschedule', label: 'Schedule visit', icon: CalendarClock },
  { id: 'start', label: 'Start', icon: Play },
  { id: 'complete', label: 'Complete', icon: CheckSquare },
  { id: 'reject', label: 'Reject', icon: XCircle, danger: true },
  { id: 'cancel', label: 'Cancel', icon: Ban, danger: true },
];

const SUCCESS = {
  approve: 'Request approved',
  assign: 'Agent assigned',
  reschedule: 'Visit scheduled',
  start: 'Request marked in progress',
  complete: 'Request completed',
  reject: 'Request rejected',
  cancel: 'Request cancelled',
};

// The backend does not notify the farmer on approve/reject/start/cancel/schedule, so the page does.
const FARMER_MESSAGES = {
  approve: (r) => `Your request ${r.request_number} has been approved.`,
  reject: (r, v) => `Your request ${r.request_number} was rejected: ${v.notes.trim()}`,
  start: (r) => `Work on your request ${r.request_number} has started.`,
  cancel: (r, v) => `Your request ${r.request_number} has been cancelled${v.notes.trim() ? `: ${v.notes.trim()}` : '.'}`,
};

/** Admin: review and process farmers' service requests (one tab per service type). */
export default function ServiceRequests() {
  const toast = useToast();
  const [type, setType] = useState('harvest');
  const [filters, setFilters] = useState({ status: '', priority: '', escalated: false });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ rows: [], pagination: {} });
  const [counts, setCounts] = useState({});
  const [pendingCounts, setPendingCounts] = useState({});
  const [farmers, setFarmers] = useState({});
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [action, setAction] = useState(null); // { type, request }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listServiceRequestsByType(type, { ...filters, page, limit: PAGE_SIZE });
      setData({ rows: res.data, pagination: res.pagination });
    } catch (e) {
      setError(e.message);
      setData({ rows: [], pagination: {} });
    } finally {
      setLoading(false);
    }
  }, [type, filters, page]);

  // Per-type totals for the current filters (tab badges) and pending totals (stat cards).
  const loadCounts = useCallback(async () => {
    const totals = async (opts) => {
      const entries = await Promise.all(
        SERVICE_TYPES.map((t) =>
          listServiceRequestsByType(t.id, { ...opts, limit: 1 })
            .then((r) => [t.id, r.pagination?.total ?? 0])
            .catch(() => [t.id, undefined])
        )
      );
      return Object.fromEntries(entries);
    };
    const [c, p] = await Promise.all([totals(filters), totals({ status: 'pending' })]);
    setCounts(c);
    setPendingCounts(p);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    listUsersPage('agents', { status: 'active', limit: 100 })
      .then((r) => setAgents(r.data))
      .catch(() => setAgents([]));
  }, []);

  // List rows carry only farmer_id; resolve names for the rows on screen (cached).
  useEffect(() => {
    const missing = [...new Set(data.rows.map((r) => r.farmer_id).filter((id) => id && !(id in farmers)))];
    if (!missing.length) return;
    Promise.all(missing.map((id) => getUser(id).then((u) => [id, u]).catch(() => [id, null]))).then((entries) =>
      setFarmers((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
    );
  }, [data.rows, farmers]);

  // Stable close handlers: the kit Dialog re-focuses its panel whenever onClose changes.
  const closeDetail = useCallback(() => setDetailId(null), []);
  const closeAction = useCallback(() => setAction(null), []);

  const agentName = useCallback((id) => {
    if (!id) return null;
    const a = agents.find((x) => x.id === id);
    return a ? a.full_name || a.email : 'Agent';
  }, [agents]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter((r) => {
      const f = farmers[r.farmer_id];
      return [r.request_number, r.title, f?.full_name, f?.phone, formatLocation(r.location)].some((v) => v && String(v).toLowerCase().includes(q));
    });
  }, [data.rows, search, farmers]);

  const setFilter = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const changeType = (t) => {
    setType(t);
    setPage(1);
  };

  const refresh = () => {
    load();
    loadCounts();
  };

  const notifyFarmer = async (req, kind, values) => {
    const make = FARMER_MESSAGES[kind];
    if (!make || !req.farmer_id) return;
    try {
      await createNotification({ recipient_id: req.farmer_id, title: 'Service request update', message: make(req, values), type: 'info' });
    } catch {
      // Best effort: the status change itself succeeded.
    }
  };

  const runAction = async (values) => {
    const { type: kind, request: req } = action;
    const uiKind = req.service_type === 'other' ? 'property_evaluation' : req.service_type;
    const notes = values.notes.trim();
    try {
      switch (kind) {
        case 'approve': {
          const body = {};
          if (values.scheduled_date) body.scheduled_date = values.scheduled_date;
          if (values.cost_estimate !== '') body.cost_estimate = Number(values.cost_estimate);
          if (notes) body.notes = notes;
          await approveServiceRequestByType(req.id, uiKind, body);
          // Assigning via /assign (not approve's agent_id) notifies the agent and starts the SLA clock.
          if (values.agent_id) await assignAgentToServiceRequest(req.id, { agent_id: values.agent_id, scheduled_date: values.scheduled_date || undefined });
          break;
        }
        case 'assign':
          await assignAgentToServiceRequest(req.id, { agent_id: values.agent_id, scheduled_date: values.scheduled_date || undefined });
          break;
        case 'reject':
          await rejectServiceRequest(req.id, notes);
          break;
        case 'start':
          await startServiceRequest(req.id, notes ? { start_notes: notes } : {});
          break;
        case 'complete':
          await completeServiceRequestByType(req.id, uiKind, notes ? { completion_notes: notes } : {});
          break;
        case 'cancel':
          await cancelServiceRequest(req.id, notes);
          break;
        case 'reschedule':
          if (req.visit_details?.visit_date) {
            await rescheduleEvaluationVisit(req.id, { new_visit_date: values.visit_date, new_visit_time: values.visit_time || undefined, reason: notes });
          } else {
            await scheduleEvaluationVisit(req.id, { visit_date: values.visit_date, visit_time: values.visit_time, farmer_instructions: notes || undefined });
          }
          break;
        default:
          return;
      }
      await notifyFarmer(req, kind, values);
      toast.success(SUCCESS[kind]);
      setAction(null);
      setDetailId(null);
      refresh();
    } catch (e) {
      toast.error(e.message || 'Action failed');
    }
  };

  const actionButtons = (req, size = 'sm') => {
    const allowed = allowedActions(req);
    return ACTIONS.filter((a) => allowed[a.id]).map((a) => (
      <Button
        key={a.id}
        size={size}
        variant={a.id === 'approve' ? 'primary' : a.danger ? 'ghost' : 'secondary'}
        className={a.danger ? 'text-rose-700 hover:bg-rose-50' : undefined}
        icon={a.icon}
        onClick={() => {
          setDetailId(null);
          setAction({ type: a.id, request: req });
        }}
      >
        {a.label}
      </Button>
    ));
  };

  const totalPending = Object.values(pendingCounts).reduce((s, n) => s + (n || 0), 0);
  const tabs = SERVICE_TYPES.map((t) => ({ id: t.id, label: t.label, count: counts[t.id] }));
  const { pagination } = data;

  return (
    <Page>
      <PageHeader
        icon={ClipboardList}
        title="Service Requests"
        subtitle="Review, approve and assign farmers' service requests"
        actions={<Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>}
      />

      <StatGrid cols={3}>
        <StatCard label="Pending (all types)" value={totalPending} icon={Hourglass} tone="amber" />
        <StatCard label={`Pending · ${SERVICE_TYPES.find((t) => t.id === type)?.label}`} value={pendingCounts[type] ?? '—'} icon={ClipboardList} tone="blue" />
        <StatCard label="Active agents" value={agents.length} icon={UserPlus} />
      </StatGrid>

      <Card padded={false}>
        <div className="space-y-4 border-b border-slate-100 p-4">
          <Tabs tabs={tabs} value={type} onChange={changeType} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative block">
              <span className="sr-only">Search this page</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-9`} placeholder="Search this page…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <select aria-label="Status" className={inputClass} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select aria-label="Priority" className={inputClass} value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
              <option value="">All priorities</option>
              {Object.keys(PRIORITY_TONES).map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
            </select>
            <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={filters.escalated} onChange={(e) => setFilter('escalated', e.target.checked)} />
              Escalated (past SLA) only
            </label>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading requests…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={search ? 'No requests on this page match your search' : 'No requests found'}
            description={filters.status || filters.priority || filters.escalated ? 'Try clearing the filters.' : 'New requests from farmers will appear here.'}
          />
        ) : (
          <Table head={['Request', 'Farmer', 'Location', 'Requested', 'Status', 'Agent', 'Actions']}>
            {rows.map((r) => {
              const st = statusMeta(r.status);
              const f = farmers[r.farmer_id];
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-medium text-slate-900">{r.title || '—'}</p>
                    <p className="text-xs text-slate-500">{r.request_number}</p>
                  </Td>
                  <Td>
                    <p>{f?.full_name || (r.farmer_id in farmers ? 'Unknown farmer' : '…')}</p>
                    {f?.phone && <p className="text-xs text-slate-500">{f.phone}</p>}
                  </Td>
                  <Td className="max-w-[180px] truncate">{formatLocation(r.location)}</Td>
                  <Td>{formatDate(r.requested_date || r.created_at)}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {r.priority && r.priority !== 'medium' && <Badge tone={PRIORITY_TONES[r.priority]}>{r.priority}</Badge>}
                      {r.is_escalated && <Badge tone="rose"><AlertTriangle className="mr-1 h-3 w-3" />Escalated</Badge>}
                    </div>
                  </Td>
                  <Td>{agentName(r.agent_id) || <span className="text-slate-400">—</span>}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} onClick={() => setDetailId(r.id)} aria-label={`View ${r.request_number}`}>View</Button>
                      {allowedActions(r).approve && (
                        <Button size="sm" icon={CheckCircle2} onClick={() => setAction({ type: 'approve', request: r })}>Approve</Button>
                      )}
                      {!allowedActions(r).approve && allowedActions(r).assign && !r.agent_id && (
                        <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => setAction({ type: 'assign', request: r })}>Assign</Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
        {!loading && !error && (pagination.totalPages || 0) > 1 && (
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
        )}
      </Card>

      {detailId && (
        <RequestDetailDialog
          requestId={detailId}
          onClose={closeDetail}
          footer={(req) => <div className="flex flex-wrap justify-end gap-2">{actionButtons(req)}</div>}
        />
      )}
      {action && (
        <ActionDialog type={action.type} request={action.request} agents={agents} onClose={closeAction} onSubmit={runAction} />
      )}
    </Page>
  );
}
