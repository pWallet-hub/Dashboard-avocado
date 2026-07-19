import React, { useEffect, useState } from 'react';
import { Activity, HeartPulse, Cpu, BarChart3, Database, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  getServiceHealth,
  getMonitoringHealth,
  getSystemInfo,
  getUsageStats,
  getDatabaseStatus,
} from '../../services/monitoringService';
import { useToast } from '../../components/Ui/Toast';

const PERIOD_OPTIONS = ['24h', '7d', '30d'];

function humanizeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (typeof value === 'object') return 'N/A';
  return String(value);
}

function scalarEntries(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.entries(data).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object');
}

function nestedSections(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.entries(data).filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v));
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();
  const healthy = ['ok', 'healthy', 'up', 'connected', 'true', 'pass'].includes(normalized);
  const color = healthy ? 'bg-green-200 text-green-800 ring-green-500' : 'bg-red-200 text-red-800 ring-red-500';
  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${color}`}>
      {status === undefined || status === null || status === '' ? 'Unknown' : String(status)}
    </span>
  );
}

function InfoGrid({ entries }) {
  if (!entries.length) return <p className="text-sm text-green-600">No data available.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {entries.map(([key, value]) => (
        <div key={key} className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs font-medium text-green-600">{humanizeKey(key)}</p>
          <p className="text-lg font-bold text-green-900 mt-1">
            {key.toLowerCase().includes('status') ? <StatusBadge status={value} /> : formatValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function Section({ icon: Icon, title, loading, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">{title}</h3>
        </div>
        {action}
      </div>
      {loading ? <p className="text-sm text-green-600">Loading...</p> : children}
    </div>
  );
}

const Monitoring = () => {
  const toast = useToast();

  const [serviceHealth, setServiceHealth] = useState(null);
  const [serviceHealthLoading, setServiceHealthLoading] = useState(true);

  const [monitoringHealth, setMonitoringHealth] = useState(null);
  const [monitoringHealthLoading, setMonitoringHealthLoading] = useState(true);

  const [systemInfo, setSystemInfo] = useState(null);
  const [systemInfoLoading, setSystemInfoLoading] = useState(true);

  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [period, setPeriod] = useState('24h');

  const [dbStatus, setDbStatus] = useState(null);
  const [dbStatusLoading, setDbStatusLoading] = useState(true);

  const loadServiceHealth = async () => {
    setServiceHealthLoading(true);
    try {
      const data = await getServiceHealth();
      setServiceHealth(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load service health');
    } finally {
      setServiceHealthLoading(false);
    }
  };

  const loadMonitoringHealth = async () => {
    setMonitoringHealthLoading(true);
    try {
      const data = await getMonitoringHealth();
      setMonitoringHealth(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load health status');
    } finally {
      setMonitoringHealthLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    setSystemInfoLoading(true);
    try {
      const data = await getSystemInfo();
      setSystemInfo(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load system information');
    } finally {
      setSystemInfoLoading(false);
    }
  };

  const loadUsage = async (p = period) => {
    setUsageLoading(true);
    try {
      const data = await getUsageStats(p);
      setUsage(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load usage statistics');
    } finally {
      setUsageLoading(false);
    }
  };

  const loadDbStatus = async () => {
    setDbStatusLoading(true);
    try {
      const data = await getDatabaseStatus();
      setDbStatus(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load database status');
    } finally {
      setDbStatusLoading(false);
    }
  };

  const refreshAll = () => {
    loadServiceHealth();
    loadMonitoringHealth();
    loadSystemInfo();
    loadUsage();
    loadDbStatus();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsage(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Try to find a usage time series array within the usage payload
  const usageSeries = (() => {
    if (!usage) return [];
    if (Array.isArray(usage)) return usage;
    const candidateKeys = ['data', 'series', 'timeline', 'breakdown', 'buckets', 'results'];
    for (const key of candidateKeys) {
      if (Array.isArray(usage[key])) return usage[key];
    }
    const arrProp = Object.values(usage).find((v) => Array.isArray(v));
    return arrProp || [];
  })();

  const usageSummary = usage ? scalarEntries(usage) : [];

  // Database row counts
  const dbTables = (() => {
    if (!dbStatus) return [];
    const counts = dbStatus.tables || dbStatus.counts || dbStatus.rowCounts || dbStatus.row_counts;
    if (counts && typeof counts === 'object' && !Array.isArray(counts)) {
      return Object.entries(counts).map(([table, count]) => ({ table, count }));
    }
    if (Array.isArray(counts)) return counts;
    return [];
  })();

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Activity className="h-7 w-7 mr-3 text-green-600" />
              System Monitoring
            </h2>
            <p className="text-green-600 mt-1">Health, resources, usage, and database status at a glance</p>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Health cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section icon={HeartPulse} title="Service Health" loading={serviceHealthLoading}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-700">Status:</span>
              <StatusBadge status={serviceHealth?.status || serviceHealth?.message} />
            </div>
            <InfoGrid entries={scalarEntries(serviceHealth).filter(([k]) => k !== 'status')} />
          </div>
        </Section>

        <Section icon={Activity} title="Database & System Health" loading={monitoringHealthLoading}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-700">Status:</span>
              <StatusBadge status={monitoringHealth?.status || monitoringHealth?.message} />
            </div>
            <InfoGrid entries={scalarEntries(monitoringHealth).filter(([k]) => k !== 'status')} />
            {nestedSections(monitoringHealth).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs font-semibold text-green-700 mt-3 mb-1">{humanizeKey(key)}</p>
                <InfoGrid entries={scalarEntries(value)} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* System resources */}
      <Section icon={Cpu} title="System Resources (CPU / Memory / Uptime)" loading={systemInfoLoading}>
        <InfoGrid entries={scalarEntries(systemInfo)} />
        {nestedSections(systemInfo).map(([key, value]) => (
          <div key={key} className="mt-4">
            <p className="text-xs font-semibold text-green-700 mb-2">{humanizeKey(key)}</p>
            <InfoGrid entries={scalarEntries(value)} />
          </div>
        ))}
      </Section>

      {/* Usage over time */}
      <Section
        icon={BarChart3}
        title="Request / Log Volume"
        loading={usageLoading}
        action={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            aria-label="Usage period"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        }
      >
        <InfoGrid entries={usageSummary} />
        {usageSeries.length > 0 ? (
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={Object.keys(usageSeries[0]).find((k) => ['date', 'label', 'period', 'time', 'timestamp', 'hour', 'day'].includes(k)) || Object.keys(usageSeries[0])[0]}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                {Object.keys(usageSeries[0])
                  .filter((k) => typeof usageSeries[0][k] === 'number')
                  .map((k, idx) => (
                    <Bar key={k} dataKey={k} fill={['#10B981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]} radius={[4, 4, 0, 0]} />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-green-600 mt-4">No time-series data available for this period.</p>
        )}
      </Section>

      {/* Database status */}
      <Section icon={Database} title="Database Connectivity & Row Counts" loading={dbStatusLoading}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-green-700">Connection:</span>
          <StatusBadge status={dbStatus?.status || dbStatus?.connected} />
        </div>
        {dbTables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-green-100">
                  <th className="text-left py-2 px-3 font-semibold text-green-700">Table</th>
                  <th className="text-left py-2 px-3 font-semibold text-green-700">Row Count</th>
                </tr>
              </thead>
              <tbody>
                {dbTables.map((row, idx) => (
                  <tr key={row.table || idx} className="border-b border-green-50">
                    <td className="py-2 px-3">{humanizeKey(row.table || row.name || `table_${idx}`)}</td>
                    <td className="py-2 px-3">{formatValue(row.count ?? row.rows ?? row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-green-600">No row count data available.</p>
        )}
      </Section>
    </div>
  );
};

export default Monitoring;
