import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Package, Plus, RefreshCw, X, QrCode, CheckCircle2, XCircle, HandCoins, Truck, Trash2, Search, Printer, Scale, TrendingUp, CalendarDays } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import {
  LOT_STATUSES,
  statusMeta,
  allowedLotActions,
  listHarvestLots,
  getHarvestLotSummary,
  createHarvestLot,
  verifyHarvestLot,
  rejectHarvestLot,
  sellHarvestLot,
  deliverHarvestLot,
  deleteHarvestLot,
  getHarvestLotQr,
  getFarmOptions,
} from '../../services/harvestLotsService';
import { GRADES, labelFor } from '../../services/marketPricesService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, Spinner, Table, Td } from '../../components/Ui/kit';
import { isoDay } from '../Farmer/farmerShared';

const DRY_MATTER_MIN = 23;
const today = () => isoDay();
const kg = (n) => `${Number(n || 0).toLocaleString()} kg`;
const rwf = (n) => (n === null || n === undefined ? '—' : `${Math.round(n).toLocaleString()} RWF`);
const input = inputClass;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthLabel = (key, short = false) => {
  const [y, m] = key.split('-').map(Number);
  return `${(short ? MONTH_NAMES[m - 1].slice(0, 3) : MONTH_NAMES[m - 1])} ${short ? String(y).slice(2) : y}`;
};
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - i);

const emptyLot = () => ({ farm_id: '', harvest_date: today(), quantity_kg: '', crates: '', grade: 'grade_a', dry_matter_pct: '', variety: '', notes: '' });

const Dialog = ({ title, onClose, children }) => createPortal(
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>,
  document.body
);

/**
 * Harvest lots & traceability. Farmers record and sell their own lots;
 * agents/admins verify (weight, grade, dry-matter maturity) or reject them.
 */
const HarvestLots = ({ role = 'farmer' }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const staff = role === 'admin' || role === 'agent';

  const [lots, setLots] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState({ year: '', month: '' }); // '' year = all time / last 12 months
  const [farms, setFarms] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyLot);
  const [dialog, setDialog] = useState(null); // { type, lot, values }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        listHarvestLots({ ...filters, page, limit: 15 }),
        getHarvestLotSummary(period),
      ]);
      setLots(list.data);
      setPagination(list.pagination);
      setSummary(sum);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, period, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getFarmOptions()
      .then(setFarms)
      .catch(() => setFarms([]));
  }, []);

  const submitLot = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
      const lot = await createHarvestLot(payload);
      toast.success(`Lot ${lot.lot_code} recorded`);
      setForm(emptyLot());
      setShowForm(false);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const openDialog = async (type, lot) => {
    if (type === 'qr') {
      setDialog({ type, lot, loading: true });
      try {
        const qr = await getHarvestLotQr(lot.id);
        setDialog({ type, lot, qr });
      } catch (error) {
        toast.error(error.message);
        setDialog(null);
      }
      return;
    }
    if (type === 'deliver' || type === 'delete') {
      const ok = await confirm(
        type === 'deliver' ? `Mark lot ${lot.lot_code} as delivered to ${lot.buyer_name}?` : `Delete lot ${lot.lot_code}? This cannot be undone.`,
        { confirmLabel: type === 'deliver' ? 'Mark delivered' : 'Delete' }
      );
      if (!ok) return;
      try {
        if (type === 'deliver') await deliverHarvestLot(lot.id);
        else await deleteHarvestLot(lot.id);
        toast.success(type === 'deliver' ? 'Lot marked as delivered' : 'Lot deleted');
        load();
      } catch (error) {
        toast.error(error.message);
      }
      return;
    }
    const values =
      type === 'verify'
        ? { quantity_kg: lot.quantity_kg, grade: lot.grade, dry_matter_pct: lot.dry_matter_pct ?? '' }
        : type === 'sell'
          ? { buyer_name: '', buyer_contact: '', price_per_kg: '' }
          : { reason: '' };
    setDialog({ type, lot, values });
  };

  const setValue = (k, v) => setDialog((d) => ({ ...d, values: { ...d.values, [k]: v } }));

  const submitDialog = async (e) => {
    e.preventDefault();
    const { type, lot, values } = dialog;
    setBusy(true);
    try {
      const payload = { ...values };
      Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
      if (type === 'verify') await verifyHarvestLot(lot.id, payload);
      if (type === 'reject') await rejectHarvestLot(lot.id, payload);
      if (type === 'sell') await sellHarvestLot(lot.id, payload);
      toast.success({ verify: 'Lot verified', reject: 'Lot rejected', sell: 'Sale recorded' }[type]);
      setDialog(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const printLabel = () => {
    const { lot, qr } = dialog;
    const w = window.open('', '_blank', 'width=420,height=560');
    if (!w) return;
    w.document.write(`<!doctype html><title>${lot.lot_code}</title>
      <body style="font-family:sans-serif;text-align:center;padding:24px">
      <h2 style="margin:0 0 4px">${lot.lot_code}</h2>
      <p style="margin:0 0 12px">${lot.variety} · ${kg(lot.quantity_kg)} · ${labelFor(GRADES, lot.grade)}</p>
      <img src="${qr.qr_code}" style="width:260px;height:260px" alt="QR code"/>
      <p style="font-size:12px;color:#555">Scan to trace origin · Harvested ${new Date(lot.harvest_date).toLocaleDateString()}</p>
      <script>window.onload=()=>window.print()</script></body>`);
    w.document.close();
  };

  const dmFails = dialog?.type === 'verify' && dialog.values.grade === 'export' && dialog.values.dry_matter_pct !== '' && Number(dialog.values.dry_matter_pct) < DRY_MATTER_MIN;
  const saleTotal = dialog?.type === 'sell' && dialog.values.price_per_kg ? Number(dialog.values.price_per_kg) * dialog.lot.quantity_kg : null;

  const actionButton = (lot, action) => {
    const map = {
      verify: { icon: CheckCircle2, label: 'Verify', cls: 'text-blue-700 hover:bg-blue-50' },
      reject: { icon: XCircle, label: 'Reject', cls: 'text-rose-700 hover:bg-rose-50' },
      sell: { icon: HandCoins, label: 'Record sale', cls: 'text-amber-700 hover:bg-amber-50' },
      deliver: { icon: Truck, label: 'Delivered', cls: 'text-brand-700 hover:bg-brand-50' },
      delete: { icon: Trash2, label: 'Delete', cls: 'text-slate-500 hover:bg-slate-100' },
    }[action];
    const Icon = map.icon;
    return (
      <button key={action} onClick={() => openDialog(action, lot)} className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${map.cls}`}>
        <Icon className="mr-1 h-3.5 w-3.5" />{map.label}
      </button>
    );
  };

  const periodLabel = period.year
    ? period.month ? `${MONTH_NAMES[Number(period.month) - 1]} ${period.year}` : `the whole of ${period.year}`
    : 'all time';

  const toneFor = { recorded: 'slate', verified: 'blue', sold: 'amber', delivered: 'brand', rejected: 'rose' };

  return (
    <Page>
      <PageHeader
        icon={Package}
        title="Harvest Lots & Traceability"
        subtitle={
          staff
            ? 'Verify farmers’ harvests (weight, grade, dry matter) and follow each lot to the buyer.'
            : 'Record each harvest as a lot, get it verified, and print a QR label buyers can scan.'
        }
        actions={
          <>
            <Button icon={showForm ? X : Plus} onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Close' : 'Record harvest'}
            </Button>
            <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          </>
        }
      />

      {/* Summary — totals for the chosen period */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium text-slate-900">{periodLabel}</span>
        </p>
        <div className="flex gap-2">
          <select
            aria-label="Year"
            className={`${input} w-36`}
            value={period.year}
            onChange={(e) => setPeriod({ year: e.target.value, month: '' })}
          >
            <option value="">All time</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            aria-label="Month"
            className={`${input} w-40`}
            value={period.month}
            disabled={!period.year}
            onChange={(e) => setPeriod((p) => ({ ...p, month: e.target.value }))}
          >
            <option value="">Whole year</option>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </div>
      {summary && (
        <StatGrid>
          <StatCard label="Lots recorded" value={summary.total_lots.toLocaleString()} hint={periodLabel} icon={Package} />
          <StatCard label="Total harvested" value={kg(summary.total_kg)} hint={summary.sold_kg ? `${kg(summary.sold_kg)} sold` : periodLabel} icon={Scale} tone="blue" />
          <StatCard label="Revenue (sold)" value={rwf(summary.revenue)} hint={periodLabel} icon={HandCoins} tone="amber" />
          <StatCard label="Average price" value={summary.average_price_per_kg ? `${rwf(summary.average_price_per_kg)}/kg` : '—'} hint={periodLabel} icon={TrendingUp} tone="slate" />
        </StatGrid>
      )}

      {/* Monthly breakdown — the same figures, month by month */}
      {summary?.by_month?.length > 0 && (
        <Card
          title="Month by month"
          subtitle={period.year ? `Every month of ${period.year}. Click a month to see its totals above.` : 'The last 12 months. Click a month to see its totals above.'}
          padded={false}
        >
          {summary.by_month.some((m) => m.lots > 0) ? (
            <>
              <div className="h-64 w-full px-2 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.by_month.map((m) => ({ ...m, label: monthLabel(m.month, true) }))} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(n) => n.toLocaleString()} />
                    <Tooltip formatter={(value, name) => [kg(value), name]} />
                    <Legend />
                    <Bar dataKey="total_kg" name="Harvested" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sold_kg" name="Sold" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected_kg" name="Rejected" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table head={['Month', 'Lots', 'Harvested', 'Sold', 'Rejected', 'Revenue', 'Avg price']}>
                {summary.by_month.slice().reverse().map((m) => {
                  const [y, mo] = m.month.split('-').map(Number);
                  const selected = Number(period.year) === y && Number(period.month) === mo;
                  return (
                    <tr
                      key={m.month}
                      onClick={() => setPeriod(selected ? { year: String(y), month: '' } : { year: String(y), month: String(mo) })}
                      className={`cursor-pointer hover:bg-slate-50 ${selected ? 'bg-brand-50' : ''} ${m.lots ? '' : 'text-slate-400'}`}
                    >
                      <Td className="font-medium text-slate-900"><CalendarDays className="mr-1 inline h-4 w-4 text-slate-400" />{monthLabel(m.month)}</Td>
                      <Td>{m.lots}</Td>
                      <Td>{kg(m.total_kg)}</Td>
                      <Td>{kg(m.sold_kg)}</Td>
                      <Td>{m.rejected_kg ? kg(m.rejected_kg) : '—'}</Td>
                      <Td>{m.revenue ? rwf(m.revenue) : '—'}</Td>
                      <Td>{m.average_price_per_kg ? `${rwf(m.average_price_per_kg)}/kg` : '—'}</Td>
                    </tr>
                  );
                })}
              </Table>
            </>
          ) : (
            <EmptyState icon={CalendarDays} title="No harvest recorded in these months" />
          )}
        </Card>
      )}

      {/* Record form */}
      {showForm && (
        <Card title="Record a harvest lot" subtitle="A unique lot code is generated automatically.">
          <form onSubmit={submitLot}>
            {farms.length === 0 && (
              <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
                {staff ? 'No farms found.' : 'You have no registered farm yet. Ask your agent to register your farm first.'}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Farm" required className="sm:col-span-2 lg:col-span-1">
                <select required className={input} value={form.farm_id} onChange={(e) => setForm({ ...form, farm_id: e.target.value })}>
                  <option value="">Select farm…</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.farmName}{staff && f.farmerName ? ` — ${f.farmerName}` : ''}</option>
                  ))}
                </select>
              </Field>
              <Field label="Harvest date" required>
                <input type="date" required max={today()} className={input} value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} />
              </Field>
              <Field label="Quantity (kg)" required>
                <input type="number" required min="0.1" step="0.1" className={input} value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} />
              </Field>
              <Field label="Crates">
                <input type="number" min="0" step="1" className={input} value={form.crates} onChange={(e) => setForm({ ...form, crates: e.target.value })} />
              </Field>
              <Field label="Expected grade">
                <select className={input} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                  {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
              <Field label="Dry matter %" hint="If tested">
                <input type="number" min="5" max="60" step="0.1" className={input} value={form.dry_matter_pct} onChange={(e) => setForm({ ...form, dry_matter_pct: e.target.value })} />
              </Field>
              <Field label="Variety" hint="Defaults to the farm’s variety">
                <input className={input} value={form.variety} placeholder="Hass" onChange={(e) => setForm({ ...form, variety: e.target.value })} />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <input className={input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={busy}>{busy ? 'Saving…' : 'Save lot'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className={`${input} pl-9`} placeholder="Search lot code…" value={filters.search} aria-label="Search lot code"
              onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })); }} />
          </div>
          <select className={`${input} sm:w-48`} value={filters.status} aria-label="Status"
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
            <option value="">All statuses</option>
            {LOT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {lots.length === 0 ? (
          loading ? <Spinner /> : (
            <EmptyState icon={Package} title="No harvest lots yet"
              description="Record your first harvest to get a lot code and QR label."
              action={<Button icon={Plus} onClick={() => setShowForm(true)}>Record harvest</Button>} />
          )
        ) : (
          <Table head={['Lot', 'Farm', ...(staff ? ['Farmer'] : []), 'Harvested', 'Quantity', 'Grade · DM', 'Status', 'Actions']}>
            {lots.map((lot) => {
              const meta = statusMeta(lot.status);
              return (
                <tr key={lot.id} className="align-top hover:bg-slate-50">
                  <Td className="font-mono text-xs text-slate-900">{lot.lot_code}</Td>
                  <Td className="min-w-[9rem] whitespace-normal">{lot.farm?.farmName || '—'}</Td>
                  {staff && <Td>{lot.farmer?.full_name || '—'}</Td>}
                  <Td>{new Date(lot.harvest_date).toLocaleDateString()}</Td>
                  <Td className="font-medium text-slate-900">{kg(lot.quantity_kg)}</Td>
                  <Td>
                    <div>{labelFor(GRADES, lot.grade)}</div>
                    <div className="text-xs">
                      {lot.dry_matter_pct != null ? (
                        <span className={lot.maturity_passed ? 'text-brand-700' : 'text-rose-600'}>DM {lot.dry_matter_pct}%</span>
                      ) : <span className="text-slate-400">DM not tested</span>}
                    </div>
                  </Td>
                  <Td className="whitespace-normal">
                    <Badge tone={toneFor[lot.status] || 'slate'}>{meta.label}</Badge>
                    {lot.status === 'sold' || lot.status === 'delivered' ? (
                      <div className="mt-1 text-xs text-slate-500">{lot.buyer_name} · {rwf(lot.total_value)}</div>
                    ) : null}
                    {lot.status === 'rejected' && lot.rejection_reason && (
                      <div className="mt-1 max-w-[14rem] text-xs text-rose-600">{lot.rejection_reason}</div>
                    )}
                  </Td>
                  <Td className="whitespace-normal">
                    <div className="flex min-w-[8.5rem] flex-wrap gap-1">
                      <button onClick={() => openDialog('qr', lot)} className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
                        <QrCode className="mr-1 h-3.5 w-3.5" />QR
                      </button>
                      {allowedLotActions(lot, role).map((a) => actionButton(lot, a))}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
          <span className="text-slate-500">Page {pagination.page || page} of {Math.max(1, pagination.totalPages || 1)}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      {/* Dialogs */}
      {dialog?.type === 'qr' && (
        <Dialog title={`QR label · ${dialog.lot.lot_code}`} onClose={() => setDialog(null)}>
          {dialog.loading ? (
            <Spinner label="Generating…" />
          ) : (
            <div className="text-center">
              <div className="mx-auto w-fit rounded-xl border border-slate-200 p-3">
                <img src={dialog.qr.qr_code} alt={`QR code for ${dialog.lot.lot_code}`} className="h-56 w-56" />
              </div>
              <p className="mt-3 break-all text-xs text-slate-500">{dialog.qr.trace_url}</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button icon={Printer} onClick={printLabel}>Print label</Button>
                <a href={dialog.qr.qr_code} download={`${dialog.lot.lot_code}.png`}
                  className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                  Download
                </a>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {dialog && ['verify', 'reject', 'sell'].includes(dialog.type) && (
        <Dialog
          title={{ verify: 'Verify lot', reject: 'Reject lot', sell: 'Record sale' }[dialog.type] + ` · ${dialog.lot.lot_code}`}
          onClose={() => setDialog(null)}
        >
          <form onSubmit={submitDialog} className="space-y-4">
            {dialog.type === 'verify' && (
              <>
                <Field label="Weighed quantity (kg)">
                  <input type="number" min="0.1" step="0.1" className={input} value={dialog.values.quantity_kg} onChange={(e) => setValue('quantity_kg', e.target.value)} />
                </Field>
                <Field label="Grade">
                  <select className={input} value={dialog.values.grade} onChange={(e) => setValue('grade', e.target.value)}>
                    {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </Field>
                <Field label="Dry matter %" required={dialog.values.grade === 'export'}
                  hint={dialog.values.grade === 'export' ? `Minimum ${DRY_MATTER_MIN}% for export grade` : undefined}>
                  <input type="number" min="5" max="60" step="0.1" className={input} required={dialog.values.grade === 'export'}
                    value={dialog.values.dry_matter_pct} onChange={(e) => setValue('dry_matter_pct', e.target.value)} />
                </Field>
                {dmFails && (
                  <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                    Below the {DRY_MATTER_MIN}% export maturity threshold. Choose a lower grade or reject the lot.
                  </p>
                )}
              </>
            )}
            {dialog.type === 'reject' && (
              <Field label="Reason" required>
                <textarea required rows={3} className={input} placeholder="e.g. Immature fruit, pest damage"
                  value={dialog.values.reason} onChange={(e) => setValue('reason', e.target.value)} />
              </Field>
            )}
            {dialog.type === 'sell' && (
              <>
                <Field label="Buyer name" required>
                  <input required className={input} value={dialog.values.buyer_name} onChange={(e) => setValue('buyer_name', e.target.value)} />
                </Field>
                <Field label="Buyer phone / email">
                  <input className={input} value={dialog.values.buyer_contact} onChange={(e) => setValue('buyer_contact', e.target.value)} />
                </Field>
                <Field label="Price per kg (RWF)" required>
                  <input type="number" required min="1" step="1" className={input} value={dialog.values.price_per_kg} onChange={(e) => setValue('price_per_kg', e.target.value)} />
                </Field>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {kg(dialog.lot.quantity_kg)} × price = <strong className="text-slate-900">{saleTotal ? rwf(saleTotal) : '—'}</strong>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
              <Button type="submit" variant={dialog.type === 'reject' ? 'danger' : 'primary'} loading={busy} disabled={dmFails}>
                {busy ? 'Saving…' : { verify: 'Verify lot', reject: 'Reject lot', sell: 'Save sale' }[dialog.type]}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default HarvestLots;
