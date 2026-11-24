import { useCallback, useEffect, useState } from 'react';
import { TrendingUp, Plus, RefreshCw, Pencil, BarChart3, ListChecks, Scale, Target } from 'lucide-react';
import {
  listForecastsPage, createForecast, updateForecast, compareForecast, getRegionalForecast,
} from '../../services/forecastingService';
import { FarmerFarmPicker } from './DiseaseCases';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS } from '../../utils/rwanda';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

const PAGE_SIZE = 15;
const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR + 1, THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2, THIS_YEAR - 3];
const SEASONS = ['Season A (Sep–Feb)', 'Season B (Mar–Aug)', 'Full year'];
const ACCURACY = { on_track: { label: 'On track', tone: 'brand' }, over: { label: 'Over forecast', tone: 'blue' }, under: { label: 'Under forecast', tone: 'amber' } };

const kg = (n) => (n === null || n === undefined ? '—' : `${Math.round(Number(n)).toLocaleString()} kg`);
const pct = (n) => (n === null || n === undefined ? '—' : `${Number(n) > 0 ? '+' : ''}${Number(n).toFixed(1)}%`);
const target = (f) => f.farm?.farmName || [f.district, f.province].filter(Boolean).join(', ') || 'Unspecified';
const emptyCreate = () => ({
  scope: 'farm', farmer_id: '', farm_id: '', farm: null, province: '', district: '',
  forecast_year: String(THIS_YEAR), forecast_season: '', predicted_kg: '', confidence_pct: '70', basis: '', notes: '',
});

export default function Forecasting() {
  const toast = useToast();
  const [tab, setTab] = useState('forecasts');
  const [year, setYear] = useState(String(THIS_YEAR));
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [compare, setCompare] = useState([]);
  const [regional, setRegional] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const yr = year || undefined;
      const [list, cmp, reg] = await Promise.all([
        listForecastsPage({ page, limit: PAGE_SIZE, forecast_year: yr }),
        compareForecast({ forecast_year: yr }),
        getRegionalForecast({ forecast_year: year || THIS_YEAR }),
      ]);
      setRows(list.data);
      setPagination({ page: list.pagination.page || page, totalPages: list.pagination.totalPages || 1, total: list.pagination.total ?? list.data.length });
      setCompare(cmp);
      setRegional(reg);
    } catch (err) {
      setError(err.message || 'Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  }, [page, year]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [year]);

  const totalPredicted = regional.reduce((s, r) => s + (r.total_predicted_kg || 0), 0);
  const totalActual = regional.reduce((s, r) => s + (r.total_actual_kg || 0), 0);
  const onTrack = compare.filter((c) => c.accuracy_rating === 'on_track').length;

  const submitCreate = async (e) => {
    e.preventDefault();
    const f = form;
    if (f.scope === 'farm' && !f.farm_id) return toast.error('Select the farmer and farm');
    if (f.scope === 'region' && !f.province) return toast.error('Select a province');
    const predicted = Number(f.predicted_kg);
    if (f.predicted_kg === '' || !Number.isFinite(predicted) || predicted < 0) return toast.error('Predicted yield must be a positive number of kg');
    const confidence = Number(f.confidence_pct);
    if (f.confidence_pct !== '' && (!Number.isFinite(confidence) || confidence < 0 || confidence > 100)) return toast.error('Confidence must be 0–100%');

    const loc = f.scope === 'farm' ? f.farm?.location || {} : { province: f.province, district: f.district };
    const payload = {
      forecast_year: Number(f.forecast_year),
      predicted_kg: predicted,
      confidence_pct: f.confidence_pct === '' ? undefined : confidence,
      farm_id: f.scope === 'farm' ? f.farm_id : undefined,
      province: loc.province || undefined,
      district: loc.district || undefined,
      forecast_season: f.forecast_season || undefined,
      basis: f.basis.trim() || undefined,
      notes: f.notes.trim() || undefined,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    setSaving(true);
    try {
      const created = await createForecast(payload);
      toast.success(`Forecast ${created?.forecast_number || ''} created`.trim());
      setForm(null);
      if (String(payload.forecast_year) !== year) setYear(String(payload.forecast_year));
      else { setPage(1); load(); }
    } catch (err) {
      toast.error(err.message || 'Failed to create forecast');
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const f = editing;
    const predicted = Number(f.predicted_kg);
    if (f.predicted_kg === '' || !Number.isFinite(predicted) || predicted < 0) return toast.error('Predicted yield must be a positive number');
    if (f.actual_kg !== '' && (!Number.isFinite(Number(f.actual_kg)) || Number(f.actual_kg) < 0)) return toast.error('Actual harvest must be a positive number');
    const confidence = Number(f.confidence_pct);
    if (f.confidence_pct === '' || !Number.isFinite(confidence) || confidence < 0 || confidence > 100) return toast.error('Confidence must be 0–100%');
    const payload = {
      predicted_kg: predicted,
      confidence_pct: confidence,
      forecast_season: f.forecast_season,
      basis: f.basis,
      notes: f.notes,
    };
    if (f.actual_kg !== '') payload.actual_kg = Number(f.actual_kg);
    setSaving(true);
    try {
      await updateForecast(f.id, payload);
      toast.success('Forecast updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update forecast');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (f) => setEditing({
    id: f.id, number: f.forecast_number, target: target(f), predicted_kg: String(f.predicted_kg ?? ''), actual_kg: f.actual_kg ?? '',
    confidence_pct: String(f.confidence_pct ?? 70), forecast_season: f.forecast_season || '', basis: f.basis || '', notes: f.notes || '',
  });

  return (
    <Page>
      <PageHeader
        icon={TrendingUp}
        title="Harvest Forecasting"
        subtitle="Forecast avocado yields per farm or region, then record actual harvests to track accuracy."
        actions={
          <>
            <select className={inputClass + ' w-32'} aria-label="Forecast year" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All years</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={() => setForm(emptyCreate())}>New forecast</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label={`Forecasts ${year ? `(${year})` : '(all years)'}`} value={loading ? '…' : pagination.total.toLocaleString()} icon={ListChecks} tone="slate" />
        <StatCard label={`Predicted ${year || THIS_YEAR}`} value={loading ? '…' : kg(totalPredicted)} icon={Target} />
        <StatCard label={`Actual ${year || THIS_YEAR}`} value={loading ? '…' : kg(totalActual)} icon={Scale} tone="blue" />
        <StatCard label="On-track forecasts" value={loading ? '…' : `${onTrack} / ${compare.length}`} hint="Within ±10% of actual harvest" icon={BarChart3} tone="amber" />
      </StatGrid>

      <Tabs
        tabs={[
          { id: 'forecasts', label: 'Forecasts', icon: ListChecks },
          { id: 'compare', label: 'Forecast vs actual', icon: BarChart3, count: compare.length },
          { id: 'regional', label: 'By province', icon: Target },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Card padded={false}>
        {loading ? (
          <Spinner label="Loading forecasts…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : tab === 'forecasts' ? (
          rows.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No forecasts yet" description={year ? `No forecasts for ${year}.` : 'Create the first harvest forecast.'}
              action={<Button icon={Plus} onClick={() => setForm(emptyCreate())}>New forecast</Button>} />
          ) : (
            <>
              <Table head={['Forecast', 'Farm / region', 'Year', 'Predicted', 'Confidence', 'Actual', 'Variance', '']}>
                {rows.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <Td className="font-mono text-xs">{f.forecast_number}</Td>
                    <Td>
                      <p className="font-medium text-slate-900">{target(f)}</p>
                      {f.farm && f.district && <p className="text-xs text-slate-500">{f.district}</p>}
                    </Td>
                    <Td>{f.forecast_year}{f.forecast_season && <p className="text-xs text-slate-500">{f.forecast_season}</p>}</Td>
                    <Td>{kg(f.predicted_kg)}</Td>
                    <Td>{f.confidence_pct != null ? `${f.confidence_pct}%` : '—'}</Td>
                    <Td>{f.actual_kg != null ? kg(f.actual_kg) : <span className="text-slate-400">Not recorded</span>}</Td>
                    <Td>{f.variance_pct != null ? <Badge tone={Math.abs(f.variance_pct) < 10 ? 'brand' : 'amber'}>{pct(f.variance_pct)}</Badge> : '—'}</Td>
                    <Td className="text-right">
                      <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(f)} aria-label={`Edit forecast ${f.forecast_number}`}>
                        {f.actual_kg == null ? 'Record actual' : 'Edit'}
                      </Button>
                    </Td>
                  </tr>
                ))}
              </Table>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
            </>
          )
        ) : tab === 'compare' ? (
          compare.length === 0 ? (
            <EmptyState icon={BarChart3} title="Nothing to compare yet" description="Record the actual harvest on a forecast to see how accurate it was." />
          ) : (
            <Table head={['Forecast', 'Farm / region', 'Year', 'Predicted', 'Actual', 'Variance', 'Accuracy']}>
              {compare.map((f) => (
                <tr key={f.id}>
                  <Td className="font-mono text-xs">{f.forecast_number}</Td>
                  <Td>{target(f)}</Td>
                  <Td>{f.forecast_year}</Td>
                  <Td>{kg(f.predicted_kg)}</Td>
                  <Td>{kg(f.actual_kg)}</Td>
                  <Td>{pct(f.variance_pct)}</Td>
                  <Td><Badge tone={ACCURACY[f.accuracy_rating]?.tone}>{ACCURACY[f.accuracy_rating]?.label || f.accuracy_rating}</Badge></Td>
                </tr>
              ))}
            </Table>
          )
        ) : regional.length === 0 ? (
          <EmptyState icon={Target} title={`No forecasts for ${year || THIS_YEAR}`} description="Province totals appear once forecasts exist for the year." />
        ) : (
          <Table head={['Province', 'Forecasts', 'Predicted', 'Actual']}>
            {regional.map((r) => (
              <tr key={r.province || 'none'}>
                <Td className="font-medium text-slate-900">{r.province || 'Unspecified'}</Td>
                <Td>{r.farm_count}</Td>
                <Td>{kg(r.total_predicted_kg)}</Td>
                <Td>{kg(r.total_actual_kg)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Dialog open={!!form} title="New harvest forecast" onClose={() => !saving && setForm(null)} size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="forecast-form" icon={Plus} loading={saving}>Create forecast</Button>
          </>
        }>
        {form && (
          <form id="forecast-form" onSubmit={submitCreate} className="space-y-4" noValidate>
            <Tabs tabs={[{ id: 'farm', label: 'Single farm' }, { id: 'region', label: 'Region' }]} value={form.scope} onChange={(scope) => setForm({ ...form, scope })} />
            {form.scope === 'farm' ? (
              <FarmerFarmPicker farmerId={form.farmer_id} farmId={form.farm_id} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Province" required>
                  <select className={inputClass} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value, district: '' })}>
                    <option value="">Select province</option>
                    {RWANDA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="District">
                  <select className={inputClass} value={form.district} disabled={!form.province} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                    <option value="">Whole province</option>
                    {(RWANDA_DISTRICTS[form.province] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Year" required>
                <select className={inputClass} value={form.forecast_year} onChange={(e) => setForm({ ...form, forecast_year: e.target.value })}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
              <Field label="Season">
                <select className={inputClass} value={form.forecast_season} onChange={(e) => setForm({ ...form, forecast_season: e.target.value })}>
                  <option value="">—</option>
                  {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Predicted yield (kg)" required>
                <input type="number" min="0" step="1" className={inputClass} value={form.predicted_kg} onChange={(e) => setForm({ ...form, predicted_kg: e.target.value })} />
              </Field>
              <Field label="Confidence (%)">
                <input type="number" min="0" max="100" className={inputClass} value={form.confidence_pct} onChange={(e) => setForm({ ...form, confidence_pct: e.target.value })} />
              </Field>
              <Field label="Basis" className="sm:col-span-2" hint="How you estimated it, e.g. tree count × average yield per tree.">
                <input className={inputClass} value={form.basis} onChange={(e) => setForm({ ...form, basis: e.target.value })} />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!editing} title={editing ? `Forecast ${editing.number}` : ''} subtitle={editing?.target} onClose={() => !saving && setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="forecast-edit-form" loading={saving}>Save</Button>
          </>
        }>
        {editing && (
          <form id="forecast-edit-form" onSubmit={submitEdit} className="grid grid-cols-1 gap-3 sm:grid-cols-2" noValidate>
            <Field label="Predicted yield (kg)" required>
              <input type="number" min="0" className={inputClass} value={editing.predicted_kg} onChange={(e) => setEditing({ ...editing, predicted_kg: e.target.value })} />
            </Field>
            <Field label="Actual harvest (kg)" hint="Fill in after harvest to compute the variance.">
              <input type="number" min="0" className={inputClass} value={editing.actual_kg} onChange={(e) => setEditing({ ...editing, actual_kg: e.target.value })} />
            </Field>
            <Field label="Confidence (%)" required>
              <input type="number" min="0" max="100" className={inputClass} value={editing.confidence_pct} onChange={(e) => setEditing({ ...editing, confidence_pct: e.target.value })} />
            </Field>
            <Field label="Season">
              <select className={inputClass} value={editing.forecast_season} onChange={(e) => setEditing({ ...editing, forecast_season: e.target.value })}>
                <option value="">—</option>
                {[...new Set([...SEASONS, editing.forecast_season].filter(Boolean))].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Basis" className="sm:col-span-2">
              <input className={inputClass} value={editing.basis} onChange={(e) => setEditing({ ...editing, basis: e.target.value })} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </Field>
            <p className="text-xs text-slate-500 sm:col-span-2">Forecasts can only be deleted by an administrator.</p>
          </form>
        )}
      </Dialog>
    </Page>
  );
}
