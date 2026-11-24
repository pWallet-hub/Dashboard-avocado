import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Search, Plus, RefreshCw, Eye, XCircle, ArrowRight } from 'lucide-react';
import { updateOrder, updateOrderStatus } from '../../services/orderService';
import { getShopCustomers } from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog,
  Pagination, Tabs,
} from '../../components/Ui/kit';
import {
  useMyShop, ShopGate, fetchAllShopProducts, fetchAllShopOrders, rwf, num, fmtDate, fmtDateTime, humanize, errMsg,
  OrderStatusBadge, PaymentBadge, PAYMENT_STATUSES, OPEN_ORDER_STATUSES, shopOrderTotal,
} from './shopCommon';
import OrderForm from './OrderForm';

const PAGE_SIZE = 15;
const NEXT_STATUS = { pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered' };
const NEXT_LABEL = { confirmed: 'Confirm order', processing: 'Start processing', shipped: 'Mark shipped', delivered: 'Mark delivered' };
const CANCELLABLE = ['pending', 'confirmed', 'processing'];

const ShopOrders = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const shopState = useMyShop();
  const { shop } = shopState;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('open');
  const [payment, setPayment] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    setError(null);
    try {
      const [o, p, c] = await Promise.all([
        fetchAllShopOrders(shop.shop_number),
        fetchAllShopProducts(shop.shop_number),
        getShopCustomers({ limit: 100 }),
      ]);
      setOrders(o);
      setProducts(p);
      setCustomers(Array.isArray(c) ? c : []);
    } catch (e) {
      setError(errMsg(e, 'Could not load orders'));
    } finally {
      setLoading(false);
    }
  }, [shop]);
  useEffect(() => { load(); }, [load]);

  const productIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);
  const customerName = useCallback(
    (o) => customers.find((c) => c.id === o.customer_id)?.name || o.shipping_address?.full_name || 'Customer',
    [customers]
  );

  const counts = useMemo(() => {
    const c = { open: 0, all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; if (OPEN_ORDER_STATUSES.includes(o.status)) c.open += 1; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab === 'open' && !OPEN_ORDER_STATUSES.includes(o.status)) return false;
      if (!['open', 'all'].includes(tab) && o.status !== tab) return false;
      if (payment && o.payment_status !== payment) return false;
      if (s && !String(o.order_number).toLowerCase().includes(s) && !customerName(o).toLowerCase().includes(s)) return false;
      return true;
    });
  }, [orders, tab, payment, search, customerName]);
  useEffect(() => { setPage(1); }, [tab, payment, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = orders.find((o) => o.id === selectedId) || null;

  const replace = (updated) => setOrders((os) => os.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));

  const changeStatus = async (order, status) => {
    if (status === 'cancelled') {
      const ok = await confirm(`Cancel order ${order.order_number}? The customer's order will be closed.`, { confirmLabel: 'Cancel order' });
      if (!ok) return;
    }
    setBusy(true);
    try {
      replace(await updateOrderStatus(order.id, status));
      toast.success(`Order ${order.order_number} is now ${humanize(status).toLowerCase()}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not update the order'));
    } finally {
      setBusy(false);
    }
  };

  const changePayment = async (order, payment_status) => {
    if (payment_status === order.payment_status) return;
    setBusy(true);
    try {
      replace(await updateOrder(order.id, { payment_status }));
      toast.success(`Payment marked ${humanize(payment_status).toLowerCase()}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not update payment status'));
    } finally {
      setBusy(false);
    }
  };

  const open = orders.filter((o) => OPEN_ORDER_STATUSES.includes(o.status));
  const unpaid = orders.filter((o) => o.payment_status !== 'paid' && !['cancelled', 'returned'].includes(o.status));

  const header = (
    <PageHeader icon={ShoppingCart} title="Orders" subtitle="Orders that include your shop's products"
      actions={shop && (
        <>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={Plus} onClick={() => setCreating(true)} disabled={loading}>New order</Button>
        </>
      )} />
  );
  if (!shop) return <Page>{header}<ShopGate state={shopState} /></Page>;

  return (
    <Page>
      {header}
      <StatGrid>
        <StatCard label="Open orders" value={num(open.length)} icon={ShoppingCart} tone="blue" />
        <StatCard label="Awaiting confirmation" value={num(counts.pending || 0)} tone="amber" />
        <StatCard label="Unpaid" value={num(unpaid.length)} hint={rwf(unpaid.reduce((s, o) => s + shopOrderTotal(o, productIds), 0))} tone="rose" />
        <StatCard label="Delivered" value={num(counts.delivered || 0)} />
      </StatGrid>

      <Card padded={false}>
        <div className="space-y-3 border-b border-slate-100 p-4">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'open', label: 'Open', count: counts.open },
            { id: 'pending', label: 'Pending', count: counts.pending || 0 },
            { id: 'shipped', label: 'Shipped', count: counts.shipped || 0 },
            { id: 'delivered', label: 'Delivered', count: counts.delivered || 0 },
            { id: 'cancelled', label: 'Cancelled', count: counts.cancelled || 0 },
            { id: 'all', label: 'All', count: counts.all },
          ]} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative block">
              <span className="sr-only">Search orders</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-9`} placeholder="Order number or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <select aria-label="Payment status" className={inputClass} value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="">All payment statuses</option>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </div>
        </div>

        {loading && !orders.length ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title={orders.length ? 'No orders match' : 'No orders yet'}
            description={orders.length ? 'Try another tab or search.' : 'Orders placed for your products will appear here.'} />
        ) : (
          <>
            <Table head={['Order', 'Customer', 'Date', 'Your items', 'Status', 'Payment', '']}>
              {rows.map((o) => (
                <tr key={o.id}>
                  <Td className="font-medium text-slate-900">{o.order_number}</Td>
                  <Td>{customerName(o)}</Td>
                  <Td>{fmtDate(o.order_date || o.created_at)}</Td>
                  <Td>{rwf(shopOrderTotal(o, productIds))}</Td>
                  <Td><OrderStatusBadge status={o.status} /></Td>
                  <Td><PaymentBadge status={o.payment_status} /></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      {NEXT_STATUS[o.status] && (
                        <Button variant="secondary" size="sm" disabled={busy} onClick={() => changeStatus(o, NEXT_STATUS[o.status])}>
                          {NEXT_LABEL[NEXT_STATUS[o.status]]}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" aria-label={`View order ${o.order_number}`} onClick={() => setSelectedId(o.id)}><Eye className="h-4 w-4" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={setPage} />
          </>
        )}
      </Card>

      {selected && (
        <Dialog title={`Order ${selected.order_number}`} subtitle={fmtDateTime(selected.order_date || selected.created_at)} size="lg" onClose={() => setSelectedId(null)}
          footer={<>
            {CANCELLABLE.includes(selected.status) && (
              <Button variant="danger" icon={XCircle} disabled={busy} onClick={() => changeStatus(selected, 'cancelled')}>Cancel order</Button>
            )}
            {NEXT_STATUS[selected.status] && (
              <Button icon={ArrowRight} loading={busy} onClick={() => changeStatus(selected, NEXT_STATUS[selected.status])}>{NEXT_LABEL[NEXT_STATUS[selected.status]]}</Button>
            )}
          </>}>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-xs text-slate-500">Status</p><OrderStatusBadge status={selected.status} /></div>
              <div><p className="text-xs text-slate-500">Payment method</p><p className="text-sm font-medium text-slate-900">{humanize(selected.payment_method)}</p></div>
              <Field label="Payment status">
                <select className={inputClass} value={selected.payment_status} disabled={busy} onChange={(e) => changePayment(selected, e.target.value)}>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                </select>
              </Field>
            </div>

            <Table head={['Item', 'Qty', 'Unit price', 'Total']}>
              {(selected.items || []).map((it) => (
                <tr key={it.id} className={productIds.has(it.product_id) ? '' : 'opacity-50'}>
                  <Td className="font-medium text-slate-900">{it.product_name}{!productIds.has(it.product_id) && <span className="ml-2 text-xs font-normal text-slate-500">(other shop)</span>}</Td>
                  <Td>{num(it.quantity)}</Td>
                  <Td>{rwf(it.unit_price)}</Td>
                  <Td>{rwf(it.total_price)}</Td>
                </tr>
              ))}
            </Table>
            <dl className="ml-auto max-w-xs space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{rwf(selected.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">VAT</dt><dd>{rwf(selected.tax_amount)}</dd></div>
              {Number(selected.shipping_cost) > 0 && <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{rwf(selected.shipping_cost)}</dd></div>}
              <div className="flex justify-between font-semibold text-slate-900"><dt>Total</dt><dd>{rwf(selected.total_amount)}</dd></div>
            </dl>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-1 font-medium text-slate-900">Customer</p>
                <p className="text-slate-600">{customerName(selected)}</p>
                <p className="text-slate-600">{selected.shipping_address?.phone || '—'}</p>
              </div>
              <div>
                <p className="mb-1 font-medium text-slate-900">Delivery address</p>
                <p className="text-slate-600">
                  {[selected.shipping_address?.street_address, selected.shipping_address?.city, selected.shipping_address?.province, selected.shipping_address?.country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
              {selected.notes && <div className="sm:col-span-2"><p className="mb-1 font-medium text-slate-900">Notes</p><p className="text-slate-600">{selected.notes}</p></div>}
              {selected.delivered_date && <div><p className="mb-1 font-medium text-slate-900">Delivered</p><p className="text-slate-600">{fmtDateTime(selected.delivered_date)}</p></div>}
            </div>
          </div>
        </Dialog>
      )}

      {creating && (
        <OrderForm mode="order" shop={shop} products={products} customers={customers}
          onClose={() => setCreating(false)} onDone={() => { setCreating(false); load(); }} />
      )}
    </Page>
  );
};

export default ShopOrders;
