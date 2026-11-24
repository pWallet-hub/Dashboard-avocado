import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, Play, CheckCircle2, XCircle, Search, RefreshCw, Clock, ClipboardList, Eye } from 'lucide-react';
import { listVisitsPage, scheduleVisit, startVisit, completeVisit, cancelVisit } from '../../services/visitsService';
import { listFarms } from '../../services/farmsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

const STATUS_TONE = { scheduled: 'blue', in_progress: 'amber', completed: 'brand', cancelled: 'rose' };
const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const formatStatus = (s) => (s ? s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') : 'Unknown');
const formatDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
// Default the picker to tomorrow 09:00 local time
const defaultWhen = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
};
const emptySchedule = () => ({ farm_id: '', scheduled_at: defaultWhen(), purpose: '' });

export default function Visits() {
  const toast = useToast();
  const confirm = useConfirm();

  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({});

  const [farms, setFarms] = useState([]);
  const [schedule, setSchedule] = useState(null); // form values when dialog open
  const [completing, setCompleting] = useState(null); // { visit, findings, recommendations }
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listVisitsPage({ status, page, limit: 15 });
      setVisits(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  // Per-status totals for the stat cards (limit=1 requests only read meta.total)
  const loadCounts = useCallback(async () => {
    try {
      const entries = await Promise.all(
        ['scheduled', 'in_progress', 'completed', 'cancelled'].map(async (s) => [s, (await listVisitsPage({ status: s, limit: 1 })).pagination.total || 0])
      );
      setCounts(Object.fromEntries(entries));
    } catch {
      setCounts({});
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => {
    listFarms({ limit: 100 })
      .then((res) => setFarms(res.data || []))
      .catch(() => setFarms([]));
  }, []);

  const refresh = () => Promise.all([load(), loadCounts()]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return visits;
    return visits.filter((v) =>
      [v.visit_number, v.purpose, v.farm?.farmName].some((x) => (x || '').toLowerCase().includes(term))
    );
  }, [visits, search]);

  const submitSchedule = async (e) => {
    e.preventDefault();
    if (!schedule.farm_id) return toast.error('Please select a farm');
    if (!schedule.scheduled_at) return toast.error('Please choose a date and time');
    setBusy(true);
    try {
      await scheduleVisit({
        farm_id: schedule.farm_id,
        scheduled_at: new Date(schedule.scheduled_at).toISOString(),
        ...(schedule.purpose.trim() && { purpose: schedule.purpose.trim() }),
      });
      toast.success('Visit scheduled');
      setSchedule(null);
      setPage(1);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async (visit) => {
    setActionId(visit.id);
    try {
      await startVisit(visit.id);
      toast.success('Visit started');
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    if (!completing.findings.trim()) return toast.error('Please record your findings');
    setBusy(true);
    try {
      await completeVisit(completing.visit.id, {
        findings: completing.findings.trim(),
        ...(completing.recommendations.trim() && { recommendations: completing.recommendations.trim() }),
      });
      toast.success('Visit completed');
      setCompleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (visit) => {
    const ok = await confirm(`Cancel visit ${visit.visit_number || ''} to ${visit.farm?.farmName || 'this farm'}?`, {
      title: 'Cancel visit',
      confirmLabel: 'Cancel visit',
      cancelLabel: 'Keep visit',
    });
    if (!ok) return;
    setActionId(visit.id);
    try {
      await cancelVisit(visit.id);
      toast.success('Visit cancelled');
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <Page>
      <PageHeader
        icon={CalendarClock}
        title="Farm Visits"
        subtitle="Schedule, run and record your field visits."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={() => setSchedule(emptySchedule())}>Schedule visit</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Scheduled" value={counts.scheduled ?? '—'} icon={Clock} tone="blue" />
        <StatCard label="In progress" value={counts.in_progress ?? '—'} icon={Play} tone="amber" />
        <StatCard label="Completed" value={counts.completed ?? '—'} icon={CheckCircle2} />
        <StatCard label="Cancelled" value={counts.cancelled ?? '—'} icon={XCircle} tone="rose" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs tabs={STATUS_TABS} value={status} onChange={(s) => { setStatus(s); setPage(1); }} />
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search this page…"
              aria-label="Search visits"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading visits…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={search ? 'No visits match your search' : 'No visits yet'}
            description={search ? 'Try a different term.' : 'Schedule a visit to one of your farms to get started.'}
            action={!search && <Button icon={Plus} onClick={() => setSchedule(emptySchedule())}>Schedule visit</Button>}
          />
        ) : (
          <>
            <Table head={['Visit', 'Farm', 'Scheduled', 'Purpose', 'Status', 'Actions']}>
              {filtered.map((v) => {
                const busyRow = actionId === v.id;
                const open = v.status === 'scheduled' || v.status === 'in_progress';
                return (
                  <tr key={v.id}>
                    <Td className="font-medium text-slate-900">{v.visit_number || '—'}</Td>
                    <Td>{v.farm?.farmName || '—'}</Td>
                    <Td>{formatDateTime(v.scheduled_at)}</Td>
                    <Td className="max-w-[220px] truncate">{v.purpose || '—'}</Td>
                    <Td><Badge tone={STATUS_TONE[v.status]}>{formatStatus(v.status)}</Badge></Td>
                    <Td>
                      <div className="flex gap-2">
                        {v.status === 'scheduled' && (
                          <Button size="sm" variant="secondary" icon={Play} loading={busyRow} onClick={() => handleStart(v)}>Start</Button>
                        )}
                        {open && (
                          <Button size="sm" icon={CheckCircle2} disabled={busyRow} onClick={() => setCompleting({ visit: v, findings: v.findings || '', recommendations: v.recommendations || '' })}>
                            Complete
                          </Button>
                        )}
                        {open && (
                          <Button size="sm" variant="ghost" icon={XCircle} disabled={busyRow} onClick={() => handleCancel(v)}>Cancel</Button>
                        )}
                        {!open && (
                          <Button size="sm" variant="ghost" icon={Eye} onClick={() => setViewing(v)}>View</Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </Table>
            <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {schedule && (
        <Dialog
          title="Schedule a farm visit"
          onClose={() => !busy && setSchedule(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSchedule(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="schedule-visit-form" loading={busy}>Schedule</Button>
            </>
          }
        >
          <form id="schedule-visit-form" onSubmit={submitSchedule} className="space-y-4">
            <Field label="Farm" required hint={farms.length === 0 ? 'No farms available — register a farm first.' : undefined}>
              <select className={inputClass} value={schedule.farm_id} onChange={(e) => setSchedule({ ...schedule, farm_id: e.target.value })} required>
                <option value="">Select a farm…</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.farmName || 'Unnamed farm'}{f.farmer?.full_name ? ` — ${f.farmer.full_name}` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date & time" required>
              <input type="datetime-local" className={inputClass} value={schedule.scheduled_at} onChange={(e) => setSchedule({ ...schedule, scheduled_at: e.target.value })} required />
            </Field>
            <Field label="Purpose">
              <textarea className={textareaClass} maxLength={500} placeholder="e.g. Pest inspection, pruning advice" value={schedule.purpose} onChange={(e) => setSchedule({ ...schedule, purpose: e.target.value })} />
            </Field>
          </form>
        </Dialog>
      )}

      {completing && (
        <Dialog
          title="Complete visit"
          subtitle={`${completing.visit.visit_number || ''} · ${completing.visit.farm?.farmName || ''}`}
          onClose={() => !busy && setCompleting(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCompleting(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="complete-visit-form" icon={CheckCircle2} loading={busy}>Mark completed</Button>
            </>
          }
        >
          <form id="complete-visit-form" onSubmit={submitComplete} className="space-y-4">
            <Field label="Findings" required>
              <textarea className={textareaClass} value={completing.findings} onChange={(e) => setCompleting({ ...completing, findings: e.target.value })} placeholder="What did you observe on the farm?" required />
            </Field>
            <Field label="Recommendations">
              <textarea className={textareaClass} value={completing.recommendations} onChange={(e) => setCompleting({ ...completing, recommendations: e.target.value })} placeholder="Advice given to the farmer" />
            </Field>
          </form>
        </Dialog>
      )}

      {viewing && (
        <Dialog title={`Visit ${viewing.visit_number || ''}`} subtitle={viewing.farm?.farmName} onClose={() => setViewing(null)}>
          <dl className="space-y-3 text-sm">
            {[
              ['Status', <Badge key="s" tone={STATUS_TONE[viewing.status]}>{formatStatus(viewing.status)}</Badge>],
              ['Scheduled', formatDateTime(viewing.scheduled_at)],
              ['Completed', formatDateTime(viewing.completed_at)],
              ['Purpose', viewing.purpose || '—'],
              ['Findings', viewing.findings || '—'],
              ['Recommendations', viewing.recommendations || '—'],
            ].map(([k, val]) => (
              <div key={k}>
                <dt className="font-medium text-slate-500">{k}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-slate-900">{val}</dd>
              </div>
            ))}
          </dl>
        </Dialog>
      )}
    </Page>
  );
}
