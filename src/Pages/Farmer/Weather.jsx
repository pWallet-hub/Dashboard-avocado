import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudSun, Cloud, CloudRain, CloudDrizzle, CloudFog, CloudLightning, Sun, Moon, Thermometer, Droplets, Wind, Sprout,
  AlertTriangle, AlertOctagon, CheckCircle2, RefreshCw, LocateFixed, MapPin, SprayCan, Droplet, Bug, ShoppingBasket,
  Umbrella, ExternalLink, Info, Sunrise, Waves, BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';
import { getWeatherOverview, NORMAL_STATUS } from '../../services/weatherService';
import { currentPosition } from '../../services/facilitiesService';
import { Page, PageHeader, Card, Badge, Button, Tabs, Spinner, ErrorState, inputClass } from '../../components/Ui/kit';
import { errMsg, formatDate } from './farmerShared';

/* ───────────── helpers ───────────── */

const STORAGE_KEY = 'weather.farmId';
const readSaved = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};
const save = (id) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, id || '');
  } catch {
    /* private mode — ignore */
  }
};

const fmt = (n, digits = 0) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : Number(n).toFixed(digits).replace(/\.0+$/, ''));
const pct = (m3) => (m3 == null ? '—' : `${Math.round(m3 * 100)}%`);
const hourLabel = (time) => (time ? time.slice(11, 16) : '');
const dayLabel = (date, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  date ? new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, opts) : '';

function weatherIcon(code, night = false) {
  if (code == null) return CloudSun;
  if (code <= 1) return night ? Moon : Sun;
  if (code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 95) return CloudLightning;
  if (code >= 61) return CloudRain;
  return Cloud;
}
const isNight = (time) => {
  const h = Number(String(time).slice(11, 13));
  return h < 6 || h >= 18;
};

const LEVEL = {
  good: { label: 'Good', tone: 'brand', icon: CheckCircle2, ring: 'border-brand-200', iconBox: 'bg-brand-50 text-brand-700' },
  caution: { label: 'Take care', tone: 'amber', icon: AlertTriangle, ring: 'border-amber-200', iconBox: 'bg-amber-50 text-amber-700' },
  warning: { label: 'Warning', tone: 'rose', icon: AlertOctagon, ring: 'border-rose-200', iconBox: 'bg-rose-50 text-rose-700' },
};

const ADVICE_META = {
  spraying: { icon: SprayCan, name: 'Spraying' },
  irrigation: { icon: Droplet, name: 'Watering' },
  disease: { icon: Bug, name: 'Disease' },
  heat: { icon: Thermometer, name: 'Heat & cold' },
  harvest: { icon: ShoppingBasket, name: 'Harvest' },
  rain: { icon: Umbrella, name: 'Heavy rain' },
};

const SOURCE_SHORT = {
  'open-meteo-forecast': 'Open-Meteo forecast',
  'open-meteo-archive': 'Open-Meteo historical (ERA5)',
  'fao-56': 'FAO-56 ET0',
  'meteo-rwanda': 'Meteo Rwanda',
  derived: 'calculated from the data',
};

const COLORS = { temp: '#d97706', rain: '#2563eb', normal: '#94a3b8', et0: '#d97706' };
const axisProps = { tick: { fontSize: 11, fill: '#64748b' }, tickLine: false, axisLine: false };

/** Small "Source: …" line that links to the Sources section. */
const SourceTag = ({ ids }) => {
  const list = [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean))];
  if (!list.length) return null;
  return (
    <p className="mt-3 text-xs text-slate-400">
      Source:{' '}
      {list.map((id, i) => (
        <span key={id}>
          {i > 0 && ' · '}
          <a href="#weather-sources" className="underline decoration-dotted hover:text-slate-600">{SOURCE_SHORT[id] || id}</a>
        </span>
      ))}
    </p>
  );
};

const Mini = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

/* ───────────── sections ───────────── */

function Alerts({ alerts }) {
  return (
    <section aria-label="Weather alerts" className="space-y-3">
      {alerts.map((a) => {
        const warn = a.level === 'warning';
        const Icon = warn ? AlertOctagon : AlertTriangle;
        return (
          <div key={a.id} role="alert" className={`flex gap-3 rounded-2xl border p-4 ${warn ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm">{a.message}</p>
            </div>
          </div>
        );
      })}
      <MeteoRwandaNote />
    </section>
  );
}

const MeteoRwandaNote = () => (
  <p className="flex items-start gap-2 text-xs text-slate-500">
    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <span>
      For official warnings always follow{' '}
      <a href="https://www.meteorwanda.gov.rw" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline">Meteo Rwanda</a>.
    </span>
  </p>
);

function Today({ data }) {
  const c = data.current || {};
  const t = data.today || {};
  const Icon = weatherIcon(c.weather_code, c.is_day === false);
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-9 w-9" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-4xl font-semibold leading-none text-slate-900">{fmt(c.temperature_c)}°C</p>
          <p className="mt-1 text-sm text-slate-600">
            {c.conditions || '—'}
            {c.apparent_temperature_c != null && <span className="text-slate-400"> · feels like {fmt(c.apparent_temperature_c)}°C</span>}
          </p>
          <p className="text-sm text-slate-500">Today {fmt(t.temp_min_c)}° – {fmt(t.temp_max_c)}°C</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Mini icon={CloudRain} label="Rain today" value={`${fmt(t.rainfall_mm, 1)} mm`} hint={t.rain_probability_pct != null ? `${t.rain_probability_pct}% chance` : null} />
        <Mini icon={Droplets} label="Humidity" value={`${fmt(c.humidity_pct)}%`} />
        <Mini icon={Wind} label="Wind" value={`${fmt(c.wind_speed_kmh)} km/h`} hint={c.wind_gusts_kmh != null ? `gusts ${fmt(c.wind_gusts_kmh)} km/h` : null} />
        <Mini icon={Sun} label="UV today" value={fmt(t.uv_index_max)} hint={t.uv_index_max >= 8 ? 'Very high — protect skin' : null} />
        <Mini icon={CloudSun} label="Sunshine" value={t.sunshine_hours != null ? `${fmt(t.sunshine_hours, 1)} h` : '—'} />
        <Mini icon={Sunrise} label="Sunrise / sunset" value={`${hourLabel(t.sunrise) || '—'} / ${hourLabel(t.sunset) || '—'}`} />
      </div>
      <SourceTag ids={[c.source, t.source]} />
    </Card>
  );
}

function AdviceCards({ advice }) {
  return (
    <section aria-labelledby="advice-heading" className="space-y-3">
      <h2 id="advice-heading" className="text-base font-semibold text-slate-900">What to do on your farm</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {advice.map((a) => {
          const lv = LEVEL[a.level] || LEVEL.good;
          const meta = ADVICE_META[a.id] || { icon: Info, name: a.id };
          return (
            <article key={a.id} className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${lv.ring}`}>
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${lv.iconBox}`}>
                  <meta.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{meta.name}</span>
                    <Badge tone={lv.tone}><lv.icon className="mr-1 h-3 w-3" aria-hidden="true" />{lv.label}</Badge>
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-900">{a.title}</h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{a.message}</p>
              {a.details?.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-slate-500">
                  {a.details.map((d) => <li key={d}>• {d}</li>)}
                </ul>
              )}
              <div className="mt-auto"><SourceTag ids={[a.source, ...(a.based_on || [])]} /></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Hourly({ hours, source }) {
  const chart = hours.map((h) => ({ t: `${dayLabel(h.time, { weekday: 'short' })} ${hourLabel(h.time)}`, temp: h.temperature_c, rain: h.rain_mm, chance: h.rain_probability_pct }));
  return (
    <div className="space-y-4">
      <div className="-mx-5 overflow-x-auto px-5 pb-2" tabIndex={0} aria-label="Hourly forecast, scroll sideways">
        <ol className="flex gap-2">
          {hours.map((h, i) => {
            const Icon = weatherIcon(h.weather_code, isNight(h.time));
            const newDay = i === 0 || h.time.slice(0, 10) !== hours[i - 1].time.slice(0, 10);
            return (
              <li key={h.time} className={`flex w-[4.5rem] shrink-0 flex-col items-center rounded-xl border p-2 text-center ${h.spray_ok ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200'}`}>
                <span className="text-[11px] font-medium text-slate-500">{newDay ? dayLabel(h.time, { weekday: 'short' }) : ' '}</span>
                <span className="text-xs font-semibold text-slate-700">{i === 0 ? 'Now' : hourLabel(h.time)}</span>
                <Icon className="my-1 h-6 w-6 text-blue-600" aria-label={h.conditions} />
                <span className="text-sm font-semibold text-slate-900">{fmt(h.temperature_c)}°</span>
                <span className="text-[11px] text-blue-700">{fmt(h.rain_probability_pct)}%</span>
                <span className="text-[11px] text-slate-500">{fmt(h.rain_mm, 1)} mm</span>
                <span className="text-[11px] text-slate-500">{fmt(h.wind_speed_kmh)} km/h</span>
                {h.spray_ok && <SprayCan className="mt-1 h-3.5 w-3.5 text-brand-600" aria-label="Good hour to spray" />}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <SprayCan className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" /> Green hours are good for spraying (calm, not too hot, dry for the next hours).
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Temperature (°C)</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="t" {...axisProps} interval={7} />
                <YAxis {...axisProps} domain={['dataMin - 2', 'dataMax + 2']} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${fmt(v, 1)} °C`, 'Temperature']} />
                <Line type="monotone" dataKey="temp" stroke={COLORS.temp} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Rain (mm per hour)</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="t" {...axisProps} interval={7} />
                <YAxis {...axisProps} allowDecimals />
                <Tooltip formatter={(v, n, p) => [`${fmt(v, 1)} mm (${fmt(p.payload.chance)}% chance)`, 'Rain']} />
                <Bar dataKey="rain" fill={COLORS.rain} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <SourceTag ids={[source, 'derived']} />
    </div>
  );
}

function Daily({ days, source }) {
  const shown = days.slice(0, 14);
  const lo = Math.min(...shown.map((d) => d.temp_min_c ?? 99));
  const hi = Math.max(...shown.map((d) => d.temp_max_c ?? -99));
  const span = Math.max(1, hi - lo);
  const chart = shown.map((d) => ({ day: dayLabel(d.date, { day: 'numeric', month: 'short' }), rain: d.rainfall_mm, et0: d.et0_mm }));
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-100">
        {shown.map((d, i) => {
          const Icon = weatherIcon(d.weather_code);
          return (
            <li key={d.date} className="grid grid-cols-[4.5rem_1.75rem_1fr_auto] items-center gap-2 py-2.5 sm:grid-cols-[7rem_2rem_8rem_1fr_auto] sm:gap-3">
              <span className="text-sm font-medium text-slate-700">{i === 0 ? 'Today' : dayLabel(d.date, { weekday: 'short', day: 'numeric' })}</span>
              <Icon className="h-6 w-6 text-blue-600" aria-label={d.conditions} />
              <span className="hidden text-sm text-slate-600 sm:block">{d.conditions}</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-7 text-right text-slate-500">{fmt(d.temp_min_c)}°</span>
                <span className="relative h-1.5 flex-1 rounded-full bg-slate-100" aria-hidden="true">
                  <span
                    className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{ left: `${((d.temp_min_c - lo) / span) * 100}%`, right: `${100 - ((d.temp_max_c - lo) / span) * 100}%` }}
                  />
                </span>
                <span className="w-7 font-semibold text-slate-900">{fmt(d.temp_max_c)}°</span>
              </span>
              <span className="flex flex-col items-end text-right">
                <span className="text-sm text-blue-700">{fmt(d.rainfall_mm, 1)} mm</span>
                <span className="text-xs text-slate-500">{d.rain_probability_pct != null ? `${d.rain_probability_pct}%` : ''}{d.harvest_ok ? ' · harvest ✓' : ''}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div>
        <p className="text-sm font-medium text-slate-700">Rain vs water used by plants (ET0), mm per day</p>
        <p className="mb-1 text-xs text-slate-500">When the orange bar is taller than the blue one, the soil is losing more water than it gets.</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 5, right: 8, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" {...axisProps} interval={1} />
              <YAxis {...axisProps} />
              <Tooltip formatter={(v, n) => [`${fmt(v, 1)} mm`, n]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="rain" name="Rain" fill={COLORS.rain} radius={[3, 3, 0, 0]} />
              <Bar dataKey="et0" name="Water used (ET0)" fill={COLORS.et0} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <SourceTag ids={[source, 'fao-56', 'derived']} />
    </div>
  );
}

function RainVsNormal({ history, error }) {
  if (!history) {
    return (
      <Card title="Rain compared with normal">
        <p className="text-sm text-slate-500">{error || 'Past rainfall is not available right now. Please try again later.'}</p>
      </Card>
    );
  }
  const chart = history.periods.map((p) => ({ label: dayLabel(p.end_date, { day: 'numeric', month: 'short' }), actual: p.actual_mm, normal: p.normal_mm }));
  return (
    <Card
      title="Rain compared with normal"
      subtitle={`Rain up to ${dayLabel(history.end_date)} vs the average of the same dates over the last ${history.years_compared} years`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {history.windows.map((w) => {
          const meta = NORMAL_STATUS[w.status] || { label: '—', tone: 'slate' };
          return (
            <div key={w.days} className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500">Last {w.days} days</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{fmt(w.actual_mm)} mm</p>
              <p className="text-xs text-slate-500">Normal: {fmt(w.normal_mm)} mm{w.pct_of_normal != null ? ` · ${w.pct_of_normal}% of normal` : ''}</p>
              <Badge tone={meta.tone} className="mt-2">{meta.label}</Badge>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700">Rain per 10 days (mm)</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart} margin={{ top: 5, right: 8, left: -20, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip formatter={(v, n) => [`${fmt(v, 1)} mm`, n]} labelFormatter={(l) => `10 days to ${l}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="actual" name="This year" fill={COLORS.rain} radius={[3, 3, 0, 0]} />
            <Bar dataKey="normal" name={`Normal (${history.years_compared}-year average)`} fill={COLORS.normal} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SourceTag ids={[history.source, 'derived']} />
    </Card>
  );
}

const SOIL_STATUS = {
  dry: { label: 'Dry', tone: 'amber', bar: 'bg-amber-400' },
  moist: { label: 'Moist', tone: 'brand', bar: 'bg-brand-500' },
  wet: { label: 'Wet', tone: 'blue', bar: 'bg-blue-500' },
  waterlogged: { label: 'Very wet', tone: 'rose', bar: 'bg-blue-700' },
};
const soilLabel = (m3, thresholds) => {
  if (m3 == null) return null;
  if (m3 < (thresholds?.irrigation?.drySoilM3 ?? 0.2)) return 'dry';
  if (m3 < 0.35) return 'moist';
  if (m3 < (thresholds?.disease?.waterlogSoilM3 ?? 0.42)) return 'wet';
  return 'waterlogged';
};

function SoilWater({ soil, balance, thresholds }) {
  const layers = soil
    ? [
        { name: 'Surface (0–1 cm)', v: soil.moisture_0_1cm_m3 },
        { name: 'Topsoil (3–9 cm)', v: soil.moisture_3_9cm_m3 },
        { name: 'Root zone (9–27 cm)', v: soil.moisture_9_27cm_m3 },
      ]
    : [];
  const Bal = ({ title, b }) =>
    b ? (
      <div className="rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className={`mt-1 text-xl font-semibold ${b.balance_mm < 0 ? 'text-amber-700' : 'text-blue-700'}`}>{b.balance_mm > 0 ? '+' : ''}{fmt(b.balance_mm, 1)} mm</p>
        <p className="text-xs text-slate-500">Rain {fmt(b.rain_mm, 1)} mm − used {fmt(b.et0_mm, 1)} mm</p>
      </div>
    ) : null;
  return (
    <Card title="Soil & water" subtitle="How much water is in the soil, and whether rain covers what the trees use">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Sprout className="h-4 w-4 text-brand-600" aria-hidden="true" /> Soil moisture now</p>
          {soil ? (
            <ul className="space-y-3">
              {layers.map((l) => {
                const st = SOIL_STATUS[soilLabel(l.v, thresholds)];
                return (
                  <li key={l.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{l.name}</span>
                      <span className="flex items-center gap-2 font-semibold text-slate-900">{pct(l.v)} {st && <Badge tone={st.tone}>{st.label}</Badge>}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100" aria-hidden="true">
                      <div className={`h-2 rounded-full ${st?.bar || 'bg-slate-300'}`} style={{ width: `${Math.min(100, ((l.v ?? 0) / 0.5) * 100)}%` }} />
                    </div>
                  </li>
                );
              })}
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-600"><Thermometer className="h-4 w-4" aria-hidden="true" /> Soil temperature (6 cm)</span>
                <span className="font-semibold text-slate-900">{fmt(soil.temperature_6cm_c, 1)}°C</span>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Not available.</p>
          )}
          <p className="mt-2 text-xs text-slate-500">Model estimate (water as % of soil volume) — check by hand too: squeeze soil from 20 cm deep.</p>
          <SourceTag ids={[soil?.source]} />
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Waves className="h-4 w-4 text-blue-600" aria-hidden="true" /> Water balance (rain − water used)</p>
          <div className="grid grid-cols-2 gap-3">
            <Bal title="Last 7 days" b={balance?.past_7d} />
            <Bal title="Next 7 days" b={balance?.next_7d} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            &ldquo;Water used&rdquo; is ET0: the water that soil and plants lose to the air on a given day (FAO method). A minus number means the soil is
            drying — young trees need watering first.
          </p>
          <SourceTag ids={balance ? [balance.source, ...(balance.based_on || [])] : []} />
        </div>
      </div>
    </Card>
  );
}

function Sources({ sources, thresholds }) {
  const t = thresholds || {};
  const rules = t.spray
    ? [
        `Spraying: wind below ${t.spray.maxWindKmh} km/h (gusts below ${t.spray.maxGustKmh}), not above ${t.spray.maxTempC}°C, between ${t.spray.firstHour}:00 and ${t.spray.lastHour}:00, and no rain (≥ ${t.spray.rainMm} mm or ≥ ${t.spray.rainProbabilityPct}% chance) for ${t.spray.dryHoursAfter} hours after.`,
        `Watering: last 7 days rain minus ET0 below ${t.irrigation.deficitMm} mm (strong at ${t.irrigation.severeDeficitMm} mm) or topsoil below ${Math.round(t.irrigation.drySoilM3 * 100)}%, unless ${t.irrigation.rainSoonMm} mm or more of rain is due in 3 days.`,
        `Disease: hours with humidity ≥ ${t.disease.wetHumidityPct}% or rain, at ${t.disease.warmMinC}–${t.disease.warmMaxC}°C, in the next 48 h (some risk from ${t.disease.moderateHours} h, high from ${t.disease.highHours} h). Root rot: ≥ ${t.disease.waterlogRain7dMm} mm rain in 7 days or root-zone soil ≥ ${Math.round(t.disease.waterlogSoilM3 * 100)}%.`,
        `Heat: ${t.heat.cautionC}°C or more (warning from ${t.heat.dangerC}°C). Cold nights: ${t.heat.coldC}°C or less.`,
        `Heavy rain: ${t.rain.heavyDayMm} mm in a day or ${t.rain.intenseHourMm} mm in an hour (very heavy from ${t.rain.veryHeavyDayMm} mm). Strong wind: gusts ${t.rain.strongGustKmh} km/h or more. Thunderstorms from the forecast weather code.`,
        `Harvest day: rain ≤ ${t.harvest.maxRainMm} mm, rain chance ≤ ${t.harvest.maxRainProbabilityPct}%, gusts below ${t.harvest.maxGustKmh} km/h.`,
        `Compared with normal: below ${t.normal.muchDrierPct}% much drier, below ${t.normal.drierPct}% drier, up to ${t.normal.wetterPct}% normal, up to ${t.normal.muchWetterPct}% wetter, above that much wetter.`,
      ]
    : [];
  return (
    <Card title="Sources" subtitle="Where every number on this page comes from">
      <div id="weather-sources" className="scroll-mt-24" />
      <ul className="space-y-3">
        {(sources || []).map((s) => (
          <li key={s.id} className="flex gap-3 text-sm">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                  {s.name} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <span className="font-medium text-slate-800">{s.name}</span>
              )}
              <p className="text-xs text-slate-500">{s.used_for}</p>
              {s.licence && (
                <p className="text-xs text-slate-500">
                  Licence:{' '}
                  <a href={s.licence_url} target="_blank" rel="noopener noreferrer" className="underline">{s.licence}</a>
                  {s.attribution ? ` — ${s.attribution}` : ''}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        Weather data by{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo.com</a>, licensed under{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline">CC BY 4.0</a>. Forecasts are
        model estimates and can be wrong; official warnings come from{' '}
        <a href="https://www.meteorwanda.gov.rw" target="_blank" rel="noopener noreferrer" className="underline">Meteo Rwanda</a>.
      </p>
      {rules.length > 0 && (
        <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">How the advice is calculated</summary>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {rules.map((r) => <li key={r}>• {r}</li>)}
          </ul>
        </details>
      )}
    </Card>
  );
}

/* ───────────── page ───────────── */

/**
 * Farmer weather: live conditions, alerts and plain-language advice for the
 * selected farm (GPS, or its district centre), 48-hour and 14-day forecasts,
 * rain compared with the 10-year normal, soil moisture and water balance.
 * Every number links to its source (Open-Meteo, CC BY 4.0).
 */
export default function Weather() {
  const [farmId, setFarmId] = useState(readSaved);
  const [position, setPosition] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(null);
  const [tab, setTab] = useState('hourly');
  const [loadedAt, setLoadedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWeatherOverview(position ? position : { farmId });
      // A saved farm that no longer exists → fall back to the default.
      if (!position && farmId && result?.farms?.length && !result.farms.some((f) => f.id === farmId)) {
        setFarmId('');
        save('');
        return;
      }
      setData(result);
      setLoadedAt(new Date());
    } catch (e) {
      if (!position && farmId) {
        // Saved farm not accessible any more → retry with the default.
        setFarmId('');
        save('');
        return;
      }
      setError(errMsg(e, 'Failed to load weather'));
    } finally {
      setLoading(false);
    }
  }, [farmId, position]);

  useEffect(() => {
    load();
  }, [load]);

  const pickFarm = (id) => {
    setPosition(null);
    setFarmId(id);
    save(id);
  };

  const useMyLocation = async () => {
    setLocating(true);
    setLocError(null);
    try {
      setPosition(await currentPosition());
    } catch (e) {
      setLocError(e.message);
    } finally {
      setLocating(false);
    }
  };

  const farms = data?.farms || [];
  const loc = data?.location;
  const selectedFarm = position ? '' : loc?.farm_id || farmId;
  const historyError = data?.errors?.find((e) => e.part === 'rainfall_history')?.message;
  const forecastError = data?.errors?.find((e) => e.part === 'forecast')?.message;

  const tabs = useMemo(
    () => [
      { id: 'hourly', label: 'Next 48 hours' },
      { id: 'daily', label: '14 days' },
    ],
    []
  );

  return (
    <Page>
      <PageHeader
        icon={CloudSun}
        title="Weather"
        subtitle="Weather at your farm and what it means for your avocado trees."
        actions={
          <>
            {farms.length > 1 && (
              <select className={`${inputClass} w-full sm:w-56`} aria-label="Choose farm" value={selectedFarm} onChange={(e) => pickFarm(e.target.value)}>
                {position && <option value="">My current location</option>}
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}{f.has_gps ? '' : ' (approx.)'}</option>
                ))}
              </select>
            )}
            {position ? (
              <Button variant="secondary" icon={MapPin} onClick={() => setPosition(null)}>Back to my farm</Button>
            ) : (
              <Button variant="secondary" icon={LocateFixed} onClick={useMyLocation} loading={locating}>Use my location</Button>
            )}
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading} aria-label="Refresh">Refresh</Button>
          </>
        }
      />

      {locError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">{locError}</p>
      )}

      {loading && !data ? (
        <Card><Spinner label="Loading weather…" /></Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={load} />
          <div className="-mt-6 flex flex-wrap justify-center gap-2 pb-6">
            <Button variant="secondary" icon={LocateFixed} onClick={useMyLocation} loading={locating}>Use my current location</Button>
            <Link to="/dashboard/farmer/my-farm" className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-brand-700 hover:underline">Go to My Farm</Link>
          </div>
        </Card>
      ) : data ? (
        <>
          {/* Where & when */}
          <div className="flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                <span className="font-medium text-slate-800">{loc?.farm_name || loc?.label}</span>
                {loc?.district && <span className="text-slate-500"> · {loc.district}</span>}
                {data.elevation_m != null && <span className="text-slate-500"> · {fmt(data.elevation_m)} m altitude</span>}
                {loc?.approximate && (
                  <span className="mt-1 block text-xs text-amber-700">
                    Approximate: weather for the district centre. Ask your field agent to add your farm&apos;s GPS for exact weather.
                  </span>
                )}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {loading ? 'Updating…' : loadedAt ? `Updated ${formatDate(loadedAt, true)}` : ''}
            </p>
          </div>

          {forecastError && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p><span className="font-medium">Forecast not available right now.</span> {forecastError}. Past rainfall is still shown below.</p>
            </div>
          )}

          {data.forecast_available && (
            <>
              {data.alerts?.length > 0 ? <Alerts alerts={data.alerts} /> : null}
              <Today data={data} />
              {!data.alerts?.length && <MeteoRwandaNote />}
              {data.advice?.length > 0 && <AdviceCards advice={data.advice} />}

              <Card title="Forecast" actions={<Tabs tabs={tabs} value={tab} onChange={setTab} />}>
                {tab === 'hourly' ? <Hourly hours={data.hourly || []} source={data.hourly_source} /> : <Daily days={data.daily || []} source={data.daily_source} />}
              </Card>
            </>
          )}

          <RainVsNormal history={data.rainfall_history} error={historyError} />

          {data.forecast_available && <SoilWater soil={data.soil} balance={data.water_balance} thresholds={data.thresholds} />}

          <Sources sources={data.sources} thresholds={data.thresholds} />
        </>
      ) : null}
    </Page>
  );
}
