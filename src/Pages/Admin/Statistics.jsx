import { useCallback, useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart2, Users, Package, ShoppingBag, ClipboardList, RefreshCw } from 'lucide-react';
import {
  getDashboardStatistics, getUserAnalytics, getMonthlyOrderTrends, getRegionalAnalytics, getAgentAnalytics, getFarmerAnalytics,
} from '../../services/analyticsService';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, EmptyState, ErrorState, Spinner, Table, Td,
} from '../../components/Ui/kit';

const BRAND = '#15803d';
const SECOND = '#60a5fa';
const AXIS = { fontSize: 12, fill: '#64748b' };
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '—');
const rwf = (n) => `${Math.round(Number(n) || 0).toLocaleString()} RWF`;
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

const ChartBox = ({ children, height = 260 }) => (
  <div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
  </div>
);

const Section = ({ result, empty, children }) => {
  if (!result) return <Spinner />;
  if (result.error) return <ErrorState message={result.error} />;
  if (empty) return <EmptyState icon={BarChart2} title={empty} />;
  return children;
};

/** Settle one request into { data } or { error } so one failing chart doesn't blank the page. */
const settle = (p) => p.then((data) => ({ data })).catch((e) => ({ error: e?.response?.data?.message || e?.message || 'Failed to load' }));

export default function Statistics() {
  const [res, setRes] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashboard, users, orders, regional, agents, farmers] = await Promise.all([
      settle(getDashboardStatistics()),
      settle(getUserAnalytics({ start_date: daysAgo(90) })),
      settle(getMonthlyOrderTrends()),
      settle(getRegionalAnalytics()),
      settle(getAgentAnalytics()),
      settle(getFarmerAnalytics()),
    ]);
    setRes({ dashboard, users, orders, regional, agents, farmers });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = res.dashboard?.data;
  const regTrend = res.users?.data?.registrations?.trend || [];
  const byRole = Object.entries(res.users?.data?.demographics?.byRole || d?.users?.byRole || {}).map(([role, count]) => ({ role: label(role), count }));
  const orderTrend = res.orders?.data?.trends || [];
  const regions = (res.regional?.data?.regions || []).map((r) => ({ ...r, province: r.province || 'Unknown' }));
  const agents = Array.isArray(res.agents?.data) ? res.agents.data : [];
  const verification = Object.entries(res.farmers?.data?.by_verification_status || {});
  const srByStatus = Object.entries(d?.serviceRequests?.byStatus || {});

  return (
    <Page>
      <PageHeader
        icon={BarChart2}
        title="System Usage"
        subtitle="Live platform activity: accounts, orders, regions and agent performance."
        actions={<Button variant="secondary" icon={RefreshCw} loading={loading} onClick={load}>Refresh</Button>}
      />

      {res.dashboard?.error ? (
        <Card><ErrorState message={res.dashboard.error} onRetry={load} /></Card>
      ) : (
        <StatGrid>
          <StatCard label="Users" value={d ? d.users?.total?.toLocaleString() : '—'} hint={d ? `${d.users?.recent ?? 0} joined in the last 7 days` : undefined} icon={Users} />
          <StatCard label="Products" value={d ? d.products?.total ?? 0 : '—'} hint={d ? `${d.products?.inStock ?? 0} in stock · ${d.products?.outOfStock ?? 0} out` : undefined} icon={Package} tone="blue" />
          <StatCard label="Orders (30 days)" value={d ? d.orders?.recent ?? 0 : '—'} hint={d ? `${rwf(d.orders?.revenue?.last30Days)} revenue` : undefined} icon={ShoppingBag} tone="amber" />
          <StatCard label="Service requests" value={d ? d.serviceRequests?.total ?? 0 : '—'} hint={d ? `${d.serviceRequests?.byStatus?.pending ?? 0} pending` : undefined} icon={ClipboardList} tone="slate" />
        </StatGrid>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="New accounts" subtitle="Registrations per day, last 90 days" className="lg:col-span-2">
          <Section result={res.users} empty={regTrend.length ? null : 'No registrations in the last 90 days'}>
            <ChartBox>
              <BarChart data={regTrend} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="registrations" name="Registrations" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartBox>
          </Section>
        </Card>
        <Card title="Accounts by role">
          <Section result={res.users} empty={byRole.length ? null : 'No users'}>
            <ChartBox>
              <BarChart data={byRole} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="role" tick={AXIS} tickLine={false} axisLine={false} width={96} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" name="Accounts" fill={BRAND} radius={[0, 4, 4, 0]} maxBarSize={28} />
              </BarChart>
            </ChartBox>
          </Section>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Growers and service requests by province">
          <Section result={res.regional} empty={regions.length ? null : 'No regional data yet'}>
            <ChartBox>
              <BarChart data={regions} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="province" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => v.replace(' Province', '')} />
                <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="farmer_count" name="Growers" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="service_requests" name="Service requests" fill={SECOND} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ChartBox>
          </Section>
        </Card>
        <Card title="Orders per month" subtitle="Last 12 months, excluding cancelled">
          <Section result={res.orders} empty={orderTrend.length ? null : 'No orders in the last 12 months'}>
            <ChartBox>
              <BarChart data={orderTrend} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v, n, p) => (n === 'Orders' ? [`${v} (${rwf(p.payload.revenue)})`, n] : [v, n])} />
                <Bar dataKey="orders" name="Orders" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ChartBox>
          </Section>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Grower verification">
          <Section result={res.farmers} empty={verification.length ? null : 'No grower profiles yet'}>
            <ul className="space-y-3">
              {verification.map(([s, n]) => {
                const total = res.farmers.data.total_farmers || 1;
                return (
                  <li key={s}>
                    <div className="mb-1 flex justify-between text-sm"><span className="text-slate-700">{label(s)}</span><span className="font-medium text-slate-900">{n}</span></div>
                    <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${(n / total) * 100}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          </Section>
        </Card>
        <Card title="Service requests by status">
          <Section result={res.dashboard} empty={srByStatus.length ? null : 'No service requests yet'}>
            <div className="flex flex-wrap gap-2">
              {srByStatus.map(([s, n]) => <Badge key={s} tone={s === 'completed' ? 'brand' : s === 'pending' ? 'amber' : 'slate'}>{label(s)}: {n}</Badge>)}
            </div>
          </Section>
        </Card>
        <Card title="Top products (30 days)">
          <Section result={res.dashboard} empty={d?.topProducts?.length ? null : 'No product sales in the last 30 days'}>
            <ul className="divide-y divide-slate-100 text-sm">
              {d?.topProducts?.map((p) => (
                <li key={p.id} className="flex justify-between gap-2 py-2"><span className="truncate text-slate-700">{p.name}</span><span className="shrink-0 font-medium text-slate-900">{rwf(p.revenue)}</span></li>
              ))}
            </ul>
          </Section>
        </Card>
      </div>

      <Card title="Agent performance" subtitle="Active agents" padded={false}>
        <Section result={res.agents} empty={agents.length ? null : 'No active agents'}>
          <Table head={['Agent', 'Province', 'Farm visits', 'Service requests', 'Completion', 'Reports']}>
            {agents.map((a) => (
              <tr key={a.id}>
                <Td><div className="font-medium text-slate-900">{a.full_name}</div><div className="text-xs text-slate-500">{a.email}</div></Td>
                <Td>{a.agent_profile?.province || '—'}</Td>
                <Td>{a.stats?.completed_visits ?? 0} / {a.stats?.total_visits ?? 0}</Td>
                <Td>{a.stats?.completed_service_requests ?? 0} / {a.stats?.total_service_requests ?? 0}</Td>
                <Td>{a.stats?.completion_rate_pct ?? 0}%</Td>
                <Td>{a.stats?.total_reports ?? 0}</Td>
              </tr>
            ))}
          </Table>
        </Section>
      </Card>
    </Page>
  );
}
