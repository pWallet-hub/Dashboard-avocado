import { useCallback, useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, RefreshCw, TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';
import { getShopAnalytics } from '../../services/shopService';
import { getShopCustomers } from '../../services/marketStorageService';
import { Page, PageHeader, Card, StatGrid, StatCard, Button, EmptyState, ErrorState, Spinner, Tabs } from '../../components/Ui/kit';
import {
  useMyShop, ShopGate, fetchAllShopProducts, fetchAllShopOrders, rwf, num, humanize, errMsg, normCategory, shopItems,
  shopOrderTotal, ORDER_STATUSES, isActiveProduct,
} from './shopCommon';

const BRAND = '#15803d';
const BRAND_LIGHT = '#bbf7d0';
const SLATE = '#64748b';
const RANGES = [
  { id: '30', label: 'Last 30 days' },
  { id: '90', label: 'Last 90 days' },
  { id: '365', label: 'Last 12 months' },
];
const compact = (n) => (Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : String(Math.round(n)));
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const monthKey = (d) => new Date(d).toISOString().slice(0, 7);

const ChartCard = ({ title, subtitle, empty, children }) => (
  <Card title={title} subtitle={subtitle}>
    {empty ? <EmptyState icon={BarChart2} title="No data for this period" /> : <div className="h-72">{children}</div>}
  </Card>
);

const ShopAnalytics = () => {
  const shopState = useMyShop();
  const { shop } = shopState;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30');

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    setError(null);
    try {
      const [summary, orders, products, customers] = await Promise.all([
        getShopAnalytics(shop.shop_number),
        fetchAllShopOrders(shop.shop_number),
        fetchAllShopProducts(shop.shop_number),
        getShopCustomers({ limit: 1 }).catch(() => null),
      ]);
      setData({ summary: summary?.data || {}, orders, products, customersHint: Array.isArray(customers) ? null : null });
    } catch (e) {
      setError(errMsg(e, 'Could not load analytics'));
    } finally {
      setLoading(false);
    }
  }, [shop]);
  useEffect(() => { load(); }, [load]);

  const view = useMemo(() => {
    if (!data) return null;
    const ids = new Set(data.products.map((p) => p.id));
    const days = Number(range);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));
    const inRange = data.orders.filter((o) => new Date(o.order_date || o.created_at) >= since);
    const live = inRange.filter((o) => !['cancelled', 'returned'].includes(o.status));

    // revenue trend: daily buckets for ≤90 days, monthly for a year
    const monthly = days > 90;
    const buckets = new Map();
    const cursor = new Date(since);
    while (cursor <= new Date()) {
      const k = monthly ? monthKey(cursor) : dayKey(cursor);
      if (!buckets.has(k)) buckets.set(k, { key: k, revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    live.forEach((o) => {
      const d = o.order_date || o.created_at;
      const b = buckets.get(monthly ? monthKey(d) : dayKey(d));
      if (b) { b.revenue += shopOrderTotal(o, ids); b.orders += 1; }
    });
    const trend = [...buckets.values()].map((b) => ({
      ...b,
      label: monthly
        ? new Date(`${b.key}-01`).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        : new Date(b.key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    }));

    const byStatus = ORDER_STATUSES.map((s) => ({ status: humanize(s), count: inRange.filter((o) => o.status === s).length })).filter((s) => s.count > 0);

    const prodMap = new Map();
    live.forEach((o) => shopItems(o, ids).forEach((it) => {
      const cur = prodMap.get(it.product_id) || { name: it.product_name, revenue: 0, quantity: 0 };
      cur.revenue += Number(it.total_price || 0);
      cur.quantity += Number(it.quantity || 0);
      prodMap.set(it.product_id, cur);
    }));
    const top = [...prodMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    const catMap = new Map();
    data.products.filter(isActiveProduct).forEach((p) => {
      const c = humanize(normCategory(p.category));
      catMap.set(c, (catMap.get(c) || 0) + Number(p.price || 0) * Number(p.quantity || 0));
    });
    const stockByCategory = [...catMap.entries()].map(([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);

    const revenue = live.reduce((s, o) => s + shopOrderTotal(o, ids), 0);
    const customers = new Set(live.map((o) => o.customer_id)).size;
    return { trend, byStatus, top, stockByCategory, revenue, orders: live.length, customers, avg: live.length ? revenue / live.length : 0 };
  }, [data, range]);

  const header = (
    <PageHeader icon={BarChart2} title="Analytics" subtitle="Performance of your shop's products"
      actions={shop && <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>} />
  );
  if (!shop) return <Page>{header}<ShopGate state={shopState} /></Page>;

  const s = data?.summary || {};
  return (
    <Page>
      {header}
      {error ? <Card><ErrorState message={error} onRetry={load} /></Card> : !view ? <Card><Spinner /></Card> : (
        <>
          <Card title="All time">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Revenue', rwf(s.totalRevenue)], ['Orders', num(s.totalOrders)], ['Units sold', num(s.totalSales)],
                ['Products', num(s.totalProducts)], ['Low stock', num(s.lowStockProducts)], ['Out of stock', num(s.outOfStockProducts)],
              ].map(([k, v]) => <div key={k}><p className="text-slate-500">{k}</p><p className="text-lg font-semibold text-slate-900">{v}</p></div>)}
            </div>
          </Card>

          <Tabs value={range} onChange={setRange} tabs={RANGES} />
          <StatGrid>
            <StatCard label="Revenue" value={rwf(view.revenue)} hint="Your items, excl. VAT and cancelled orders" icon={TrendingUp} />
            <StatCard label="Orders" value={num(view.orders)} icon={ShoppingCart} tone="blue" />
            <StatCard label="Average order" value={rwf(view.avg)} icon={Package} tone="slate" />
            <StatCard label="Buying customers" value={num(view.customers)} icon={Users} tone="amber" />
          </StatGrid>

          <ChartCard title="Revenue trend" subtitle={Number(range) > 90 ? 'Per month' : 'Per day'} empty={view.orders === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={view.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: SLATE }} minTickGap={16} />
                <YAxis tickFormatter={compact} tick={{ fontSize: 12, fill: SLATE }} width={48} />
                <Tooltip formatter={(v, n) => (n === 'revenue' ? [rwf(v), 'Revenue'] : [v, 'Orders'])} />
                <Area type="monotone" dataKey="revenue" stroke={BRAND} fill={BRAND_LIGHT} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Top products" subtitle="Revenue in this period" empty={view.top.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.top} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tickFormatter={compact} tick={{ fontSize: 12, fill: SLATE }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: SLATE }} />
                  <Tooltip formatter={(v) => [rwf(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill={BRAND} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Orders by status" subtitle="Orders placed in this period" empty={view.byStatus.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.byStatus} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: SLATE }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: SLATE }} width={32} />
                  <Tooltip formatter={(v) => [v, 'Orders']} />
                  <Bar dataKey="count" fill={SLATE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Stock value by category" subtitle="Current stock × selling price" empty={view.stockByCategory.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view.stockByCategory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: SLATE }} />
                <YAxis tickFormatter={compact} tick={{ fontSize: 12, fill: SLATE }} width={48} />
                <Tooltip formatter={(v) => [rwf(v), 'Stock value']} />
                <Bar dataKey="value" fill={BRAND} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </Page>
  );
};

export default ShopAnalytics;
