import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Smartphone, UserCheck, UserX, Send, Search, PhoneOff, MailCheck, X } from 'lucide-react';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Table, Td, EmptyState, Spinner, ErrorState, Pagination, inputClass } from '../../components/Ui/kit';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { ALL_DISTRICTS } from '../../utils/rwanda';
import { getActivationSummary, listActivationFarmers, sendActivationInvites, getInviteStatus } from '../../services/activationService';

const STATUS_TABS = [
  { value: 'pending', label: 'Not activated' },
  { value: 'activated', label: 'Activated' },
  { value: '', label: 'All' },
];

/**
 * Farmers imported from the spreadsheets have an account but no login yet.
 * Staff invite them by SMS; each farmer activates on /activate with a one-time
 * code sent to their phone. Farmers without a usable phone are listed so an
 * agent can add their number (Manage Growers / My Farmers).
 */
export default function FarmerActivation({ role }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const batchId = params.get('batch_id') || '';
  const [filters, setFilters] = useState({ status: 'pending', has_phone: '', district: '', search: '', page: 1 });
  const [summary, setSummary] = useState(null);
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [job, setJob] = useState(null);

  const scope = { batch_id: batchId, district: filters.district };

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, l] = await Promise.all([
        getActivationSummary({ batch_id: batchId, district: filters.district, search: filters.search }),
        listActivationFarmers({ ...filters, batch_id: batchId, limit: 25 }),
      ]);
      setSummary(s);
      setList(l);
      if (s.invite_job) setJob(s.invite_job);
    } catch (e) {
      setError(e.message);
    }
  }, [batchId, filters]);

  useEffect(() => {
    load();
  }, [load]);

  // Follow a running invitation job.
  useEffect(() => {
    if (!job || job.done) return undefined;
    const t = setInterval(async () => {
      const j = await getInviteStatus();
      if (j) setJob(j);
      if (j?.done) {
        toast.success(`Invitations sent: ${j.sent}${j.failed ? ` (${j.failed} failed)` : ''}`);
        load();
      }
    }, 3000);
    return () => clearInterval(t);
  }, [job, load, toast]);

  const invite = async (body, who) => {
    setSending(true);
    try {
      const dry = await sendActivationInvites({ ...body, dry_run: true });
      if (!dry.recipients) {
        toast.info('Nobody to invite: everyone matching is activated, already invited, or has no phone.');
        return;
      }
      if (!dry.sms_configured) {
        toast.error('SMS is not set up on the server yet (Africa’s Talking). Farmers can still activate themselves at /activate.');
        return;
      }
      const ok = await confirm(
        `Send an activation SMS to ${dry.recipients.toLocaleString()} ${who}? Each SMS is charged by the SMS provider. The message tells them to open the activation page and enter their phone number to get their code.`,
        { confirmLabel: `Send ${dry.recipients.toLocaleString()} SMS` }
      );
      if (!ok) return;
      const r = await sendActivationInvites(body);
      setJob(r.job || { total: r.recipients, sent: 0, failed: 0, done: false });
      toast.success(`Sending ${r.recipients} invitations…`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const set = (patch) => setFilters((f) => ({ ...f, page: 1, ...patch }));
  const jobRunning = job && !job.done;

  return (
    <Page>
      <PageHeader
        icon={Smartphone}
        title="Farmer activation"
        subtitle="Imported farmers activate their own account with a code sent to their phone. Invite them, follow who has joined, and fix missing phone numbers."
        actions={
          <Button icon={Send} loading={sending} disabled={jobRunning || !summary?.pending_with_phone} onClick={() => invite(scope, 'farmers who have not been invited yet')}>
            Invite not-yet-invited farmers
          </Button>
        }
      />

      {batchId && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Badge tone="blue">Showing one import batch</Badge>
          <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900" onClick={() => setParams({})}><X className="h-4 w-4" />Show all farmers</button>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !summary || !list ? (
        <Spinner label="Loading farmers…" />
      ) : (
        <div className="space-y-6">
          <StatGrid>
            <StatCard label="Activated" value={summary.activated.toLocaleString()} hint={`of ${summary.total.toLocaleString()} farmers`} icon={UserCheck} />
            <StatCard label="Can activate now" value={summary.pending_with_phone.toLocaleString()} hint={`${summary.invited_not_activated.toLocaleString()} invited, not activated yet`} icon={MailCheck} tone="blue" />
            <StatCard label="No usable phone" value={summary.pending_without_phone.toLocaleString()} hint="add their number so they can activate" icon={PhoneOff} tone="amber" />
            <StatCard label="Not activated" value={summary.pending.toLocaleString()} icon={UserX} tone="slate" />
          </StatGrid>

          {!summary.sms_configured && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              SMS is not configured on the server, so invitations and activation codes cannot be sent yet. Set <code>AFRICASTALKING_USERNAME</code> and <code>AFRICASTALKING_API_KEY</code>.
            </p>
          )}
          {job && (
            <div className="rounded-xl border border-slate-200 p-3 text-sm" aria-live="polite">
              {job.done ? `Last invitation run: ${job.sent} sent${job.failed ? `, ${job.failed} failed (${job.last_error || 'SMS error'})` : ''}.` : `Sending invitations… ${job.sent + job.failed} of ${job.total}`}
              {!job.done && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-brand-600 transition-all" style={{ width: `${Math.round(((job.sent + job.failed) / Math.max(1, job.total)) * 100)}%` }} />
                </div>
              )}
            </div>
          )}

          <Card padded={false}>
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
              <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist">
                {STATUS_TABS.map((t) => (
                  <button key={t.value} role="tab" aria-selected={filters.status === t.value} onClick={() => set({ status: t.value })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filters.status === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <select className={`${inputClass} lg:w-44`} value={filters.has_phone} onChange={(e) => set({ has_phone: e.target.value })} aria-label="Phone">
                <option value="">Any phone</option>
                <option value="true">Has a phone</option>
                <option value="false">No usable phone</option>
              </select>
              <select className={`${inputClass} lg:w-44`} value={filters.district} onChange={(e) => set({ district: e.target.value })} aria-label="District">
                <option value="">All districts</option>
                {ALL_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input className={`${inputClass} pl-9`} placeholder="Name, phone or national ID" value={filters.search} onChange={(e) => set({ search: e.target.value })} />
              </div>
            </div>

            {list.data.length === 0 ? (
              <EmptyState icon={UserCheck} title="No farmers here" description="Nobody matches these filters." />
            ) : (
              <Table head={['Farmer', 'Phone', 'District', 'Status', 'Invited', '']}>
                {list.data.map((f) => (
                  <tr key={f.id}>
                    <Td>
                      <div className="font-medium text-slate-900">{f.full_name}</div>
                      <div className="font-mono text-xs text-slate-500">{f.national_id || 'no national ID'}</div>
                    </Td>
                    <Td>{f.phone || <span className="text-amber-700">missing</span>}</Td>
                    <Td>{[f.sector, f.district].filter(Boolean).join(', ') || '—'}</Td>
                    <Td>
                      {f.activated ? <Badge tone="brand">Activated</Badge> : f.can_activate ? <Badge tone="blue">Can activate</Badge> : <Badge tone="amber">Needs a phone</Badge>}
                    </Td>
                    <Td className="text-xs text-slate-500">{f.invited_at ? new Date(f.invited_at).toLocaleDateString() : '—'}</Td>
                    <Td>
                      {f.can_activate && (
                        <Button size="sm" variant="secondary" icon={Send} disabled={sending || jobRunning}
                          onClick={() => invite({ farmer_ids: [f.id], resend: true }, `farmer (${f.full_name})`)}>
                          {f.invited_at ? 'Invite again' : 'Invite'}
                        </Button>
                      )}
                    </Td>
                  </tr>
                ))}
              </Table>
            )}
            <Pagination page={list.pagination.page} totalPages={list.pagination.totalPages} total={list.pagination.total} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
          </Card>

          <p className="text-xs text-slate-500">
            {role === 'agent' ? 'You see farmers in your assigned area. ' : ''}
            To give a farmer a phone number, edit them in {role === 'admin' ? 'Manage Growers' : 'My Farmers'}. A number can belong to only one farmer, because the activation code is sent to it.
          </p>
        </div>
      )}
    </Page>
  );
}
