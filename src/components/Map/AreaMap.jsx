import { useEffect, useMemo, useState } from 'react';
import { MapContainer, GeoJSON, ScaleControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft } from 'lucide-react';
import { BaseLayers } from './FarmMapView';
import { Card, Button, Spinner, ErrorState, Table, Td, inputClass } from '../Ui/kit';
import { RWANDA_CENTER } from '../../utils/rwanda';
import { getBoundaries, getAreaStats } from '../../services/geographyService';

const METRICS = [
  { key: 'farmers', label: 'Farmers' },
  { key: 'farms', label: 'Farms' },
  { key: 'trees', label: 'Avocado trees' },
  { key: 'hectares', label: 'Hectares' },
  { key: 'activated', label: 'Activated farmers' },
  { key: 'gps_elsewhere', label: 'Farms mapped outside their area' },
];
// Sequential green scale (light → dark), readable in both themes.
/** Zoom to the shapes shown (all of Rwanda, or one district). */
function FitTo({ data }) {
  const map = useMap();
  useEffect(() => {
    const b = L.geoJSON(data).getBounds();
    if (b.isValid()) map.fitBounds(b, { padding: [10, 10] });
  }, [data, map]);
  return null;
}

const STEPS = ['#ecfdf5', '#bbf7d0', '#86efac', '#4ade80', '#16a34a', '#166534'];

/**
 * Official district (and, after a click, sector) boundaries shaded by a farm
 * metric. Answers "where are our farmers, trees and gaps?" at a glance.
 */
export default function AreaMap({ height = 520 }) {
  const [district, setDistrict] = useState(null);
  const [metric, setMetric] = useState('farmers');
  const [shapes, setShapes] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setShapes(null);
    setStats(null);
    setError('');
    const level = district ? 'sector' : 'district';
    Promise.all([getBoundaries(level, { district }), getAreaStats({ level, district })])
      .then(([b, s]) => { if (alive) { setShapes(b); setStats(s); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [district]);

  const level = district ? 'sector' : 'district';
  const byArea = useMemo(() => new Map((stats?.items || []).map((r) => [r.area.toLowerCase(), r])), [stats]);
  const max = useMemo(() => Math.max(1, ...(stats?.items || []).map((r) => r[metric] || 0)), [stats, metric]);
  const colour = (v) => (!v ? '#f8fafc' : STEPS[Math.min(STEPS.length - 1, Math.floor((v / max) * (STEPS.length - 1) + 0.5))]);
  const label = METRICS.find((m) => m.key === metric)?.label;

  return (
    <Card
      title={district ? `${district} district — sectors` : 'Farmers across Rwanda'}
      subtitle={district ? 'Click “All districts” to go back.' : 'Click a district to see its sectors.'}
      actions={
        <div className="flex items-center gap-2">
          {district && <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setDistrict(null)}>All districts</Button>}
          <select className={`${inputClass} w-56`} value={metric} onChange={(e) => setMetric(e.target.value)} aria-label="Shade the map by">
            {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
      }
    >
      {error ? <ErrorState message={error} /> : !shapes || !stats ? <Spinner label="Loading map…" /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div style={{ height }} className="relative isolate overflow-hidden rounded-xl border border-slate-200">
              <MapContainer center={RWANDA_CENTER} zoom={8} className="h-full w-full" scrollWheelZoom>
                <BaseLayers />
                <ScaleControl position="bottomleft" />
                <GeoJSON
                  key={`${level}-${district}-${metric}`}
                  data={shapes}
                  style={(f) => {
                    const r = byArea.get(String(f.properties[level]).toLowerCase());
                    return { color: '#334155', weight: 1, fillColor: colour(r?.[metric]), fillOpacity: 0.75 };
                  }}
                  onEachFeature={(f, layer) => {
                    const name = f.properties[level];
                    const r = byArea.get(String(name).toLowerCase());
                    layer.bindTooltip(
                      `<b>${name}</b><br/>${r ? `${r.farmers.toLocaleString()} farmers · ${r.farms.toLocaleString()} farms<br/>${r.trees.toLocaleString()} trees · ${r.hectares} ha<br/>${r.on_map} on the map · ${r.activated} activated` : 'No farms yet'}`,
                      { sticky: true }
                    );
                    if (!district) layer.on('click', () => setDistrict(name));
                  }}
                />
                <FitTo data={shapes} />
              </MapContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>{label}:</span>
              {STEPS.map((c, i) => <span key={c} className="inline-flex items-center gap-1"><span className="inline-block h-3 w-5 rounded-sm ring-1 ring-slate-300" style={{ background: c }} />{i === 0 ? 'few' : i === STEPS.length - 1 ? `${max.toLocaleString()}` : ''}</span>)}
              <span className="ml-auto">{shapes.attribution}</span>
            </div>
          </div>
          <div className="max-h-[560px] overflow-y-auto rounded-xl border border-slate-200">
            <Table head={[district ? 'Sector' : 'District', label]}>
              {[...stats.items].sort((a, b) => (b[metric] || 0) - (a[metric] || 0)).map((r) => (
                <tr key={r.area} className={!district ? 'cursor-pointer hover:bg-slate-50' : ''} onClick={() => !district && setDistrict(r.area)}>
                  <Td className="font-medium text-slate-900">{r.area}</Td>
                  <Td>{(r[metric] || 0).toLocaleString()}</Td>
                </tr>
              ))}
            </Table>
            {stats.farms_without_area > 0 && <p className="p-3 text-xs text-amber-700">{stats.farms_without_area} farms have no {level} recorded.</p>}
          </div>
        </div>
      )}
    </Card>
  );
}
