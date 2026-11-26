import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus, Trash2, Send, CheckCircle2, XCircle, PackageCheck, Eye, RefreshCw } from 'lucide-react';
import {
  listPurchaseOrders, createPurchaseOrder, getPurchaseOrder, submitPurchaseOrder, approvePurchaseOrder,
  cancelPurchaseOrder, receiveGoods,
} from '../../services/procurementService';
import { getSuppliers } from '../../services/marketStorageService';
import { getAllProducts } from '../../services/productsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Badge,
} from '../../components/Ui/kit';
import { useMyShop, fetchAllShopProducts, rwf, num, fmtDate, fmtDateTime, humanize, errMsg } from './shopCommon';

const STATUSES = ['draft', 'submitted', 'approved', 'ordered', 'partially_received', 'fully_received', 'cancelled'];
const STATUS_TONE = { draft: 'slate', submitted: 'amber', approved: 'blue', ordered: 'blue', partially_received: 'amber', fully_received: 'brand', cancelled: 'rose' };
// The backend only accepts receipts while a PO is approved or ordered (routes/procurement.ts).
const RECEIVABLE = ['approved', 'ordered'];
const PAGE_SIZE = 10;
const emptyItem = () => ({ product_id: '', product_name: '', quantity_ordered: '1', unit_price: '' });

const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] || 'slate'}>{humanize(status)}</Badge>;

/** Purchase orders to suppliers. Used by shop managers (create/submit/receive) and admins (also approve/cancel). */
const Procurement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = localStorage.getItem('role') === 'admin';
  const shopState = useMyShop();
  const { shop } = shopState;

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [catalog, setCatalog] = useState([]);

  const [creating, setCreating] = useState(false);
  const [newPO, setNewPO] = useState({ supplier_id: '', expected_date: '', notes: '', items: [emptyItem()] });
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null); // full PO
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null); // { notes, items }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPurchaseOrders({ page, limit: PAGE_SIZE, ...(status && { status }) });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Could not load purchase orders'));
    } finally {
      setLoading(false);
    }
  }, [page, status]);
  useEffect(() => { load(); }, [load]);

  // Suppliers for the PO form, and the product catalogue so received goods update the right stock.
  useEffect(() => {
    getSuppliers({ limit: 100, status: 'active' }).then((d) => setSuppliers(Array.isArray(d) ? d : [])).catch(() => setSuppliers([]));
  }, []);
  useEffect(() => {
    if (isAdmin) {
      getAllProducts({ limit: 100 }).then((r) => setCatalog(Array.isArray(r) ? r : r?.data || [])).catch(() => setCatalog([]));
    } else if (shop) {
      fetchAllShopProducts(shop.shop_number).then((p) => setCatalog(p.filter((x) => x.status !== 'discontinued'))).catch(() => setCatalog([]));
    }
  }, [isAdmin, shop]);
  const catalogById = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);

  // ── create ──
  const setItem = (i, k, v) => setNewPO((po) => ({
    ...po,
    items: po.items.map((it, j) => {
      if (j !== i) return it;
      if (k !== 'product_id') return { ...it, [k]: v };
      const p = catalogById.get(v);
      return { ...it, product_id: v, product_name: p ? p.name : it.product_name, unit_price: p && it.unit_price === '' ? String(p.cost ?? p.price ?? '') : it.unit_price };
    }),
  }));
  const poTotal = newPO.items.reduce((s, it) => s + Number(it.quantity_ordered || 0) * Number(it.unit_price || 0), 0);

  const create = async (e) => {
    e.preventDefault();
    if (!newPO.supplier_id) return toast.error('Choose a supplier');
    for (const it of newPO.items) {
      if (!it.product_name.trim()) return toast.error('Every line needs a product');
      if (!Number.isInteger(Number(it.quantity_ordered)) || Number(it.quantity_ordered) < 1) return toast.error(`Enter a whole quantity for ${it.product_name}`);
      if (it.unit_price === '' || Number(it.unit_price) < 0) return toast.error(`Enter a unit price for ${it.product_name}`);
    }
    setSaving(true);
    try {
      await createPurchaseOrder({
        supplier_id: newPO.supplier_id,
        expected_date: newPO.expected_date || undefined,
        notes: newPO.notes.trim() || undefined,
        items: newPO.items.map((it) => ({
          product_name: it.product_name.trim(), product_id: it.product_id || undefined,
          quantity_ordered: Number(it.quantity_ordered), unit_price: Number(it.unit_price),
        })),
      });
      toast.success('Purchase order saved as draft');
      setCreating(false);
      setNewPO({ supplier_id: '', expected_date: '', notes: '', items: [emptyItem()] });
      setPage(1);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not create the purchase order'));
    } finally {
      setSaving(false);
    }
  };

  // ── detail & actions ──
  const openDetail = async (po) => {
    setSelected(po);
    setDetailLoading(true);
    try {
      setSelected(await getPurchaseOrder(po.id));
    } catch (err) {
      toast.error(errMsg(err, 'Could not load the purchase order'));
    } finally {
      setDetailLoading(false);
    }
  };

  const act = async (fn, msg, confirmMsg, confirmLabel, danger = true) => {
    if (confirmMsg && !(await confirm(confirmMsg, { confirmLabel, danger }))) return;
    setBusy(true);
    try {
      await fn(selected.id);
      toast.success(msg);
      setSelected(await getPurchaseOrder(selected.id));
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Action failed'));
    } finally {
      setBusy(false);
    }
  };

  const openReceipt = () => setReceipt({
    notes: '',
    items: (selected.items || []).map((it) => ({
      product_name: it.product_name, product_id: it.product_id || '',
      outstanding: Math.max(0, Number(it.quantity_ordered) - Number(it.quantity_received || 0)),
      quantity: String(Math.max(0, Number(it.quantity_ordered) - Number(it.quantity_received || 0))),
      unit_price: it.unit_price,
    })),
  });

  const submitReceipt = async (e) => {
    e.preventDefault();
    const items = receipt.items.filter((it) => Number(it.quantity) > 0);
    if (!items.length) return toast.error('Enter the quantity received for at least one item');
    if (items.some((it) => !Number.isInteger(Number(it.quantity)))) return toast.error('Quantities must be whole numbers');
    setBusy(true);
    try {
      await receiveGoods(selected.id, {
        notes: receipt.notes.trim() || undefined,
        items: items.map((it) => ({ product_name: it.product_name, product_id: it.product_id || undefined, quantity: Number(it.quantity), unit_price: Number(it.unit_price) })),
      });
      const linked = items.filter((it) => it.product_id).length;
      toast.success(linked ? `Goods received — stock updated for ${linked} product${linked > 1 ? 's' : ''}` : 'Goods received');
      setReceipt(null);
      setSelected(await getPurchaseOrder(selected.id));
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not record the goods receipt'));
    } finally {
      setBusy(false);
    }
  };

  const po = selected;
  return (
    <Page>
      <PageHeader icon={ClipboardList} title="Procurement" subtitle={isAdmin ? 'Review, approve and track purchase orders' : 'Order stock from suppliers and receive deliveries into inventory'}
        actions={<>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={Plus} onClick={() => setCreating(true)}>New purchase order</Button>
        </>} />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <select aria-label="Status" className={`${inputClass} sm:w-60`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
          {!isAdmin && <p className="text-xs text-slate-500">Draft → submit → an administrator approves → you receive the goods.</p>}
        </div>
        {loading && !rows.length ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> : rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title={status ? 'No purchase orders with this status' : 'No purchase orders yet'}
            action={!status && <Button icon={Plus} onClick={() => setCreating(true)}>New purchase order</Button>} />
        ) : (
          <>
            <Table head={['PO number', 'Supplier', 'Ordered', 'Expected', 'Total', 'Status', '']}>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium text-slate-900">{r.po_number}</Td>
                  <Td>{r.supplier?.name || '—'}</Td>
                  <Td>{fmtDate(r.order_date)}</Td>
                  <Td>{fmtDate(r.expected_date)}</Td>
                  <Td>{rwf(r.total_amount)}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td><Button variant="ghost" size="sm" aria-label={`View ${r.po_number}`} onClick={() => openDetail(r)}><Eye className="h-4 w-4" /></Button></Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.currentPage || page} totalPages={pagination.totalPages} total={pagination.totalItems} onChange={setPage} />
          </>
        )}
      </Card>

      {creating && (
        <Dialog title="New purchase order" subtitle="Saved as a draft; submit it when ready." size="xl" onClose={() => !saving && setCreating(false)}
          footer={<>
            <Button variant="secondary" onClick={() => setCreating(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="po-form" loading={saving}>Save draft</Button>
          </>}>
          <form id="po-form" onSubmit={create} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Supplier" required hint={suppliers.length ? undefined : 'No active suppliers available.'}>
                <select className={inputClass} value={newPO.supplier_id} onChange={(e) => setNewPO((p) => ({ ...p, supplier_id: e.target.value }))}>
                  <option value="">Select a supplier…</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Expected delivery"><input type="date" className={inputClass} value={newPO.expected_date} onChange={(e) => setNewPO((p) => ({ ...p, expected_date: e.target.value }))} /></Field>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Items <span className="text-rose-600">*</span></p>
              <p className="text-xs text-slate-500">Link each line to a {isAdmin ? 'catalogue' : 'shop'} product so its stock goes up when the goods are received.</p>
              {newPO.items.map((it, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1.4fr_1.2fr_5rem_7rem_auto] sm:border-0 sm:p-0">
                  <select aria-label={`Product ${i + 1}`} className={`${inputClass} col-span-2 sm:col-span-1`} value={it.product_id} onChange={(e) => setItem(i, 'product_id', e.target.value)}>
                    <option value="">Not in catalogue</option>
                    {catalog.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input aria-label={`Item name ${i + 1}`} className={`${inputClass} col-span-2 sm:col-span-1`} placeholder="Item name" value={it.product_name} disabled={!!it.product_id} onChange={(e) => setItem(i, 'product_name', e.target.value)} />
                  <input aria-label={`Quantity ${i + 1}`} type="number" min="1" step="1" className={inputClass} placeholder="Qty" value={it.quantity_ordered} onChange={(e) => setItem(i, 'quantity_ordered', e.target.value)} />
                  <input aria-label={`Unit price ${i + 1}`} type="number" min="0" step="any" className={inputClass} placeholder="Unit price" value={it.unit_price} onChange={(e) => setItem(i, 'unit_price', e.target.value)} />
                  <Button variant="ghost" size="sm" aria-label={`Remove line ${i + 1}`} disabled={newPO.items.length === 1} onClick={() => setNewPO((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setNewPO((p) => ({ ...p, items: [...p.items, emptyItem()] }))}>Add line</Button>
            </div>
            <Field label="Notes"><input className={inputClass} value={newPO.notes} maxLength={500} onChange={(e) => setNewPO((p) => ({ ...p, notes: e.target.value }))} /></Field>
            <p className="text-right text-sm font-semibold text-slate-900">Total: {rwf(poTotal)}</p>
          </form>
        </Dialog>
      )}

      {po && !receipt && (
        <Dialog title={po.po_number} subtitle={po.supplier?.name} size="xl" onClose={() => setSelected(null)}
          footer={!detailLoading && <>
            {isAdmin && !['fully_received', 'cancelled'].includes(po.status) && (
              <Button variant="danger" icon={XCircle} disabled={busy} onClick={() => act(cancelPurchaseOrder, 'Purchase order cancelled', `Cancel ${po.po_number}? This cannot be undone.`, 'Cancel PO')}>Cancel PO</Button>
            )}
            {po.status === 'draft' && <Button icon={Send} loading={busy} onClick={() => act(submitPurchaseOrder, 'Submitted for approval', `Submit ${po.po_number} for approval? It can no longer be edited.`, 'Submit', false)}>Submit for approval</Button>}
            {isAdmin && po.status === 'submitted' && <Button icon={CheckCircle2} loading={busy} onClick={() => act(approvePurchaseOrder, 'Purchase order approved')}>Approve</Button>}
            {RECEIVABLE.includes(po.status) && <Button icon={PackageCheck} disabled={busy} onClick={openReceipt}>Receive goods</Button>}
          </>}>
          {detailLoading ? <Spinner /> : (
            <div className="space-y-5">
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div><dt className="text-slate-500">Status</dt><dd><StatusBadge status={po.status} /></dd></div>
                <div><dt className="text-slate-500">Ordered</dt><dd className="font-medium text-slate-900">{fmtDate(po.order_date)}</dd></div>
                <div><dt className="text-slate-500">Expected</dt><dd className="font-medium text-slate-900">{fmtDate(po.expected_date)}</dd></div>
                <div><dt className="text-slate-500">Total</dt><dd className="font-medium text-slate-900">{rwf(po.total_amount)}</dd></div>
              </dl>
              {po.status === 'submitted' && !isAdmin && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Waiting for an administrator to approve this order.</p>}
              {po.status === 'partially_received' && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Part of this order has been received. Further receipts on a partially received order are not supported by the server yet.</p>}
              <Table head={['Item', 'Ordered', 'Received', 'Unit price', 'Total']}>
                {(po.items || []).map((it) => (
                  <tr key={it.id}>
                    <Td className="font-medium text-slate-900">{it.product_name}{!it.product_id && <span className="ml-2 text-xs font-normal text-slate-500">(not linked to stock)</span>}</Td>
                    <Td>{num(it.quantity_ordered)}</Td>
                    <Td>{num(it.quantity_received)}</Td>
                    <Td>{rwf(it.unit_price)}</Td>
                    <Td>{rwf(it.total_price)}</Td>
                  </tr>
                ))}
              </Table>
              {po.notes && <p className="text-sm text-slate-600">{po.notes}</p>}
              {po.receipts?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Goods receipts</p>
                  {po.receipts.map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2"><span className="font-medium text-slate-900">{r.receipt_number}</span><span className="text-slate-500">{fmtDateTime(r.received_date)}</span></div>
                      <p className="mt-1 text-slate-600">{(r.items || []).map((it) => `${it.product_name} × ${it.quantity}`).join(', ')}</p>
                      {r.notes && <p className="mt-1 text-xs text-slate-500">{r.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Dialog>
      )}

      {receipt && (
        <Dialog title={`Receive goods — ${po.po_number}`} subtitle="Enter what actually arrived. Linked products get their stock increased." size="lg" onClose={() => !busy && setReceipt(null)}
          footer={<>
            <Button variant="secondary" onClick={() => setReceipt(null)} disabled={busy}>Back</Button>
            <Button type="submit" form="receipt-form" loading={busy}>Record receipt</Button>
          </>}>
          <form id="receipt-form" onSubmit={submitReceipt} className="space-y-4">
            <Table head={['Item', 'Outstanding', 'Received now']}>
              {receipt.items.map((it, i) => (
                <tr key={i}>
                  <Td className="font-medium text-slate-900">{it.product_name}</Td>
                  <Td>{num(it.outstanding)}</Td>
                  <Td>
                    <input aria-label={`Received quantity for ${it.product_name}`} type="number" min="0" step="1" className={`${inputClass} w-24`} value={it.quantity}
                      onChange={(e) => setReceipt((r) => ({ ...r, items: r.items.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)) }))} />
                  </Td>
                </tr>
              ))}
            </Table>
            <Field label="Notes"><input className={inputClass} value={receipt.notes} maxLength={500} onChange={(e) => setReceipt((r) => ({ ...r, notes: e.target.value }))} placeholder="e.g. delivery note number, condition" /></Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default Procurement;
