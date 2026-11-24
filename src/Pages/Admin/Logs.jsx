import { useCallback, useEffect, useState } from 'react';
import { FileText, Download, Trash2, RefreshCw, AlertCircle, AlertTriangle, Info, CalendarDays } from 'lucide-react';
import { listLogs, exportLogs, getLogStatistics, cleanupLogs } from '../../services/logsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const LEVELS = ['error', 'warn', 'info', 'http', 'debug'];
const LEVEL_TONES = { error: 'rose', warn: 'amber', info: 'blue', http: 'slate', debug: 'slate' };
const PAGE_SIZE = 25;

const fmtTime = (t) => (t ? new Date(t).toLocaleString() : '—');
const metaSummary = (meta) => {
  if (!meta || typeof meta !== 'object') return '';
  const parts = [meta.method, meta.url, meta.status, meta.duration, meta.role].filter((v) => v !== undefined && v !== null && v !== '');
  return parts.join(' · ');
};

const Logs = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);

  const [exportRange, setExportRange] = useState({ start_date: '', end_date: '' });
  const [exporting, setExporting] = useState(false);
  const [cleanupDays, setCleanupDays] = useState('30');
  const [cleaning, setCleaning] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listLogs({ page, limit: PAGE_SIZE, level: level || undefined });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, level]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getLogStatistics());
    } catch (err) {
      toast.error(err.message || 'Failed to load log statistics');
    }
  }, [toast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = () => {
    loadLogs();
    loadStats();
  };

  const handleExport = async () => {
    if (exportRange.start_date && exportRange.end_date && exportRange.start_date > exportRange.end_date) {
      toast.error('Start date must be before end date');
      return;
    }
    setExporting(true);
    try {
      const blob = await exportLogs({
        level: level || undefined,
        start_date: exportRange.start_date || undefined,
        // Include the whole end day.
        end_date: exportRange.end_date ? `${exportRange.end_date}T23:59:59` : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Logs exported');
    } catch (err) {
      toast.error(err.message || 'Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  const handleCleanup = async () => {
    const days = Number(cleanupDays);
    if (!Number.isInteger(days) || days < 1) {
      toast.error('Enter a whole number of days (1 or more)');
      return;
    }
    const ok = await confirm(`Delete all logs older than ${days} day${days === 1 ? '' : 's'}? This cannot be undone.`, {
      title: 'Clean up logs',
      confirmLabel: 'Delete logs',
    });
    if (!ok) return;
    setCleaning(true);
    try {
      const res = await cleanupLogs(days);
      toast.success(`${Number(res?.deleted_count ?? 0).toLocaleString()} log entries deleted`);
      setPage(1);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Failed to clean up logs');
    } finally {
      setCleaning(false);
    }
  };

  const n = (v) => (v === undefined || v === null ? '—' : Number(v).toLocaleString());
  const nothingStored = stats && Number(stats.total_count) === 0;

  return (
    <Page>
      <PageHeader
        icon={FileText}
        title="System Logs"
        subtitle="Application log entries stored by the API"
        actions={<Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>}
      />

      <StatGrid>
        <StatCard label="Total entries" value={n(stats?.total_count)} hint={stats ? `${n(stats.today_count)} today · ${n(stats.last_7_days)} last 7 days` : undefined} icon={FileText} tone="slate" />
        <StatCard label="Errors" value={n(stats?.error_count)} icon={AlertCircle} tone="rose" />
        <StatCard label="Warnings" value={n(stats?.warn_count)} icon={AlertTriangle} tone="amber" />
        <StatCard label="Info" value={n(stats?.info_count)} hint={stats ? `${n(stats.debug_count)} debug` : undefined} icon={Info} tone="blue" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <select
            className={`${inputClass} sm:w-48`}
            aria-label="Filter by level"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">Newest first · click a row for details</span>
        </div>

        {loading ? (
          <Spinner label="Loading logs…" />
        ) : error ? (
          <ErrorState message={error} onRetry={loadLogs} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={level ? `No ${level} entries` : 'No log entries stored'}
            description={
              nothingStored
                ? 'The API currently writes its logs to the server console only, so nothing has been recorded in the database yet.'
                : 'Try another level filter.'
            }
          />
        ) : (
          <>
            <Table head={['Time', 'Level', 'Message', 'Details']}>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelected(log)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(log)}
                  tabIndex={0}
                >
                  <Td className="text-slate-500">{fmtTime(log.timestamp)}</Td>
                  <Td><Badge tone={LEVEL_TONES[log.level] || 'slate'}>{log.level || 'unknown'}</Badge></Td>
                  <Td className="max-w-md truncate text-slate-900">{log.message}</Td>
                  <Td className="max-w-xs truncate font-mono text-xs text-slate-500">{metaSummary(log.meta) || '—'}</Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Export CSV" subtitle="Uses the level filter above plus an optional date range">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="From">
              <input type="date" className={inputClass} value={exportRange.start_date} onChange={(e) => setExportRange((r) => ({ ...r, start_date: e.target.value }))} />
            </Field>
            <Field label="To">
              <input type="date" className={inputClass} value={exportRange.end_date} onChange={(e) => setExportRange((r) => ({ ...r, end_date: e.target.value }))} />
            </Field>
          </div>
          <Button className="mt-4" icon={Download} loading={exporting} onClick={handleExport}>Download CSV</Button>
        </Card>

        <Card title="Clean up" subtitle="Permanently delete old log entries">
          <Field label="Delete entries older than (days)">
            <input type="number" min="1" step="1" className={inputClass} value={cleanupDays} onChange={(e) => setCleanupDays(e.target.value)} />
          </Field>
          <Button className="mt-4" variant="danger" icon={Trash2} loading={cleaning} onClick={handleCleanup}>Delete old logs</Button>
        </Card>
      </div>

      {selected && (
        <Dialog title="Log entry" subtitle={fmtTime(selected.timestamp)} onClose={() => setSelected(null)} size="lg">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone={LEVEL_TONES[selected.level] || 'slate'}>{selected.level}</Badge>
              <span className="inline-flex items-center gap-1 text-slate-500"><CalendarDays className="h-4 w-4" />{fmtTime(selected.timestamp)}</span>
            </div>
            <p className="break-words text-slate-900">{selected.message}</p>
            {selected.meta ? (
              <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(selected.meta, null, 2)}</pre>
            ) : (
              <p className="text-slate-500">No extra details.</p>
            )}
          </div>
        </Dialog>
      )}
    </Page>
  );
};

export default Logs;
