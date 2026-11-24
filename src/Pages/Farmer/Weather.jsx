import { useCallback, useEffect, useState } from 'react';
import { CloudSun, Cloud, CloudRain, Sun, Thermometer, Droplets, Wind, Sprout, Lightbulb, AlertTriangle, RefreshCw, LandPlot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFarmConditions } from '../../services/weatherService';
import { getFarmOptions } from '../../services/harvestLotsService';
import { Page, PageHeader, Card, StatGrid, StatCard, Button, inputClass, EmptyState, ErrorState, Spinner } from '../../components/Ui/kit';
import { errMsg, formatDate } from './farmerShared';

const conditionIcon = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('rain') || t.includes('shower')) return CloudRain;
  if (t.includes('part')) return CloudSun;
  if (t.includes('cloud') || t.includes('overcast')) return Cloud;
  if (t.includes('sun') || t.includes('clear')) return Sun;
  return CloudSun;
};

/**
 * Weather for the farmer's own farm(s). The backend weather endpoints are not
 * yet connected to a real weather provider, so the page says so clearly and
 * does not show the (randomly generated) multi-day forecast.
 */
export default function Weather() {
  const [farms, setFarms] = useState(null);
  const [farmId, setFarmId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [farmsError, setFarmsError] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const loadFarms = useCallback(async () => {
    setFarmsError(null);
    try {
      const list = await getFarmOptions();
      setFarms(list);
      if (list.length) setFarmId((id) => id || list[0].id);
    } catch (e) {
      setFarmsError(errMsg(e, 'Failed to load your farms'));
      setFarms([]);
    }
  }, []);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const load = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getFarmConditions(farmId));
      setLoadedAt(new Date());
    } catch (e) {
      setError(errMsg(e, 'Failed to load weather'));
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    load();
  }, [load]);

  const c = data?.current_conditions || {};
  const Icon = conditionIcon(c.conditions);

  return (
    <Page>
      <PageHeader
        icon={CloudSun}
        title="Weather"
        subtitle="Conditions at your farm and what they mean for your trees."
        actions={
          <>
            {farms?.length > 1 && (
              <select className={`${inputClass} w-56`} aria-label="Farm" value={farmId} onChange={(e) => setFarmId(e.target.value)}>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.farmName}</option>)}
              </select>
            )}
            {farmId && <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>}
          </>
        }
      />

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <span className="font-medium">Sample data.</span> A live weather service is not connected yet, so the values below are
          placeholder readings for your district — do not rely on them for spraying or harvest decisions. The multi-day forecast
          will appear here once a real weather source is connected.
        </p>
      </div>

      {farms === null ? (
        <Card><Spinner /></Card>
      ) : farmsError ? (
        <Card><ErrorState message={farmsError} onRetry={loadFarms} /></Card>
      ) : farms.length === 0 ? (
        <Card>
          <EmptyState
            icon={LandPlot}
            title="No farm registered yet"
            description="Weather is shown for your registered farm. Ask your field agent to register it, then add its location."
            action={<Link to="/dashboard/farmer/my-farm" className="text-sm font-medium text-brand-700 hover:underline">Go to My Farm</Link>}
          />
        </Card>
      ) : loading && !data ? (
        <Card><Spinner label="Loading weather…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : data ? (
        <>
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-9 w-9" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{data.farm_name}{data.location ? ` · ${data.location}` : ''}</p>
                  <p className="text-3xl font-semibold text-slate-900">{c.temperature || '—'}</p>
                  <p className="text-sm text-slate-600">{c.conditions || '—'}</p>
                </div>
              </div>
              {loadedAt && <p className="text-xs text-slate-400">Updated {formatDate(loadedAt, true)}</p>}
            </div>
          </Card>

          <StatGrid>
            <StatCard label="Temperature" value={c.temperature || '—'} icon={Thermometer} tone="amber" />
            <StatCard label="Humidity" value={c.humidity || '—'} icon={Droplets} tone="blue" />
            <StatCard label="Rainfall today" value={c.rainfall_today || c.rainfall || '—'} icon={CloudRain} tone="blue" />
            <StatCard label="Wind" value={c.wind_speed || '—'} icon={Wind} tone="slate" />
          </StatGrid>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Soil moisture">
              <div className="flex items-center gap-3">
                <Sprout className="h-6 w-6 text-brand-600" />
                <p className="text-2xl font-semibold text-slate-900">{c.soil_moisture || '—'}</p>
              </div>
            </Card>
            <Card title="Recommendations">
              {data.recommendations?.length ? (
                <ul className="space-y-2">
                  {data.recommendations.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No special actions needed right now.</p>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </Page>
  );
}
