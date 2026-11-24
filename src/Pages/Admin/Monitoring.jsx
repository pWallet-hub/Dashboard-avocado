import { useCallback, useEffect, useState } from 'react';
import { Activity, HeartPulse, Cpu, Database, RefreshCw, MemoryStick, Clock, BarChart3 } from 'lucide-react';
import { getMonitoringHealth, getSystemInfo, getUsageStats, getDatabaseStatus } from '../../services/monitoringService';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, EmptyState, ErrorState, Spinner, Tabs,
} from '../../components/Ui/kit';

const PERIODS = [
  { id: '24h', label: 'Last 24h' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];
const LEVEL_TONES = { error: 'bg-rose-500', warn: 'bg-amber-500', info: 'bg-blue-500', http: 'bg-slate-400', debug: 'bg-slate-300' };

const formatUptime = (sec) => {
  const s = Number(sec);
  if (!Number.isFinite(s)) return '—';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`;
};
const mb = (v) => (v === undefined || v === null ? '—' : `${Number(v).toLocaleString()} MB`);
const pct = (used, total) => (total ? Math.round((used / total) * 100) : 0);

/** Label/value rows inside a card. */
const InfoList = ({ rows }) => (
  <dl className="divide-y divide-slate-100 text-sm">
    {rows.map(([label, value]) => (
      <div key={label} className="flex items-center justify-between gap-4 py-2">
        <dt className="text-slate-500">{label}</dt>
        <dd className="min-w-0 truncate text-right font-medium text-slate-900">{value ?? '—'}</dd>
      </div>
    ))}
  </dl>
);

const Meter = ({ label, used, total }) => {
  const p = pct(used, total);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{mb(used)} / {mb(total)} ({p}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={label} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${p > 90 ? 'bg-rose-500' : p > 75 ? 'bg-amber-500' : 'bg-brand-600'}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
};

const Monitoring = () => {
  const [health, setHealth] = useState(null);
  const [system, setSystem] = useState(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);

  const [period, setPeriod] = useState('24h');
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [h, s, d] = await Promise.allSettled([getMonitoringHealth(), getSystemInfo(), getDatabaseStatus()]);
    setHealth(h.status === 'fulfilled' ? h.value : null);
    setSystem(s.status === 'fulfilled' ? s.value : null);
    setDb(d.status === 'fulfilled' ? d.value : null);
    const failed = [h, s, d].filter((r) => r.status === 'rejected');
    if (failed.length === 3) setError(failed[0].reason?.message || 'Failed to reach the API');
    setCheckedAt(new Date());
    setLoading(false);
  }, []);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    setUsageError(null);
    try {
      setUsage(await getUsageStats(period));
    } catch (err) {
      setUsageError(err.message || 'Failed to load usage');
    } finally {
      setUsageLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const refresh = () => {
    load();
    loadUsage();
  };

  const status = health?.status;
  const statusTone = status === 'healthy' ? 'brand' : status ? 'rose' : 'slate';
  const byLevel = Object.entries(usage?.byLevel || {}).sort((a, b) => b[1] - a[1]);
  const usageTotal = Number(usage?.totalRequests || 0);

  return (
    <Page>
      <PageHeader
        icon={Activity}
        title="System Monitoring"
        subtitle={checkedAt ? `Live status of the API server and database · checked ${checkedAt.toLocaleTimeString()}` : 'Live status of the API server and database'}
        actions={<Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>}
      />

      {loading && !health && !system ? (
        <Card><Spinner label="Checking system status…" /></Card>
      ) : error ? (
        <Card><ErrorState title="Could not reach the API" message={error} onRetry={load} /></Card>
      ) : (
        <>
          <StatGrid>
            <StatCard label="API status" value={<Badge tone={statusTone} className="text-sm">{status || 'unknown'}</Badge>} icon={HeartPulse} tone={status === 'healthy' ? 'brand' : 'rose'} />
            <StatCard
              label="Database"
              value={<Badge tone={health?.database?.status === 'healthy' ? 'brand' : 'rose'} className="text-sm">{health?.database?.status || db?.status || 'unknown'}</Badge>}
              hint={db?.query_time_ms !== undefined ? `Count queries took ${db.query_time_ms} ms` : undefined}
              icon={Database}
              tone="blue"
            />
            <StatCard label="Uptime" value={formatUptime(system?.uptime ?? health?.uptime)} hint="Since the API process last started" icon={Clock} tone="slate" />
            <StatCard label="Process memory (RSS)" value={mb(system?.memory?.rss)} hint={system ? `Heap ${mb(system.memory?.heap_used)} of ${mb(system.memory?.heap_total)}` : undefined} icon={MemoryStick} tone="amber" />
          </StatGrid>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Server" subtitle="API host and runtime">
              {system ? (
                <div className="space-y-5">
                  <InfoList
                    rows={[
                      ['Environment', system.env],
                      ['Platform', `${system.platform || '—'} (${system.arch || '—'})`],
                      ['Node.js', system.node_version],
                      ['CPU', system.cpu ? `${system.cpu.count} × ${system.cpu.model}` : '—'],
                    ]}
                  />
                  <Meter label="Host memory in use" used={(system.os_memory?.total || 0) - (system.os_memory?.free || 0)} total={system.os_memory?.total} />
                  <Meter label="API heap" used={system.memory?.heap_used} total={system.memory?.heap_total} />
                </div>
              ) : (
                <EmptyState icon={Cpu} title="Server details unavailable" />
              )}
            </Card>

            <Card title="Database" subtitle={db ? `${db.type || 'database'} · ${db.status || 'unknown'}` : undefined}>
              {db?.table_counts ? (
                <InfoList rows={Object.entries(db.table_counts).map(([k, v]) => [`${k.charAt(0).toUpperCase()}${k.slice(1)}`, Number(v).toLocaleString()])} />
              ) : (
                <EmptyState icon={Database} title="Database details unavailable" />
              )}
            </Card>
          </div>
        </>
      )}

      <Card
        title="Log volume"
        subtitle="Entries stored in the logs table, by level"
        actions={<Tabs tabs={PERIODS} value={period} onChange={setPeriod} />}
      >
        {usageLoading ? (
          <Spinner />
        ) : usageError ? (
          <ErrorState message={usageError} onRetry={loadUsage} />
        ) : usageTotal === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No log entries in this period"
            description="The API currently writes request logs to its console only, so request/usage volume is not recorded in the database yet."
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600"><span className="text-2xl font-semibold text-slate-900">{usageTotal.toLocaleString()}</span> entries</p>
            {byLevel.map(([lvl, count]) => (
              <div key={lvl}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize text-slate-600">{lvl}</span>
                  <span className="font-medium text-slate-900">{Number(count).toLocaleString()}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${LEVEL_TONES[lvl] || 'bg-slate-400'}`} style={{ width: `${pct(count, usageTotal)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
};

export default Monitoring;
