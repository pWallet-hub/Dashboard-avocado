import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, RefreshCw, X, QrCode, CheckCircle2, XCircle, HandCoins, Truck, Trash2, Search, Printer } from 'lucide-react';
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

const DRY_MATTER_MIN = 23;
const today = () => new Date().toISOString().slice(0, 10);
const kg = (n) => `${Number(n || 0).toLocaleString()} kg`;
const rwf = (n) => (n === null || n === undefined ? '—' : `${Math.round(n).toLocaleString()} RWF`);
const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500';

const emptyLot = () => ({ farm_id: '', harvest_date: today(), quantity_kg: '', crates: '', grade: 'grade_a', dry_matter_pct: '', variety: '', notes: '' });

const Dialog = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h3 className="font-semibold text-green-800">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
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
        getHarvestLotSummary(),
      ]);
      setLots(list.data);
      setPagination(list.pagination);
      setSummary(sum);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

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
      reject: { icon: XCircle, label: 'Reject', cls: 'text-red-700 hover:bg-red-50' },
      sell: { icon: HandCoins, label: 'Record sale', cls: 'text-amber-700 hover:bg-amber-50' },
      deliver: { icon: Truck, label: 'Delivered', cls: 'text-green-700 hover:bg-green-50' },
      delete: { icon: Trash2, label: 'Delete', cls: 'text-gray-500 hover:bg-gray-100' },
    }[action];
    const Icon = map.icon;
    return (
      <button key={action} onClick={() => openDialog(action, lot)} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${map.cls}`}>
        <Icon className="h-3.5 w-3.5 mr-1" />{map.label}
      </button>
    );
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Package className="h-7 w-7 mr-3 text-green-600" />
              Harvest Lots &amp; Traceability
            </h2>
            <p className="text-green-600 mt-1">
              {staff
                ? 'Verify farmers’ harvests (weight, grade, dry matter) and follow each lot to the buyer.'
                : 'Record each harvest as a lot, get it verified, and print a QR label buyers can scan.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm((v) => !v)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showForm ? 'Close' : 'Record harvest'}
            </button>
            <button onClick={load} disabled={loading} className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Lots recorded', summary.total_lots.toLocaleString()],
            ['Total harvested', kg(summary.total_kg)],
            ['Revenue (sold)', rwf(summary.revenue)],
            ['Average price', summary.average_price_per_kg ? `${rwf(summary.average_price_per_kg)}/kg` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-xl shadow-lg p-5 ring-1 ring-green-100">
              <p className="text-sm text-green-600">{label}</p>
              <p className="text-xl font-bold text-green-800 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Record form */}
      {showForm && (
        <form onSubmit={submitLot} className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Record a harvest lot</h3>
          {farms.length === 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded p-3 mb-4">
              {staff ? 'No farms found.' : 'You have no registered farm yet. Ask your agent to register your farm first.'}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-sm text-gray-700 sm:col-span-2 lg:col-span-1">
              Farm *
              <select required className={input} value={form.farm_id} onChange={(e) => setForm({ ...form, farm_id: e.target.value })}>
                <option value="">Select farm…</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.farmName}{staff && f.farmerName ? ` — ${f.farmerName}` : ''}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Harvest date *
              <input type="date" required max={today()} className={input} value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Quantity (kg) *
              <input type="number" required min="0.1" step="0.1" className={input} value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Crates
              <input type="number" min="0" step="1" className={input} value={form.crates} onChange={(e) => setForm({ ...form, crates: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Expected grade
              <select className={input} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Dry matter % <span className="text-gray-400">(if tested)</span>
              <input type="number" min="5" max="60" step="0.1" className={input} value={form.dry_matter_pct} onChange={(e) => setForm({ ...form, dry_matter_pct: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Variety <span className="text-gray-400">(defaults to farm’s)</span>
              <input className={input} value={form.variety} placeholder="Hass" onChange={(e) => setForm({ ...form, variety: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700 sm:col-span-2">
              Notes
              <input className={input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={busy} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm">
              {busy ? 'Saving…' : 'Save lot'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            <input className={`${input} pl-9`} placeholder="Search lot code…" value={filters.search}
              onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })); }} />
          </div>
          <select className={`${input} sm:w-48`} value={filters.status} aria-label="Status"
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
            <option value="">All statuses</option>
            {LOT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Farm</th>
                {staff && <th className="py-2 pr-4">Farmer</th>}
                <th className="py-2 pr-4">Harvested</th>
                <th className="py-2 pr-4 text-right">Quantity</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4">Dry matter</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.length === 0 && (
                <tr><td colSpan={staff ? 9 : 8} className="py-8 text-center text-gray-500">{loading ? 'Loading…' : 'No harvest lots yet.'}</td></tr>
              )}
              {lots.map((lot) => {
                const meta = statusMeta(lot.status);
                return (
                  <tr key={lot.id} className="border-b last:border-0 align-top">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-800">{lot.lot_code}</td>
                    <td className="py-3 pr-4">{lot.farm?.farmName || '—'}</td>
                    {staff && <td className="py-3 pr-4">{lot.farmer?.full_name || '—'}</td>}
                    <td className="py-3 pr-4">{new Date(lot.harvest_date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-right">{kg(lot.quantity_kg)}</td>
                    <td className="py-3 pr-4">{labelFor(GRADES, lot.grade)}</td>
                    <td className="py-3 pr-4">
                      {lot.dry_matter_pct != null ? (
                        <span className={lot.maturity_passed ? 'text-green-700' : 'text-red-600'}>{lot.dry_matter_pct}%</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.className}`}>{meta.label}</span>
                      {lot.status === 'sold' || lot.status === 'delivered' ? (
                        <div className="text-xs text-gray-500 mt-1">{lot.buyer_name} · {rwf(lot.total_value)}</div>
                      ) : null}
                      {lot.status === 'rejected' && lot.rejection_reason && (
                        <div className="text-xs text-red-600 mt-1">{lot.rejection_reason}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => openDialog('qr', lot)} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-700 hover:bg-gray-100">
                          <QrCode className="h-3.5 w-3.5 mr-1" />QR
                        </button>
                        {allowedLotActions(lot, role).map((a) => actionButton(lot, a))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">Page {pagination.page || page} of {Math.max(1, pagination.totalPages || 1)}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border disabled:opacity-40">Previous</button>
            <button disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog?.type === 'qr' && (
        <Dialog title={`QR label · ${dialog.lot.lot_code}`} onClose={() => setDialog(null)}>
          {dialog.loading ? (
            <p className="text-center text-gray-500 py-10">Generating…</p>
          ) : (
            <div className="text-center">
              <img src={dialog.qr.qr_code} alt={`QR code for ${dialog.lot.lot_code}`} className="mx-auto w-56 h-56" />
              <p className="text-xs text-gray-500 break-all mt-2">{dialog.qr.trace_url}</p>
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={printLabel} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                  <Printer className="h-4 w-4 mr-2" />Print label
                </button>
                <a href={dialog.qr.qr_code} download={`${dialog.lot.lot_code}.png`} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
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
                <label className="block text-sm text-gray-700">
                  Weighed quantity (kg)
                  <input type="number" min="0.1" step="0.1" className={input} value={dialog.values.quantity_kg} onChange={(e) => setValue('quantity_kg', e.target.value)} />
                </label>
                <label className="block text-sm text-gray-700">
                  Grade
                  <select className={input} value={dialog.values.grade} onChange={(e) => setValue('grade', e.target.value)}>
                    {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </label>
                <label className="block text-sm text-gray-700">
                  Dry matter % {dialog.values.grade === 'export' && <span className="text-red-600">* (min {DRY_MATTER_MIN}% for export)</span>}
                  <input type="number" min="5" max="60" step="0.1" className={input} required={dialog.values.grade === 'export'}
                    value={dialog.values.dry_matter_pct} onChange={(e) => setValue('dry_matter_pct', e.target.value)} />
                </label>
                {dmFails && (
                  <p className="text-sm text-red-600 bg-red-50 rounded p-2">
                    Below the {DRY_MATTER_MIN}% export maturity threshold. Choose a lower grade or reject the lot.
                  </p>
                )}
              </>
            )}
            {dialog.type === 'reject' && (
              <label className="block text-sm text-gray-700">
                Reason *
                <textarea required rows={3} className={input} placeholder="e.g. Immature fruit, pest damage"
                  value={dialog.values.reason} onChange={(e) => setValue('reason', e.target.value)} />
              </label>
            )}
            {dialog.type === 'sell' && (
              <>
                <label className="block text-sm text-gray-700">
                  Buyer name *
                  <input required className={input} value={dialog.values.buyer_name} onChange={(e) => setValue('buyer_name', e.target.value)} />
                </label>
                <label className="block text-sm text-gray-700">
                  Buyer phone / email
                  <input className={input} value={dialog.values.buyer_contact} onChange={(e) => setValue('buyer_contact', e.target.value)} />
                </label>
                <label className="block text-sm text-gray-700">
                  Price per kg (RWF) *
                  <input type="number" required min="1" step="1" className={input} value={dialog.values.price_per_kg} onChange={(e) => setValue('price_per_kg', e.target.value)} />
                </label>
                <p className="text-sm text-gray-600">
                  {kg(dialog.lot.quantity_kg)} × price = <strong className="text-green-800">{saleTotal ? rwf(saleTotal) : '—'}</strong>
                </p>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDialog(null)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
              <button type="submit" disabled={busy || dmFails}
                className={`px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60 ${dialog.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {busy ? 'Saving…' : { verify: 'Verify lot', reject: 'Reject lot', sell: 'Save sale' }[dialog.type]}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
};

export default HarvestLots;
