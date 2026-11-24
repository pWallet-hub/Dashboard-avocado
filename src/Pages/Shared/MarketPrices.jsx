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
  if (value === null || value === undefined) return <span className="text-xs text-gray-400">no prior data</span>;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500';
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

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500';

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <LineChartIcon className="h-7 w-7 mr-3 text-green-600" />
              Avocado Market Prices
            </h2>
            <p className="text-green-600 mt-1">
              What buyers are paying per kg across Rwanda&apos;s markets, so you can sell at a fair price.
            </p>
          </div>
          <div className="flex gap-2">
            {canRecord && (
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {showForm ? 'Close' : 'Record price'}
              </button>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <select className={input} value={filters.variety} onChange={(e) => setFilter('variety', e.target.value)} aria-label="Variety">
            {['Hass', 'Fuerte', 'Ettinger', 'Local'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select className={input} value={filters.district} onChange={(e) => setFilter('district', e.target.value)} aria-label="District">
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select className={input} value={filters.price_type} onChange={(e) => setFilter('price_type', e.target.value)} aria-label="Price type">
            <option value="">All price types</option>
            {PRICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Record form */}
      {canRecord && showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Record a market price observation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-sm text-gray-700">
              Price per kg (RWF) *
              <input type="number" min="1" step="1" required className={input} value={form.price_per_kg}
                onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Price type
              <select className={input} value={form.price_type} onChange={(e) => setForm({ ...form, price_type: e.target.value })}>
                {PRICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Grade
              <select className={input} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Variety
              <input className={input} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Province *
              <select className={input} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              District *
              <input required className={input} value={form.district} placeholder="e.g. Rwamagana"
                onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Market / buyer
              <input className={input} value={form.market_name} placeholder="e.g. Rwamagana Market"
                onChange={(e) => setForm({ ...form, market_name: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Source
              <input className={input} value={form.source} placeholder="e.g. Field survey"
                onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </label>
            <label className="text-sm text-gray-700">
              Date observed
              <input type="date" max={today()} className={input} value={form.price_date}
                onChange={(e) => setForm({ ...form, price_date: e.target.value })} />
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm">
              {saving ? 'Saving…' : 'Save price'}
            </button>
          </div>
        </form>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRICE_TYPES.map((t) => {
          const s = summary.find((x) => x.price_type === t.value) || {};
          return (
            <div key={t.value} className="bg-white rounded-xl shadow-lg p-5 ring-1 ring-green-100">
              <p className="text-sm text-green-600">{t.label} · national avg (30 days)</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{rwf(s.average_price)}<span className="text-sm font-normal text-gray-500"> /kg</span></p>
              <p className="text-xs text-gray-500 mt-1">
                {s.observations ? `${s.observations} observations · range ${rwf(s.min_price)} – ${rwf(s.max_price)}` : 'No observations yet'}
              </p>
              <div className="mt-2"><ChangeBadge value={s.change_pct} /></div>
            </div>
          );
        })}
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-1">Weekly average price · last 90 days</h3>
        <p className="text-sm text-gray-500 mb-4">{filters.variety}{filters.district ? ` · ${filters.district}` : ' · all districts'}</p>
        {trend.length === 0 ? (
          <p className="text-gray-500 text-sm py-10 text-center">No price data for this selection yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip formatter={(v, name) => [rwf(v), labelFor(PRICE_TYPES, name)]} labelFormatter={(d) => `Week of ${new Date(d).toLocaleDateString()}`} />
                <Legend formatter={(name) => labelFor(PRICE_TYPES, name)} />
                {visibleTypes.map((type) => (
                  <Line key={type} type="monotone" dataKey={type} stroke={LINE_COLORS[type]} strokeWidth={2} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Latest prices per market */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Latest price by market</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">District</th>
                <th className="py-2 pr-4">Market</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4 text-right">Price / kg</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {latest.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-gray-500">No recent prices.</td></tr>
              )}
              {latest.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{p.district}</td>
                  <td className="py-2 pr-4 text-gray-600">{p.market_name || '—'}</td>
                  <td className="py-2 pr-4">{labelFor(PRICE_TYPES, p.price_type)}</td>
                  <td className="py-2 pr-4">{labelFor(GRADES, p.grade)}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-green-800">{rwf(p.price_per_kg)}</td>
                  <td className="py-2 text-gray-500">{new Date(p.price_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History (staff only) */}
      {canRecord && (
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4">All observations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">District</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4 text-right">Price / kg</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Recorded by</th>
                  {canDelete && <th className="py-2" />}
                </tr>
              </thead>
              <tbody>
                {history.data.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(p.price_date).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{p.district}</td>
                    <td className="py-2 pr-4">{labelFor(PRICE_TYPES, p.price_type)}</td>
                    <td className="py-2 pr-4 text-right">{rwf(p.price_per_kg)}</td>
                    <td className="py-2 pr-4 text-gray-500">{p.source || '—'}</td>
                    <td className="py-2 pr-4 text-gray-500">{p.recorder?.full_name || '—'}</td>
                    {canDelete && (
                      <td className="py-2 text-right">
                        <button onClick={() => remove(p)} className="text-red-600 hover:text-red-800" aria-label="Delete price">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm">
            <span className="text-gray-500">
              Page {history.pagination.page || page} of {Math.max(1, history.pagination.totalPages || 1)}
            </span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border disabled:opacity-40">Previous</button>
              <button disabled={!history.pagination.hasNext} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
