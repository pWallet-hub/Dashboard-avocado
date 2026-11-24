import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart, AlertTriangle, Wallet, TrendingUp, RefreshCw, Package } from 'lucide-react';
import { getShopWallet } from '../../services/shopService';
import { Page, PageHeader, Card, StatGrid, StatCard, Button, EmptyState, ErrorState, Spinner, Table, Td, Badge } from '../../components/Ui/kit';
import {
  useMyShop, ShopGate, fetchAllShopProducts, fetchAllShopOrders, rwf, num, fmtDate, fmtDateTime, humanize, errMsg,
  OPEN_ORDER_STATUSES, OrderStatusBadge, PaymentBadge, StockBadge, isLowStock, isOutOfStock, shopOrderTotal,
} from './shopCommon';

const isToday = (d) => d && new Date(d).toDateString() === new Date().toDateString();

/** Shop home: today's sales, open orders, stock alerts and wallet, all from the API. */
const ShopManager = () => {
  const shopState = useMyShop();
  const { shop } = shopState;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    setError(null);
    try {
      const [products, orders, wallet] = await Promise.all([
        fetchAllShopProducts(shop.shop_number),
        fetchAllShopOrders(shop.shop_number),
        getShopWallet(shop.shop_number, { limit: 5 }),
      ]);
      setData({ products, orders, wallet });
    } catch (e) {
      setError(errMsg(e, 'Could not load the shop overview'));
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    if (!data) return null;
    const ids = new Set(data.products.map((p) => p.id));
    const live = data.orders.filter((o) => !['cancelled', 'returned'].includes(o.status));
    const today = live.filter((o) => isToday(o.order_date || o.created_at));
    const open = data.orders.filter((o) => OPEN_ORDER_STATUSES.includes(o.status));
    const alerts = data.products.filter((p) => isLowStock(p) || isOutOfStock(p));
    return {
      ids,
      todaySales: today.reduce((s, o) => s + shopOrderTotal(o, ids), 0),
      todayCount: today.length,
      open,
      pendingCount: open.filter((o) => o.status === 'pending').length,
      alerts,
      outCount: alerts.filter(isOutOfStock).length,
      balance: data.wallet?.meta?.balance ?? shop?.balance ?? 0,
      walletTx: Array.isArray(data.wallet?.data) ? data.wallet.data : [],
    };
  }, [data, shop]);

  const gate = <ShopGate state={shopState} />;
  if (!shop) return <Page><PageHeader icon={Store} title="Shop overview" />{gate}</Page>;

  return (
    <Page>
      <PageHeader
        icon={Store}
        title={shop.shopName || 'Shop overview'}
        subtitle={[shop.district, shop.province].filter(Boolean).join(', ') || 'Your shop at a glance'}
        actions={<Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>}
      />

      {error && <Card><ErrorState message={error} onRetry={load} /></Card>}
      {!error && !stats && <Card><Spinner /></Card>}

      {stats && (
        <>
          <StatGrid>
            <StatCard label="Today's sales" value={rwf(stats.todaySales)} hint={`${stats.todayCount} order${stats.todayCount === 1 ? '' : 's'} today`} icon={TrendingUp} />
            <StatCard label="Open orders" value={num(stats.open.length)} hint={`${stats.pendingCount} awaiting confirmation`} icon={ShoppingCart} tone="blue" />
            <StatCard label="Stock alerts" value={num(stats.alerts.length)} hint={`${stats.outCount} out of stock`} icon={AlertTriangle} tone={stats.alerts.length ? 'amber' : 'slate'} />
            <StatCard label="Wallet balance" value={rwf(stats.balance)} icon={Wallet} tone="slate" />
          </StatGrid>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Open orders" subtitle="Orders that still need processing" padded={false}
              actions={<Link to="/dashboard/shop-manager/orders" className="text-sm font-medium text-brand-700 hover:underline">All orders</Link>}>
              {stats.open.length === 0 ? (
                <EmptyState icon={ShoppingCart} title="No open orders" description="New orders for your products will show up here." />
              ) : (
                <Table head={['Order', 'Date', 'Amount', 'Status', 'Payment']}>
                  {stats.open.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <Td className="font-medium text-slate-900">{o.order_number}</Td>
                      <Td>{fmtDate(o.order_date || o.created_at)}</Td>
                      <Td>{rwf(shopOrderTotal(o, stats.ids))}</Td>
                      <Td><OrderStatusBadge status={o.status} /></Td>
                      <Td><PaymentBadge status={o.payment_status} /></Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>

            <Card title="Stock alerts" subtitle="At or below the minimum stock level" padded={false}
              actions={<Link to="/dashboard/shop-manager/inventory" className="text-sm font-medium text-brand-700 hover:underline">Inventory</Link>}>
              {stats.alerts.length === 0 ? (
                <EmptyState icon={Package} title="Stock levels are healthy" description="No product is at or below its minimum level." />
              ) : (
                <Table head={['Product', 'In stock', 'Minimum', 'Status']}>
                  {stats.alerts.slice(0, 6).map((p) => (
                    <tr key={p.id}>
                      <Td className="font-medium text-slate-900">{p.name}</Td>
                      <Td>{num(p.quantity)} {p.unit}</Td>
                      <Td>{num(p.min_stock ?? 10)}</Td>
                      <Td><StockBadge product={p} /></Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          </div>

          <Card title="Recent wallet activity" padded={false}
            actions={<Link to="/dashboard/shop-manager/profile" className="text-sm font-medium text-brand-700 hover:underline">Wallet history</Link>}>
            {stats.walletTx.length === 0 ? (
              <EmptyState icon={Wallet} title="No wallet activity yet" description="Top-ups and adjustments made by an administrator appear here." />
            ) : (
              <Table head={['Date', 'Reference', 'Description', 'Amount', 'Status']}>
                {stats.walletTx.map((t) => (
                  <tr key={t.id}>
                    <Td>{fmtDateTime(t.created_at)}</Td>
                    <Td className="font-mono text-xs">{t.transaction_number}</Td>
                    <Td className="max-w-xs truncate">{t.description || '—'}</Td>
                    <Td className="font-medium text-slate-900">{rwf(t.amount)}</Td>
                    <Td><Badge tone={t.status === 'completed' ? 'brand' : 'amber'}>{humanize(t.status)}</Badge></Td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </>
      )}
    </Page>
  );
};

export default ShopManager;
