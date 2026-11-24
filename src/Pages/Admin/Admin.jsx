import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Sprout, UserCheck, Store, ShoppingCart, Receipt, BarChart2, ClipboardList, ShieldCheck, Coins, RefreshCw, ArrowRight, Package,
} from 'lucide-react';
import { getDashboardStatistics, getFarmerAnalytics } from '../../services/analyticsService';
import { listUsersPage } from '../../services/usersService';
import { listTransactionsPage, getTransactionsSummary } from '../../services/marketStorageService';
import { getAllShops } from '../../services/shopService';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, EmptyState, Spinner } from '../../components/Ui/kit';

const BASE = '/dashboard/admin';
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '—');
const rwf = (n) => `${Math.round(Number(n) || 0).toLocaleString()} RWF`;
const ago = (v) => {
  if (!v) return '';
  const mins = Math.round((Date.now() - new Date(v).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return new Date(v).toLocaleDateString();
};
const roleTone = { farmer: 'brand', agent: 'blue', shop_manager: 'amber', admin: 'slate' };
const ok = (p) => p.catch(() => null);

const QUICK_LINKS = [
  { to: `${BASE}/users`, icon: Sprout, title: 'Manage growers', text: 'Register, verify and edit growers' },
  { to: `${BASE}/agents`, icon: UserCheck, title: 'Manage agents', text: 'Field agents and their activity' },
  { to: `${BASE}/shop-managers`, icon: Store, title: 'Shop managers', text: 'Accounts that run input shops' },
  { to: `${BASE}/shops`, icon: ShoppingCart, title: 'Shops & products', text: 'Wallets, selling rights, catalogue' },
  { to: `${BASE}/transactions`, icon: Receipt, title: 'Transactions', text: 'Payments, top-ups and fees' },
  { to: `${BASE}/statistics`, icon: BarChart2, title: 'System usage', text: 'Charts across the platform' },
];

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [dash, farmers, txSummary, shops, recentUsers, recentTx] = await Promise.all([
      ok(getDashboardStatistics()),
      ok(getFarmerAnalytics()),
      ok(getTransactionsSummary()),
      ok(getAllShops()),
      ok(listUsersPage('all', { limit: 6 })),
      ok(listTransactionsPage({ limit: 5 })),
    ]);
    setData({ dash, farmers, txSummary, shops: Array.isArray(shops?.data) ? shops.data : null, recentUsers: recentUsers?.data, recentTx: recentTx?.data });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const d = data?.dash;
  const byRole = d?.users?.byRole || {};
  const pendingGrowers = data?.farmers?.by_verification_status?.pending;
  const v = (x) => (loading || x === undefined || x === null ? '—' : x);

  return (
    <Page>
      <PageHeader
        icon={LayoutDashboard}
        title={`Welcome back${user.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}`}
        subtitle="Overview of growers, agents, shops and money moving through the platform."
        actions={<Button variant="secondary" icon={RefreshCw} loading={loading} onClick={load}>Refresh</Button>}
      />

      {!loading && !d && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">Some statistics couldn&apos;t be loaded. Try refreshing.</p>
      )}

      <StatGrid>
        <StatCard label="Growers" value={v(byRole.farmer?.toLocaleString())} hint={pendingGrowers ? `${pendingGrowers} awaiting verification` : undefined} icon={Sprout} />
        <StatCard label="Agents" value={v(byRole.agent)} hint={d ? `${d.users?.total ?? 0} accounts in total` : undefined} icon={UserCheck} tone="blue" />
        <StatCard label="Shops" value={v(data?.shops?.length)} hint={d ? `${byRole.shop_manager ?? 0} shop managers` : undefined} icon={Store} tone="amber" />
        <StatCard label="Transaction volume" value={v(data?.txSummary ? rwf(data.txSummary.total?.amount) : null)} hint={data?.txSummary ? `${data.txSummary.total?.count ?? 0} transactions` : undefined} icon={Coins} tone="slate" />
      </StatGrid>

      <StatGrid cols={3}>
        <StatCard label="Products in catalogue" value={v(d?.products?.total)} hint={d ? `${d.products?.outOfStock ?? 0} out of stock` : undefined} icon={Package} tone="slate" />
        <StatCard label="Orders (30 days)" value={v(d?.orders?.recent)} hint={d ? `${rwf(d.orders?.revenue?.last30Days)} revenue` : undefined} icon={ShoppingCart} tone="slate" />
        <StatCard label="Service requests" value={v(d?.serviceRequests?.total)} hint={d?.serviceRequests?.byStatus?.pending ? `${d.serviceRequests.byStatus.pending} pending` : undefined} icon={ClipboardList} tone="slate" />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Newest accounts" actions={<Link to={`${BASE}/users`} className="text-sm font-medium text-brand-700 hover:underline">Growers</Link>} padded={false}>
          {loading ? <Spinner /> : !data?.recentUsers?.length ? <EmptyState icon={Users} title="No accounts yet" /> : (
            <ul className="divide-y divide-slate-100">
              {data.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{u.full_name}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={roleTone[u.role] || 'slate'}>{label(u.role)}</Badge>
                    <span className="text-xs text-slate-400">{ago(u.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Latest transactions" actions={<Link to={`${BASE}/transactions`} className="text-sm font-medium text-brand-700 hover:underline">All transactions</Link>} padded={false}>
          {loading ? <Spinner /> : !data?.recentTx?.length ? <EmptyState icon={Receipt} title="No transactions yet" description="Wallet top-ups and payments will show up here." /> : (
            <ul className="divide-y divide-slate-100">
              {data.recentTx.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{label(t.type)} · {t.payee?.full_name || '—'}</p>
                    <p className="truncate text-xs text-slate-500">{t.transaction_number} · {ago(t.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-slate-900">{rwf(t.amount)}</span>
                    <Badge tone={t.status === 'completed' ? 'brand' : t.status === 'pending' ? 'amber' : 'slate'}>{label(t.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Quick links">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <p className="truncate text-xs text-slate-500">{text}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
            </Link>
          ))}
        </div>
        {pendingGrowers > 0 && (
          <Link to={`${BASE}/users`} className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100">
            <ShieldCheck className="h-4 w-4" /> {pendingGrowers} grower profiles are waiting for verification.
          </Link>
        )}
      </Card>
    </Page>
  );
}
