import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Plus, Trash2, X, LineChart as LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import {
  PRICE_TYPES,
  GRADES,
  labelFor,
  listMarketPrices,
  getLatestPrices,
  getPriceSummary,
  getPriceTrends,
  createMarketPrice,
  deleteMarketPrice,
  pivotTrendSeries,
} from '../../services/marketPricesService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, StatGrid, Badge, Button, Field, inputClass, EmptyState, Table, Td } from '../../components/Ui/kit';

const LINE_COLORS = { farm_gate: '#15803d', wholesale: '#2563eb', retail: '#d97706', export: '#7c3aed' };
const PROVINCES = ['Kigali City', 'Eastern Province', 'Northern Province', 'Southern Province', 'Western Province'];
const rwf = (n) => (n === null || n === undefined ? '—' : `${Math.round(n).toLocaleString()} RWF`);
const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  price_per_kg: '',
  price_type: 'farm_gate',
  grade: 'grade_a',
  variety: 'Hass',
  province: 'Eastern Province',
  district: '',
  market_name: '',
  source: '',
  price_date: today(),
});

const ChangeBadge = ({ value }) => {
  if (value === null || value === undefined) return <span className="text-xs text-slate-400">No prior data</span>;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const color = value > 0 ? 'text-brand-700' : value < 0 ? 'text-rose-600' : 'text-slate-500';
  return (
    <span className={`inline-flex items-center text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5 mr-1" />
      {value > 0 ? '+' : ''}
      {value}% vs previous 30 days
    </span>
  );
};

/**
 * Market price information (e-Soko style). Everyone can read prices;
 * admins and agents can record them; only admins can delete.
 */
const MarketPrices = ({ role = 'farmer' }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const canRecord = role === 'admin' || role === 'agent';
  const canDelete = role === 'admin';

  const [filters, setFilters] = useState({ variety: 'Hass', district: '', price_type: '' });
  const [summary, setSummary] = useState([]);
  const [trend, setTrend] = useState([]);
  const [latest, setLatest] = useState([]);
  const [history, setHistory] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, l, h] = await Promise.all([
        getPriceSummary({ variety: filters.variety }),
        getPriceTrends({ ...filters, days: 90, interval: 'week' }),
        getLatestPrices(filters),
        listMarketPrices({ ...filters, page, limit: 10 }),
      ]);
      setSummary(s.summary || []);
      setTrend(pivotTrendSeries(t.series));
      setLatest(l);
      setHistory(h);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const districts = useMemo(() => [...new Set(latest.map((p) => p.district))].sort(), [latest]);
  const visibleTypes = filters.price_type ? [filters.price_type] : PRICE_TYPES.map((t) => t.value);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMarketPrice(form);
      toast.success('Price recorded');
      setForm(emptyForm());
      setShowForm(false);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (price) => {
    const ok = await confirm(`Delete the ${labelFor(PRICE_TYPES, price.price_type)} price for ${price.district} on ${new Date(price.price_date).toLocaleDateString()}?`, {
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteMarketPrice(price.id);
      toast.success('Price deleted');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const input = inputClass;

  return (
    <Page>
      <PageHeader
        icon={LineChartIcon}
        title="Avocado Market Prices"
        subtitle="What buyers are paying per kg across Rwanda's markets, so you can sell at a fair price."
        actions={
          <>
            {canRecord && (
              <Button icon={showForm ? X : Plus} onClick={() => setShowForm((v) => !v)}>
                {showForm ? 'Close' : 'Record price'}
              </Button>
            )}
            <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>
              Refresh
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <Field label="Variety">
          <select className={input} value={filters.variety} onChange={(e) => setFilter('variety', e.target.value)} aria-label="Variety">
            {['Hass', 'Fuerte', 'Ettinger', 'Local'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="District">
          <select className={input} value={filters.district} onChange={(e) => setFilter('district', e.target.value)} aria-label="District">
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Price type">
          <select className={input} value={filters.price_type} onChange={(e) => setFilter('price_type', e.target.value)} aria-label="Price type">
            <option value="">All price types</option>
            {PRICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Record form */}
      {canRecord && showForm && (
        <Card title="Record a market price observation" subtitle="Prices are in RWF per kilogram.">
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Price per kg (RWF)" required>
                <input type="number" min="1" step="1" required className={input} value={form.price_per_kg}
                  onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
              </Field>
              <Field label="Price type">
                <select className={input} value={form.price_type} onChange={(e) => setForm({ ...form, price_type: e.target.value })}>
                  {PRICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Grade">
                <select className={input} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                  {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
              <Field label="Variety">
                <input className={input} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
              </Field>
              <Field label="Province" required>
                <select className={input} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="District" required>
                <input required className={input} value={form.district} placeholder="e.g. Rwamagana"
                  onChange={(e) => setForm({ ...form, district: e.target.value })} />
              </Field>
              <Field label="Market / buyer">
                <input className={input} value={form.market_name} placeholder="e.g. Rwamagana Market"
                  onChange={(e) => setForm({ ...form, market_name: e.target.value })} />
              </Field>
              <Field label="Source">
                <input className={input} value={form.source} placeholder="e.g. Field survey"
                  onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </Field>
              <Field label="Date observed">
                <input type="date" max={today()} className={input} value={form.price_date}
                  onChange={(e) => setForm({ ...form, price_date: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{saving ? 'Saving…' : 'Save price'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Summary cards */}
      <StatGrid>
        {PRICE_TYPES.map((t) => {
          const s = summary.find((x) => x.price_type === t.value) || {};
          return (
            <div key={t.value} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: LINE_COLORS[t.value] }} />
                <p className="text-sm font-medium text-slate-500">{t.label}</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {rwf(s.average_price)}<span className="text-sm font-normal text-slate-500"> /kg</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {s.observations ? `National avg, 30 days · ${s.observations} obs · ${rwf(s.min_price)} – ${rwf(s.max_price)}` : 'No observations yet'}
              </p>
              <div className="mt-2"><ChangeBadge value={s.change_pct} /></div>
            </div>
          );
        })}
      </StatGrid>

      {/* Trend chart */}
      <Card title="Weekly average price · last 90 days" subtitle={`${filters.variety}${filters.district ? ` · ${filters.district}` : ' · all districts'}`}>
        {trend.length === 0 ? (
          <EmptyState icon={LineChartIcon} title="No price data yet" description="No observations match this selection in the last 90 days." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 16, left: 4, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,.08)' }}
                  formatter={(v, name) => [rwf(v), labelFor(PRICE_TYPES, name)]}
                  labelFormatter={(d) => `Week of ${new Date(d).toLocaleDateString()}`}
                />
                <Legend iconType="circle" formatter={(name) => <span className="text-sm text-slate-600">{labelFor(PRICE_TYPES, name)}</span>} />
                {visibleTypes.map((type) => (
                  <Line key={type} type="monotone" dataKey={type} stroke={LINE_COLORS[type]} strokeWidth={2.5} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Latest prices per market */}
      <Card title="Latest price by market" padded={false}>
        {latest.length === 0 ? (
          <EmptyState icon={LineChartIcon} title="No recent prices" />
        ) : (
          <Table head={['District', 'Market', 'Type', 'Grade', 'Price / kg', 'Date']}>
            {latest.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{p.district}</Td>
                <Td className="text-slate-500">{p.market_name || '—'}</Td>
                <Td><Badge tone={p.price_type === 'export' ? 'blue' : 'slate'}>{labelFor(PRICE_TYPES, p.price_type)}</Badge></Td>
                <Td>{labelFor(GRADES, p.grade)}</Td>
                <Td className="font-semibold text-slate-900">{rwf(p.price_per_kg)}</Td>
                <Td className="text-slate-500">{new Date(p.price_date).toLocaleDateString()}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* History (staff only) */}
      {canRecord && (
        <Card title="All observations" padded={false}>
          <Table head={['Date', 'District', 'Type', 'Price / kg', 'Source', 'Recorded by', ...(canDelete ? [''] : [])]}>
            {history.data.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td>{new Date(p.price_date).toLocaleDateString()}</Td>
                <Td>{p.district}</Td>
                <Td>{labelFor(PRICE_TYPES, p.price_type)}</Td>
                <Td className="font-medium text-slate-900">{rwf(p.price_per_kg)}</Td>
                <Td className="text-slate-500">{p.source || '—'}</Td>
                <Td className="text-slate-500">{p.recorder?.full_name || '—'}</Td>
                {canDelete && (
                  <Td className="text-right">
                    <button onClick={() => remove(p)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete price">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                )}
              </tr>
            ))}
          </Table>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
            <span className="text-slate-500">
              Page {history.pagination.page || page} of {Math.max(1, history.pagination.totalPages || 1)}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={!history.pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </Card>
      )}
    </Page>
  );
};

export default MarketPrices;
