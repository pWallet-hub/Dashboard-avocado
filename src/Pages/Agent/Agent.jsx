import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, CalendarClock, Users, Trees, Play, ArrowRight, RefreshCw,
  UserPlus, CalendarDays, Bug, FileText, QrCode, ShoppingBag, TrendingUp,
} from 'lucide-react';
import { listServiceRequestsForAgentPage } from '../../services/serviceRequestsService';
import { listVisitsPage } from '../../services/visitsService';
import { listFarmers } from '../../services/usersService';
import { listFarmsPage } from '../../services/farmsService';
import { statusMeta, typeLabel, uiType, formatDate } from '../Admin/serviceRequests/helpers';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, EmptyState, ErrorState, Spinner, Table, Td,
} from '../../components/Ui/kit';

const OPEN = ['approved', 'assigned', 'in_progress'];

const QUICK_ACTIONS = [
  { to: '/dashboard/agent/FarmerList', icon: UserPlus, label: 'Register a farmer' },
  { to: '/dashboard/agent/farms', icon: Trees, label: 'Register a farm' },
  { to: '/dashboard/agent/Visits', icon: CalendarClock, label: 'Schedule a farm visit' },
  { to: '/dashboard/agent/HarvestingPlan', icon: CalendarDays, label: 'Schedule harvesting' },
  { to: '/dashboard/agent/IPMRoutine', icon: Bug, label: 'Schedule IPM routine' },
  { to: '/dashboard/agent/DiseaseCases', icon: Bug, label: 'Report a disease case' },
  { to: '/dashboard/agent/Forecasting', icon: TrendingUp, label: 'Harvest forecast' },
  { to: '/dashboard/agent/ProfileAccessQR', icon: QrCode, label: 'Farmer QR access' },
  { to: '/dashboard/agent/Shop', icon: ShoppingBag, label: 'Order inputs' },
  { to: '/dashboard/agent/Report', icon: FileText, label: 'Submit a report' },
];

const fmtWhen = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Agent home: live overview of assigned work, upcoming visits and coverage. */
export default function Agent() {
  const me = localStorage.getItem('id');
  let name = '';
  try {
    name = JSON.parse(localStorage.getItem('user') || '{}')?.full_name || '';
  } catch {
    name = '';
  }

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const count = async (status) => (await listServiceRequestsForAgentPage(me, { status, limit: 1 })).pagination.total || 0;
      const [assigned, approved, inProgress, completed, recent, visits, farmers, farms] = await Promise.all([
        count('assigned'),
        count('approved'),
        count('in_progress'),
        count('completed'),
        listServiceRequestsForAgentPage(me, { limit: 50 }),
        listVisitsPage({ status: 'scheduled', limit: 50 }),
        listFarmers({ limit: 1 }),
        listFarmsPage({ limit: 1 }),
      ]);
      const now = Date.now() - 60 * 60 * 1000;
      setData({
        waiting: assigned + approved,
        inProgress,
        completed,
        openRequests: recent.data.filter((r) => OPEN.includes(r.status)).slice(0, 6),
        visits: visits.data
          .filter((v) => new Date(v.scheduled_at).getTime() >= now)
          .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
          .slice(0, 5),
        overdueVisits: visits.data.filter((v) => new Date(v.scheduled_at).getTime() < now).length,
        farmers: farmers?.meta?.pagination?.total ?? 0,
        farms: farms.pagination.total ?? 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [me]);

  useEffect(() => { load(); }, [load]);

  return (
    <Page>
      <PageHeader
        icon={LayoutDashboard}
        title={name ? `Welcome back, ${name.split(' ')[0]}` : 'Overview'}
        subtitle="Your assigned service requests, upcoming farm visits and quick actions."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>}
      />

      {error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : !data ? (
        <Spinner />
      ) : (
        <>
          <StatGrid>
            <StatCard label="Requests to start" value={data.waiting} icon={ClipboardList} tone="amber" hint="Approved / assigned to you" />
            <StatCard label="In progress" value={data.inProgress} icon={Play} tone="blue" hint={`${data.completed} completed so far`} />
            <StatCard label="Upcoming visits" value={data.visits.length} icon={CalendarClock} hint={data.overdueVisits ? `${data.overdueVisits} past due — update them` : 'Scheduled'} tone={data.overdueVisits ? 'rose' : 'brand'} />
            <StatCard label="Farmers · farms" value={`${data.farmers} · ${data.farms}`} icon={Users} tone="slate" hint="Registered on the platform" />
          </StatGrid>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card
              className="lg:col-span-3"
              title="Open service requests"
              subtitle="Assigned to you and not yet completed"
              actions={<Link to="/dashboard/agent/ServiceHistory"><Button size="sm" variant="ghost">View all <ArrowRight className="h-4 w-4" /></Button></Link>}
              padded={false}
            >
              {data.openRequests.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No open requests" description="New assignments from the admin team will appear here." />
              ) : (
                <Table head={['Request', 'Type', 'Status', 'Date']}>
                  {data.openRequests.map((r) => {
                    const st = statusMeta(r.status);
                    return (
                      <tr key={r.id}>
                        <Td className="font-medium text-slate-900">{r.request_number}</Td>
                        <Td>{typeLabel(uiType(r.service_type))}</Td>
                        <Td><Badge tone={st.tone}>{st.label}</Badge></Td>
                        <Td>{formatDate(r.scheduled_date || r.requested_date)}</Td>
                      </tr>
                    );
                  })}
                </Table>
              )}
            </Card>

            <Card
              className="lg:col-span-2"
              title="Upcoming farm visits"
              actions={<Link to="/dashboard/agent/Visits"><Button size="sm" variant="ghost">All visits <ArrowRight className="h-4 w-4" /></Button></Link>}
              padded={false}
            >
              {data.visits.length === 0 ? (
                <EmptyState icon={CalendarClock} title="No visits scheduled" action={<Link to="/dashboard/agent/Visits"><Button size="sm" variant="secondary">Schedule a visit</Button></Link>} />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.visits.map((v) => (
                    <li key={v.id} className="flex items-start justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{v.farm?.farmName || 'Farm visit'}</p>
                        <p className="truncate text-xs text-slate-500">{v.purpose || 'No purpose noted'}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-600">{fmtWhen(v.scheduled_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      <Card title="Quick actions">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to + label}
              to={to}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon className="h-5 w-5 shrink-0 text-brand-600" />
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </Page>
  );
}
