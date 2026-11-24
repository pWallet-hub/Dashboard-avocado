/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, ClipboardList, Trees, LineChart, PackageCheck, CalendarCheck, Bug, MapPin, ShoppingBag, GraduationCap,
  CloudSun, Bell, ArrowRight, TrendingUp, TrendingDown,
} from 'lucide-react';
import { getFarmerInformation } from '../../services/farmer-information';
import { listServiceRequestsForFarmerPage } from '../../services/serviceRequestsService';
import { getPriceSummary, PRICE_TYPES, labelFor } from '../../services/marketPricesService';
import { getHarvestLotSummary } from '../../services/harvestLotsService';
import { listNotifications } from '../../services/notificationsService';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, EmptyState, Spinner } from '../../components/Ui/kit';
import { serviceTypeLabel, requestStatusMeta, formatDate, currentUser, rwf } from './farmerShared';

const QUICK_ACTIONS = [
  { to: '/dashboard/farmer/HarvestingDay', icon: CalendarCheck, label: 'Book harvesting day' },
  { to: '/dashboard/farmer/PestManagement', icon: Bug, label: 'Book IPM day' },
  { to: '/dashboard/farmer/PropertyEvaluation', icon: MapPin, label: 'Property evaluation' },
  { to: '/dashboard/farmer/harvest-lots', icon: PackageCheck, label: 'Record a harvest lot' },
  { to: '/dashboard/farmer/market', icon: ShoppingBag, label: 'Buy farm inputs' },
  { to: '/dashboard/farmer/training', icon: GraduationCap, label: 'Training' },
  { to: '/dashboard/farmer/Weather', icon: CloudSun, label: 'Weather' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const OPEN_STATUSES = ['pending', 'approved', 'assigned', 'in_progress'];

const MoreLink = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
    {children} <ArrowRight className="h-4 w-4" />
  </Link>
);

const Unavailable = ({ onRetry }) => (
  <div className="py-6 text-center text-sm text-slate-500">
    Couldn&apos;t load this section.{' '}
    <button type="button" onClick={onRetry} className="font-medium text-brand-700 hover:underline">Try again</button>
  </div>
);

export default function Farmer() {
  const user = currentUser();
  const [state, setState] = useState({ loading: true });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const id = user?.id || localStorage.getItem('id');
    const [info, requests, openCount, prices, lots, notes] = await Promise.allSettled([
      getFarmerInformation(),
      id ? listServiceRequestsForFarmerPage(id, { page: 1, limit: 5 }) : Promise.reject(new Error('no user')),
      id ? Promise.all(OPEN_STATUSES.map((s) => listServiceRequestsForFarmerPage(id, { status: s, limit: 1 }))) : Promise.reject(new Error('no user')),
      getPriceSummary({ days: 30 }),
      getHarvestLotSummary(),
      listNotifications({ page: 1, limit: 4 }),
    ]);
    const ok = (r) => (r.status === 'fulfilled' ? r.value : undefined);
    const infoData = ok(info);
    setState({
      loading: false,
      profile: (infoData?.data || infoData)?.farmer_profile,
      userInfo: (infoData?.data || infoData)?.user_info,
      profileFailed: info.status === 'rejected',
      requests: ok(requests)?.data,
      requestsTotal: ok(requests)?.pagination?.total,
      openRequests: ok(openCount)?.reduce((sum, r) => sum + (r.pagination?.total || 0), 0),
      prices: ok(prices)?.summary,
      lots: ok(lots),
      notifications: ok(notes)?.data,
      unread: ok(notes)?.meta?.unreadCount,
    });
    // `user` comes from localStorage and is stable for the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { loading, profile, userInfo, requests, prices, lots, notifications } = state;
  const name = userInfo?.full_name || user?.full_name || 'Farmer';
  const farmGate = prices?.find((p) => p.price_type === 'farm_gate');
  const location = [profile?.farm_sector || profile?.sector, profile?.farm_district || profile?.district, profile?.farm_province || profile?.province].filter(Boolean).join(', ');

  return (
    <Page>
      <PageHeader icon={Home} title={`Muraho, ${name.split(' ')[0]}`} subtitle="Here is what is happening on your farm." />

      {loading ? (
        <Card><Spinner label="Loading your overview…" /></Card>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Open requests" value={state.openRequests ?? '—'} hint={state.requestsTotal !== undefined ? `${state.requestsTotal} in total` : undefined} icon={ClipboardList} tone="amber" />
            <StatCard label="My trees" value={profile?.tree_count != null ? Number(profile.tree_count).toLocaleString() : '—'} hint={profile?.farm_size ? `${profile.farm_size} ha · ${profile.avocado_type || 'variety not set'}` : 'Add farm details on your profile'} icon={Trees} />
            <StatCard
              label="Farm-gate price (30 days)"
              value={farmGate ? `${Math.round(farmGate.average_price).toLocaleString()} RWF/kg` : '—'}
              hint={farmGate?.change_pct != null ? `${farmGate.change_pct > 0 ? '+' : ''}${farmGate.change_pct}% vs previous period` : 'No recent prices'}
              icon={LineChart}
              tone="blue"
            />
            <StatCard label="Harvest recorded" value={lots ? `${Number(lots.total_kg || 0).toLocaleString()} kg` : '—'} hint={lots ? `${lots.total_lots} lots · ${rwf(lots.revenue)} sold` : undefined} icon={PackageCheck} tone="slate" />
          </StatGrid>

          <Card title="Quick actions">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Icon className="h-5 w-5" /></span>
                  {label}
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="My recent requests" actions={<MoreLink to="/dashboard/farmer/my-service-requests">All requests</MoreLink>} className="lg:col-span-2" padded={false}>
              {requests === undefined ? (
                <Unavailable onRetry={load} />
              ) : requests.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No requests yet" description="Book a harvesting day, an IPM visit or a property evaluation." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {requests.map((r) => {
                    const s = requestStatusMeta(r.status);
                    return (
                      <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{serviceTypeLabel(r.service_type)}</p>
                          <p className="text-xs text-slate-500">{r.request_number} · {formatDate(r.created_at)}</p>
                        </div>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card title="My farm" actions={<MoreLink to="/dashboard/farmer/my-farm">My farm & land</MoreLink>}>
              {state.profileFailed ? (
                <Unavailable onRetry={load} />
              ) : !profile ? (
                <EmptyState icon={Trees} title="Farm details missing" action={<Link to="/dashboard/farmer/profile" className="text-sm font-medium text-brand-700 hover:underline">Complete your profile</Link>} />
              ) : (
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Location</dt><dd className="text-right font-medium text-slate-900">{location || '—'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Size</dt><dd className="font-medium text-slate-900">{profile.farm_size ? `${profile.farm_size} ha` : '—'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Trees</dt><dd className="font-medium text-slate-900">{profile.tree_count ?? '—'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Variety</dt><dd className="font-medium text-slate-900">{profile.avocado_type || '—'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Land title (UPI)</dt><dd className="font-mono text-xs font-medium text-slate-900">{profile.upi_number || '—'}</dd></div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Profile</dt>
                    <dd><Badge tone={profile.verification_status === 'verified' ? 'brand' : profile.verification_status === 'rejected' ? 'rose' : 'amber'}>{profile.verification_status || 'pending'}</Badge></dd>
                  </div>
                </dl>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Avocado prices · last 30 days" actions={<MoreLink to="/dashboard/farmer/market-prices">Market prices</MoreLink>} padded={false}>
              {prices === undefined ? (
                <Unavailable onRetry={load} />
              ) : prices.length === 0 ? (
                <EmptyState icon={LineChart} title="No recent prices" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {prices.map((p) => {
                    const up = p.change_pct > 0;
                    const Trend = up ? TrendingUp : TrendingDown;
                    return (
                      <li key={p.price_type} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                        <span className="text-slate-700">{labelFor(PRICE_TYPES, p.price_type)}</span>
                        <span className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900">{Math.round(p.average_price).toLocaleString()} RWF/kg</span>
                          {p.change_pct != null && (
                            <span className={`inline-flex items-center gap-1 text-xs ${up ? 'text-brand-700' : 'text-rose-600'}`}>
                              <Trend className="h-3.5 w-3.5" /> {Math.abs(p.change_pct)}%
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card title="Latest notifications" actions={<MoreLink to="/dashboard/notifications">{state.unread ? `${state.unread} unread` : 'All notifications'}</MoreLink>} padded={false}>
              {notifications === undefined ? (
                <Unavailable onRetry={load} />
              ) : notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications yet" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-5 py-3">
                      <p className={`text-sm ${n.is_read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</p>
                      <p className="line-clamp-2 text-xs text-slate-500">{n.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {lots && (
            <Card title="Harvest lots" actions={<MoreLink to="/dashboard/farmer/harvest-lots">My harvest lots</MoreLink>}>
              {lots.total_lots ? (
                <div className="flex flex-wrap gap-2">
                  {(lots.by_status || []).filter((s) => s.lots > 0).map((s) => (
                    <Badge key={s.status} tone={s.status === 'rejected' ? 'rose' : s.status === 'recorded' ? 'amber' : 'brand'} className="capitalize">
                      {s.status}: {s.lots} lot{s.lots === 1 ? '' : 's'} · {Number(s.quantity_kg).toLocaleString()} kg
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">Record each harvest so buyers can trace and trust your fruit.</p>
                  <Link to="/dashboard/farmer/harvest-lots" className="inline-flex h-8 items-center gap-2 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700"><PackageCheck className="h-4 w-4" /> Record a harvest lot</Link>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </Page>
  );
}
