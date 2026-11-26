import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, ClipboardList, Trees, LineChart, PackageCheck, CalendarCheck, Bug, MapPin, ShoppingBag, GraduationCap,
  CloudSun, Bell, ArrowRight, TrendingUp, TrendingDown, Sparkles, Compass, Phone, UserCheck, Lightbulb, IdCard,
} from 'lucide-react';
import { getFarmerInformation } from '../../services/farmer-information';
import { listServiceRequestsForFarmerPage } from '../../services/serviceRequestsService';
import { getPriceSummary, PRICE_TYPES, labelFor } from '../../services/marketPricesService';
import { getHarvestLotSummary } from '../../services/harvestLotsService';
import { listNotifications } from '../../services/notificationsService';
import { listOpportunities, getOpportunityInsights, opportunityTypeLabel } from '../../services/opportunitiesService';
import { getNearby, facilityTypeLabel } from '../../services/facilitiesService';
import ProfileCompletion from '../../components/Profile/ProfileCompletion';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, EmptyState, Spinner } from '../../components/Ui/kit';
import { serviceTypeLabel, requestStatusMeta, formatDate, currentUser, rwf } from './farmerShared';

const QUICK_ACTIONS = [
  { to: '/dashboard/farmer/HarvestingDay', icon: CalendarCheck, label: 'Book a harvest' },
  { to: '/dashboard/farmer/PestManagement', icon: Bug, label: 'Book IPM day' },
  { to: '/dashboard/farmer/PropertyEvaluation', icon: MapPin, label: 'Property evaluation' },
  { to: '/dashboard/farmer/harvest-lots', icon: PackageCheck, label: 'Record a harvest lot' },
  { to: '/dashboard/farmer/nearby', icon: Compass, label: 'Near my farm' },
  { to: '/dashboard/farmer/opportunities', icon: Sparkles, label: 'Opportunities' },
  { to: '/dashboard/farmer/market', icon: ShoppingBag, label: 'Buy farm inputs' },
  { to: '/dashboard/farmer/membership-card', icon: IdCard, label: 'My membership card' },
  { to: '/dashboard/farmer/training', icon: GraduationCap, label: 'Training' },
  { to: '/dashboard/farmer/Weather', icon: CloudSun, label: 'Weather' },
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
    const [info, requests, openCount, prices, lots, notes, opps, insights, nearby] = await Promise.allSettled([
      getFarmerInformation(),
      id ? listServiceRequestsForFarmerPage(id, { page: 1, limit: 5 }) : Promise.reject(new Error('no user')),
      id ? Promise.all(OPEN_STATUSES.map((s) => listServiceRequestsForFarmerPage(id, { status: s, limit: 1 }))) : Promise.reject(new Error('no user')),
      getPriceSummary({ days: 30 }),
      getHarvestLotSummary(),
      listNotifications({ page: 1, limit: 4 }),
      listOpportunities({ page: 1, limit: 4 }),
      getOpportunityInsights(),
      getNearby({ limit: 1 }),
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
      prices: ok(prices)?.summary?.filter((p) => p.average_price != null),
      lots: ok(lots),
      notifications: ok(notes)?.data,
      unread: ok(notes)?.meta?.unreadCount,
      opportunities: ok(opps)?.data,
      opportunitiesTotal: ok(opps)?.pagination?.total,
      insights: ok(insights)?.insights,
      nearby: ok(nearby),
      nearbyError: nearby.status === 'rejected' ? nearby.reason?.message : null,
    });
    // `user` comes from localStorage and is stable for the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { loading, profile, userInfo, requests, prices, lots, notifications, opportunities, insights, nearby } = state;
  const nearestAgent = nearby?.agents?.[0];
  const nearestPlaces = nearby
    ? Object.values(nearby.facilities || {}).map((list) => list[0]).filter(Boolean).sort((a, b) => a.distance_km - b.distance_km).slice(0, 4)
    : [];
  const name = userInfo?.full_name || user?.full_name || 'Farmer';
  const farmGate = prices?.find((p) => p.price_type === 'farm_gate');
  const location = [profile?.farm_sector || profile?.sector, profile?.farm_district || profile?.district, profile?.farm_province || profile?.province].filter(Boolean).join(', ');

  return (
    <Page>
      <PageHeader icon={Home} title={`Muraho, ${name.split(' ')[0]}`} subtitle="Here is what is happening on your farm." />
      <ProfileCompletion compact />

      {loading ? (
        <Card><Spinner label="Loading your overview…" /></Card>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Open requests" value={state.openRequests ?? '—'} hint={state.requestsTotal !== undefined ? `${state.requestsTotal} in total` : undefined} icon={ClipboardList} tone="amber" />
            <StatCard label="My trees" value={profile?.tree_count != null ? Number(profile.tree_count).toLocaleString() : '—'} hint={profile?.farm_size ? `${profile.farm_size} ha · ${profile.avocado_type || 'variety not set'}` : 'Add farm details on your profile'} icon={Trees} />
            <StatCard
              label="Farm-gate price (30 days)"
              value={farmGate?.average_price != null ? `${Math.round(farmGate.average_price).toLocaleString()} RWF/kg` : '—'}
              hint={farmGate?.change_pct != null ? `${farmGate.change_pct > 0 ? '+' : ''}${farmGate.change_pct}% vs previous period` : 'No recent prices'}
              icon={LineChart}
              tone="blue"
            />
            <StatCard label="Harvest recorded" value={lots ? `${Number(lots.total_kg || 0).toLocaleString()} kg` : '—'} hint={lots ? `${lots.total_lots} lots · ${rwf(lots.revenue)} sold` : undefined} icon={PackageCheck} tone="slate" />
          </StatGrid>

          <Card title="Quick actions">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Icon className="h-5 w-5" /></span>
                  {label}
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card
              title="Opportunities for you"
              subtitle="Buyers, contracts, grants and trainings open in your area"
              actions={<MoreLink to="/dashboard/farmer/opportunities">{state.opportunitiesTotal ? `All ${state.opportunitiesTotal}` : 'All opportunities'}</MoreLink>}
              className="lg:col-span-2"
              padded={false}
            >
              {opportunities === undefined && insights === undefined ? (
                <Unavailable onRetry={load} />
              ) : !opportunities?.length && !insights?.length ? (
                <EmptyState icon={Sparkles} title="No open opportunities right now" description="We will notify you when a buyer, grant or training is posted for your area." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(opportunities || []).map((o) => (
                    <li key={o.id}>
                      <Link to="/dashboard/farmer/opportunities" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{o.title}</p>
                          <p className="text-xs text-slate-500">
                            {opportunityTypeLabel(o.type)}
                            {o.price_per_kg ? ` · ${Number(o.price_per_kg).toLocaleString()} RWF/kg` : ''}
                            {o.deadline ? ` · until ${formatDate(o.deadline)}` : ''}
                          </p>
                        </div>
                        {o.my_interest ? <Badge tone="brand">Interested</Badge> : <Badge tone="amber">New</Badge>}
                      </Link>
                    </li>
                  ))}
                  {(insights || []).slice(0, 2).map((i) => (
                    <li key={`${i.price_type}-${i.district}`} className="flex items-start gap-3 px-5 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Lightbulb className="h-4 w-4" /></span>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">Better {labelFor(PRICE_TYPES, i.price_type).toLowerCase()} price in {i.district}:</span>{' '}
                        {Math.round(i.average_price).toLocaleString()} RWF/kg, {i.difference_pct}% above {i.compared_to === 'your_district' ? 'your district' : 'the national average'} (last 30 days).
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Near my farm" actions={<MoreLink to="/dashboard/farmer/nearby">See all</MoreLink>} padded={false}>
              {!nearby ? (
                <div className="px-5 py-6 text-sm text-slate-500">
                  {state.nearbyError || 'Couldn\u2019t load nearby services.'}{' '}
                  <Link to="/dashboard/farmer/nearby" className="font-medium text-brand-700 hover:underline">Use my current location</Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {nearestAgent ? (
                    <li className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><UserCheck className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{nearestAgent.full_name}</p>
                          <p className="text-xs text-slate-500">Your nearest agent · {nearestAgent.district}</p>
                        </div>
                      </div>
                      {nearestAgent.phone && (
                        <a href={`tel:${nearestAgent.phone}`} aria-label={`Call ${nearestAgent.full_name}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"><Phone className="h-4 w-4" /></a>
                      )}
                    </li>
                  ) : (
                    <li className="px-5 py-3 text-sm text-slate-500">No agent found for your area yet.</li>
                  )}
                  {nearestPlaces.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{f.name}</p>
                        <p className="text-xs text-slate-500">{facilityTypeLabel(f.type)}</p>
                      </div>
                      <span className="shrink-0 font-medium text-slate-700">{f.distance_km < 1 ? '< 1' : f.distance_km} km</span>
                    </li>
                  ))}
                  {!nearestPlaces.length && (
                    <li className="px-5 py-3 text-sm text-slate-500">Markets and collection centres will appear here once they are registered.</li>
                  )}
                </ul>
              )}
            </Card>
          </div>

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

            <Card title="My farm" actions={<MoreLink to="/dashboard/farmer/my-farm">My farms</MoreLink>}>
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
