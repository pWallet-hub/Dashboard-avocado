import { useCallback, useEffect, useState } from 'react';
import { Receipt, Eye, Coins, Hash, Percent, CheckCircle2 } from 'lucide-react';
import { listTransactionsPage, getTransactionsSummary, getTransactionById, updateTransactionStatus } from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const STATUSES = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
const TYPES = ['payment', 'refund', 'adjustment', 'fee', 'commission'];
const statusTone = { completed: 'brand', pending: 'amber', processing: 'blue', failed: 'rose', cancelled: 'slate' };
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '—');
const money = (n, cur = 'RWF') => `${Math.round(Number(n) || 0).toLocaleString()} ${cur}`;
const fmt = (v) => (v ? new Date(v).toLocaleString() : '—');
const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb;

const Detail = ({ label: l, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{l}</dt>
    <dd className="mt-0.5 break-words text-sm text-slate-900">{value === null || value === undefined || value === '' ? '—' : value}</dd>
  </div>
);

export default function Transactions() {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (status) params.status = status;
      if (type) params.type = type;
      const res = await listTransactionsPage(params);
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  }, [page, status, type]);

  const loadSummary = useCallback(() => {
    getTransactionsSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { setPage(1); }, [status, type]);

  const open = async (tx) => {
    setSelected(tx);
    setNewStatus(tx.status);
    try {
      const full = await getTransactionById(tx.id);
      if (full) setSelected((s) => (s?.id === tx.id ? { ...s, ...full } : s));
    } catch {
      /* list row already has everything needed */
    }
  };

  const saveStatus = async () => {
    if (newStatus === selected.status) return;
    const ok = await confirm(`Change ${selected.transaction_number} from ${selected.status} to ${newStatus}?`, {
      confirmLabel: 'Update status', danger: ['failed', 'cancelled'].includes(newStatus),
    });
    if (!ok) return;
    setSaving(true);
    try {
      await updateTransactionStatus(selected.id, newStatus);
      toast.success('Transaction status updated');
      setSelected(null);
      load();
      loadSummary();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update status'));
    } finally {
      setSaving(false);
    }
  };

  const completed = summary?.byStatus?.find((s) => s.status === 'completed')?.count ?? 0;
  const pending = summary?.byStatus?.find((s) => s.status === 'pending')?.count ?? 0;

  return (
    <Page>
      <PageHeader icon={Receipt} title="Transactions" subtitle="Payments, refunds, wallet top-ups and fees recorded across the platform." />

      <StatGrid>
        <StatCard label="Total volume" value={summary ? money(summary.total?.amount) : '—'} icon={Coins} />
        <StatCard label="Transactions" value={summary ? (summary.total?.count ?? 0).toLocaleString() : '—'} icon={Hash} tone="blue" />
        <StatCard label="Completed / pending" value={summary ? `${completed} / ${pending}` : '—'} icon={CheckCircle2} tone="amber" />
        <StatCard label="Fees collected" value={summary ? money(summary.total?.fees) : '—'} icon={Percent} tone="slate" />
      </StatGrid>

      {summary?.byType?.length > 0 && (
        <Card title="By type">
          <div className="flex flex-wrap gap-3">
            {summary.byType.map((t) => (
              <div key={t.type} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">{label(t.type)} · {t.count}</p>
                <p className="text-sm font-semibold text-slate-900">{money(t.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:w-[28rem]">
          <select className={inputClass} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <select className={inputClass} aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
          </select>
        </div>
        {loading ? <Spinner label="Loading transactions…" /> : error ? <ErrorState message={error} onRetry={load} /> : rows.length === 0 ? (
          <EmptyState icon={Receipt} title={status || type ? 'No transactions match these filters' : 'No transactions yet'} description="Wallet top-ups made from Manage Shops appear here as adjustments." />
        ) : (
          <>
            <Table head={['Date', 'Reference', 'From', 'To', 'Type', 'Amount', 'Status', '']}>
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <Td>{fmt(t.created_at)}</Td>
                  <Td className="font-mono text-xs">{t.transaction_number}</Td>
                  <Td>{t.payer?.full_name || '—'}</Td>
                  <Td>{t.payee?.full_name || '—'}</Td>
                  <Td>{label(t.type)}</Td>
                  <Td className="font-medium text-slate-900">{money(t.amount, t.currency)}</Td>
                  <Td><Badge tone={statusTone[t.status] || 'slate'}>{label(t.status)}</Badge></Td>
                  <Td><Button size="sm" variant="ghost" icon={Eye} aria-label={`View ${t.transaction_number}`} onClick={() => open(t)} /></Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {selected && (
        <Dialog
          title={selected.transaction_number}
          subtitle={`${label(selected.type)} · ${fmt(selected.created_at)}`}
          size="lg"
          onClose={() => !saving && setSelected(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setSelected(null)} disabled={saving}>Close</Button>
              <Button loading={saving} disabled={newStatus === selected.status} onClick={saveStatus}>Update status</Button>
            </>
          )}
        >
          <div className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Detail label="Amount" value={money(selected.amount, selected.currency)} />
              <Detail label="Fees" value={money(selected.fees, selected.currency)} />
              <Detail label="Net" value={money(selected.net_amount, selected.currency)} />
              <Detail label="From" value={selected.payer ? `${selected.payer.full_name} (${label(selected.payer.role)})` : null} />
              <Detail label="To" value={selected.payee ? `${selected.payee.full_name} (${label(selected.payee.role)})` : null} />
              <Detail label="Method" value={label(selected.payment_method)} />
              <Detail label="Reference no." value={selected.reference_number} />
              <Detail label="Processed" value={fmt(selected.processed_at)} />
              <Detail label="Order" value={selected.order_id} />
              <div className="sm:col-span-3"><Detail label="Description" value={selected.description} /></div>
            </dl>
            <Field label="Status">
              <select className={inputClass} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </Field>
          </div>
        </Dialog>
      )}
    </Page>
  );
}
