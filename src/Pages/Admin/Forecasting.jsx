import { useState, useEffect, useCallback } from 'react';
import { Map as MapIcon, RefreshCw, TrendingUp, Scale, Target, Plus, ClipboardCheck, Trash2, LineChart } from 'lucide-react';
import { getRegionalForecast, listForecastsPage, createForecast, updateForecast, deleteForecast } from '../../services/forecastingService';
import { listFarmsPage } from '../../services/farmsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR + 1, THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2, THIS_YEAR - 3];
const kg = (n) => (n === null || n === undefined ? '—' : `${Math.round(Number(n)).toLocaleString()} kg`);
const pct = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : `${Number(n) > 0 ? '+' : ''}${Number(n).toFixed(1)}%`);
const varianceTone = (v) => (v === null || v === undefined ? 'slate' : Math.abs(v) < 10 ? 'brand' : v > 0 ? 'blue' : 'amber');

const emptyForecast = (year) => ({ farm_id: '', province: '', district: '', forecast_year: String(year), forecast_season: '', predicted_kg: '', confidence_pct: '70', basis: '', notes: '' });

/** Admin view of harvest forecasts: regional totals per province plus every individual forecast. */
const Forecasting = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [year, setYear] = useState(THIS_YEAR);
  const [regions, setRegions] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farms, setFarms] = useState([]);
  const [dialog, setDialog] = useState(null); // { mode: 'create' | 'actual', item?, values }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [regional, list] = await Promise.all([
        getRegionalForecast({ forecast_year: year }),
        listForecastsPage({ forecast_year: year, page, limit: 15 }),
      ]);
      setRegions(regional);
      setForecasts(list.data);
      setPagination(list.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  }, [year, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = regions.reduce(
    (acc, r) => ({ predicted: acc.predicted + Number(r.total_predicted_kg || 0), actual: acc.actual + Number(r.total_actual_kg || 0) }),
    { predicted: 0, actual: 0 }
  );

  const openCreate = () => {
    setDialog({ mode: 'create', values: emptyForecast(year) });
    if (farms.length === 0) {
      listFarmsPage({ limit: 100 })
        .then((r) => setFarms(r.data.filter((f) => !f.archived_at)))
        .catch(() => toast.error('Could not load farms'));
    }
  };

  const setValue = (k, v) => setDialog((d) => ({ ...d, values: { ...d.values, [k]: v } }));

  const pickFarm = (id) => {
    const farm = farms.find((f) => f.id === id);
    setDialog((d) => ({
      ...d,
      values: { ...d.values, farm_id: id, province: farm?.location?.province || d.values.province, district: farm?.location?.district || d.values.district },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = dialog.values;
    setBusy(true);
    try {
      if (dialog.mode === 'create') {
        const predicted = Number(v.predicted_kg);
        const confidence = Number(v.confidence_pct);
        if (v.predicted_kg === '' || Number.isNaN(predicted) || predicted < 0) throw new Error('Enter the predicted harvest in kg');
        if (Number.isNaN(confidence) || confidence < 0 || confidence > 100) throw new Error('Confidence must be between 0 and 100');
        if (!v.farm_id && !v.province.trim()) throw new Error('Choose a farm or enter at least a province');
        const payload = { forecast_year: Number(v.forecast_year), predicted_kg: predicted, confidence_pct: confidence };
        ['farm_id', 'province', 'district', 'forecast_season', 'basis', 'notes'].forEach((k) => {
          if (v[k].trim()) payload[k] = v[k].trim();
        });
        await createForecast(payload);
        toast.success('Forecast created');
        if (Number(v.forecast_year) !== year) setYear(Number(v.forecast_year));
      } else {
        const actual = Number(v.actual_kg);
        if (v.actual_kg === '' || Number.isNaN(actual) || actual < 0) throw new Error('Enter the actual harvest in kg');
        await updateForecast(dialog.item.id, { actual_kg: actual, ...(v.notes.trim() ? { notes: v.notes.trim() } : {}) });
        toast.success('Actual harvest recorded');
      }
      setDialog(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save forecast');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (f) => {
    const ok = await confirm(`Delete forecast ${f.forecast_number}? This cannot be undone.`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteForecast(f.id);
      toast.success('Forecast deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete forecast');
    }
  };

  const v = dialog?.values;
  const variance = totals.predicted ? ((totals.actual - totals.predicted) / totals.predicted) * 100 : null;

  return (
    <Page>
      <PageHeader
        icon={MapIcon}
        title="Regional Forecasting"
        subtitle="Predicted vs actual avocado harvest by province"
        actions={
          <>
            <select className={inputClass + ' w-auto'} aria-label="Forecast year" value={year} onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={openCreate}>New forecast</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label={`Predicted ${year}`} value={kg(totals.predicted)} icon={TrendingUp} />
        <StatCard label={`Actual ${year}`} value={kg(totals.actual)} icon={Scale} tone="blue" hint={totals.actual ? undefined : 'No actual harvests recorded yet'} />
        <StatCard label="Variance" value={totals.actual ? pct(variance) : '—'} icon={Target} tone="amber" hint="Actual vs predicted" />
        <StatCard label="Forecasts" value={(pagination.total ?? 0).toLocaleString()} icon={LineChart} tone="slate" hint={`${regions.length} province${regions.length === 1 ? '' : 's'} reporting`} />
      </StatGrid>

      {loading ? (
        <Card><Spinner label="Loading forecasts…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : (
        <>
          <Card title="By province" padded={false}>
            {regions.length === 0 ? (
              <EmptyState icon={MapIcon} title={`No forecasts for ${year}`} description="Forecasts created by agents or admins will be aggregated here." />
            ) : (
              <Table head={['Province', 'Predicted', 'Actual', 'Variance', 'Farm forecasts']}>
                {regions.map((r) => {
                  const p = Number(r.total_predicted_kg || 0);
                  const a = Number(r.total_actual_kg || 0);
                  const vr = p && a ? ((a - p) / p) * 100 : null;
                  return (
                    <tr key={r.province || 'unknown'}>
                      <Td className="font-medium text-slate-900">{r.province || 'Unspecified'}</Td>
                      <Td>{kg(p)}</Td>
                      <Td>{a ? kg(a) : '—'}</Td>
                      <Td>{vr === null ? '—' : <Badge tone={varianceTone(vr)}>{pct(vr)}</Badge>}</Td>
                      <Td>{r.farm_count ?? 0}</Td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </Card>

          <Card title={`All forecasts · ${year}`} padded={false}>
            {forecasts.length === 0 ? (
              <EmptyState icon={LineChart} title="No forecasts" description="Create a forecast to start tracking expected harvests." />
            ) : (
              <>
                <Table head={['Forecast', 'Farm / region', 'Season', 'Predicted', 'Confidence', 'Actual', 'Variance', '']}>
                  {forecasts.map((f) => (
                    <tr key={f.id}>
                      <Td className="font-mono text-xs">{f.forecast_number}</Td>
                      <Td>
                        <div className="font-medium text-slate-900">{f.farm?.farmName || '—'}</div>
                        <div className="text-xs text-slate-500">{[f.district, f.province].filter(Boolean).join(', ') || '—'}</div>
                      </Td>
                      <Td>{f.forecast_season || '—'}</Td>
                      <Td>{kg(f.predicted_kg)}</Td>
                      <Td>{f.confidence_pct != null ? `${Math.round(f.confidence_pct)}%` : '—'}</Td>
                      <Td>{kg(f.actual_kg)}</Td>
                      <Td>{f.variance_pct == null ? '—' : <Badge tone={varianceTone(f.variance_pct)}>{pct(f.variance_pct)}</Badge>}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={ClipboardCheck}
                            onClick={() => setDialog({ mode: 'actual', item: f, values: { actual_kg: f.actual_kg ?? '', notes: f.notes || '' } })}
                          >
                            {f.actual_kg == null ? 'Record actual' : 'Edit actual'}
                          </Button>
                          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove(f)} aria-label={`Delete forecast ${f.forecast_number}`} />
                        </div>
                      </Td>
                    </tr>
                  ))}
                </Table>
                <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
              </>
            )}
          </Card>
        </>
      )}

      {dialog && (
        <Dialog
          size={dialog.mode === 'create' ? 'lg' : 'md'}
          title={dialog.mode === 'create' ? 'New forecast' : `Record actual harvest`}
          subtitle={dialog.mode === 'actual' ? `${dialog.item.forecast_number} · predicted ${kg(dialog.item.predicted_kg)}` : undefined}
          onClose={() => !busy && setDialog(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="forecast-form" loading={busy}>Save</Button>
            </>
          }
        >
          <form id="forecast-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dialog.mode === 'create' ? (
              <>
                <Field label="Farm" hint="Optional — leave empty for a regional forecast" className="sm:col-span-2">
                  <select className={inputClass} value={v.farm_id} onChange={(e) => pickFarm(e.target.value)}>
                    <option value="">No specific farm</option>
                    {farms.map((f) => <option key={f.id} value={f.id}>{f.farmName} — {f.farmerName || f.farmer?.full_name}</option>)}
                  </select>
                </Field>
                <Field label="Province" required={!v.farm_id}>
                  <input className={inputClass} value={v.province} onChange={(e) => setValue('province', e.target.value)} />
                </Field>
                <Field label="District">
                  <input className={inputClass} value={v.district} onChange={(e) => setValue('district', e.target.value)} />
                </Field>
                <Field label="Year" required>
                  <select className={inputClass} value={v.forecast_year} onChange={(e) => setValue('forecast_year', e.target.value)}>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Season">
                  <input className={inputClass} value={v.forecast_season} onChange={(e) => setValue('forecast_season', e.target.value)} placeholder="e.g. Season A" />
                </Field>
                <Field label="Predicted harvest (kg)" required>
                  <input type="number" min="0" step="1" className={inputClass} value={v.predicted_kg} onChange={(e) => setValue('predicted_kg', e.target.value)} />
                </Field>
                <Field label="Confidence (%)">
                  <input type="number" min="0" max="100" step="1" className={inputClass} value={v.confidence_pct} onChange={(e) => setValue('confidence_pct', e.target.value)} />
                </Field>
                <Field label="Basis" hint="How the prediction was made" className="sm:col-span-2">
                  <input className={inputClass} value={v.basis} onChange={(e) => setValue('basis', e.target.value)} />
                </Field>
              </>
            ) : (
              <Field label="Actual harvest (kg)" required className="sm:col-span-2">
                <input type="number" min="0" step="1" className={inputClass} value={v.actual_kg} onChange={(e) => setValue('actual_kg', e.target.value)} />
              </Field>
            )}
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={v.notes} onChange={(e) => setValue('notes', e.target.value)} />
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default Forecasting;
