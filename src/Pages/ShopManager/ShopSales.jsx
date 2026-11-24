import { useCallback, useEffect, useMemo, useState } from 'react';
import { TrendingUp, Plus, RefreshCw, Receipt, Package, Download } from 'lucide-react';
import { getShopCustomers } from '../../services/marketStorageService';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Button, EmptyState, ErrorState, Spinner, Table, Td, Pagination, Tabs,
} from '../../components/Ui/kit';
import {
  useMyShop, ShopGate, fetchAllShopProducts, fetchAllShopOrders, rwf, num, fmtDateTime, humanize, errMsg,
  PaymentBadge, OrderStatusBadge, shopItems, shopOrderTotal,
} from './shopCommon';
import OrderForm from './OrderForm';

const PAGE_SIZE = 15;
const PERIODS = [
  { id: '1', label: 'Today' },
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: 'all', label: 'All time' },
];

/** A sale = a non-cancelled order that has been paid or delivered. */
const isSale = (o) => !['cancelled', 'returned'].includes(o.status) && (o.payment_status === 'paid' || o.status === 'delivered');

const sinceFor = (period) => {
  if (period === 'all') return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (Number(period) - 1));
  return d;
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const ShopSales = () => {
  const shopState = useMyShop();
  const { shop } = shopState;
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');
  const [page, setPage] = useState(1);
  const [recording, setRecording] = useState(false);

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
      setError(errMsg(e, 'Could not load sales'));
    } finally {
      setLoading(false);
    }
  }, [shop]);
  useEffect(() => { load(); }, [load]);

  const ids = useMemo(() => new Set(products.map((p) => p.id)), [products]);
  const nameOf = useCallback((o) => customers.find((c) => c.id === o.customer_id)?.name || o.shipping_address?.full_name || 'Customer', [customers]);

  const sales = useMemo(() => {
    const since = sinceFor(period);
    return orders.filter(isSale).filter((o) => !since || new Date(o.order_date || o.created_at) >= since);
  }, [orders, period]);
  useEffect(() => { setPage(1); }, [period]);

  const summary = useMemo(() => {
    const revenue = sales.reduce((s, o) => s + shopOrderTotal(o, ids), 0);
    const byProduct = new Map();
    let units = 0;
    sales.forEach((o) => shopItems(o, ids).forEach((it) => {
      units += Number(it.quantity || 0);
      const cur = byProduct.get(it.product_id) || { name: it.product_name, quantity: 0, revenue: 0 };
      cur.quantity += Number(it.quantity || 0);
      cur.revenue += Number(it.total_price || 0);
      byProduct.set(it.product_id, cur);
    }));
    return {
      revenue, units, count: sales.length, avg: sales.length ? revenue / sales.length : 0,
      top: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  }, [sales, ids]);

  const exportCsv = () => {
    const lines = [['Order', 'Date', 'Customer', 'Items', 'Amount (RWF)', 'Payment', 'Status'].map(csvCell).join(',')];
    sales.forEach((o) => lines.push([
      o.order_number, new Date(o.order_date || o.created_at).toISOString(), nameOf(o),
      shopItems(o, ids).map((it) => `${it.product_name} x${it.quantity}`).join('; '),
      Math.round(shopOrderTotal(o, ids)), o.payment_status, o.status,
    ].map(csvCell).join(',')));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const rows = sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const header = (
    <PageHeader icon={TrendingUp} title="Sales" subtitle="Paid or delivered orders for your products"
      actions={shop && (
        <>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!sales.length}>Export CSV</Button>
          <Button icon={Plus} onClick={() => setRecording(true)} disabled={loading}>Record sale</Button>
        </>
      )} />
  );
  if (!shop) return <Page>{header}<ShopGate state={shopState} /></Page>;

  return (
    <Page>
      {header}
      <Tabs value={period} onChange={setPeriod} tabs={PERIODS} />

      {loading && !orders.length ? <Card><Spinner /></Card> : error ? <Card><ErrorState message={error} onRetry={load} /></Card> : (
        <>
          <StatGrid>
            <StatCard label="Revenue" value={rwf(summary.revenue)} hint="Your items, before VAT" icon={TrendingUp} />
            <StatCard label="Sales" value={num(summary.count)} icon={Receipt} tone="blue" />
            <StatCard label="Average sale" value={rwf(summary.avg)} tone="slate" />
            <StatCard label="Units sold" value={num(summary.units)} icon={Package} tone="amber" />
          </StatGrid>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Sales" padded={false} className="lg:col-span-2">
              {sales.length === 0 ? (
                <EmptyState icon={Receipt} title="No sales in this period"
                  description="Orders count as sales once they are paid or delivered. Record a counter sale to add one now."
                  action={<Button icon={Plus} onClick={() => setRecording(true)}>Record sale</Button>} />
              ) : (
                <>
                  <Table head={['Order', 'Date', 'Customer', 'Amount', 'Payment', 'Status']}>
                    {rows.map((o) => (
                      <tr key={o.id}>
                        <Td className="font-medium text-slate-900">{o.order_number}</Td>
                        <Td>{fmtDateTime(o.order_date || o.created_at)}</Td>
                        <Td>{nameOf(o)}</Td>
                        <Td className="font-medium text-slate-900">{rwf(shopOrderTotal(o, ids))}</Td>
                        <Td><PaymentBadge status={o.payment_status} /><span className="ml-2 text-xs text-slate-500">{humanize(o.payment_method)}</span></Td>
                        <Td><OrderStatusBadge status={o.status} /></Td>
                      </tr>
                    ))}
                  </Table>
                  <Pagination page={page} totalPages={totalPages} total={sales.length} onChange={setPage} />
                </>
              )}
            </Card>

            <Card title="Top products" subtitle="By revenue in this period" padded={false}>
              {summary.top.length === 0 ? <EmptyState icon={Package} title="No products sold yet" /> : (
                <ul className="divide-y divide-slate-100">
                  {summary.top.map((t) => (
                    <li key={t.name} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{num(t.quantity)} sold</p>
                      </div>
                      <span className="shrink-0 font-medium text-slate-900">{rwf(t.revenue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {recording && (
        <OrderForm mode="sale" shop={shop} products={products} customers={customers}
          onClose={() => setRecording(false)} onDone={() => { setRecording(false); load(); }} />
      )}
    </Page>
  );
};

export default ShopSales;
