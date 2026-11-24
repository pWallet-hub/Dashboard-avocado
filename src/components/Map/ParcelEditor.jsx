/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polygon, Polyline, CircleMarker, useMap, useMapEvents, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, PenLine, Undo2, Trash2, LocateFixed } from 'lucide-react';
import { BaseLayers } from './FarmMapView';
import { RWANDA_CENTER } from '../../utils/rwanda';

const pinIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#15803d;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/** Geodesic area of a [lat,lng] ring in m² (same formula as the API). */
export function areaSqm(latlngs) {
  if (latlngs.length < 3) return 0;
  const R = 6378137;
  const rad = (d) => (d * Math.PI) / 180;
  let a = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const [lat1, lng1] = latlngs[i];
    const [lat2, lng2] = latlngs[(i + 1) % latlngs.length];
    a += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((a * R * R) / 2);
}

/** Boundary corners only make sense at field level; at country zoom one click is kilometres off. */
export const MIN_DRAW_ZOOM = 15;

function ClickHandler({ mode, onPoint, onVertex, onZoom }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (mode === 'point') {
        onPoint({ lat, lng });
        if (map.getZoom() < 14) map.setView(e.latlng, 16); // zoom in so the farmer can refine/draw
      } else if (map.getZoom() >= MIN_DRAW_ZOOM) {
        onVertex([lat, lng]);
      } else {
        map.setView(e.latlng, MIN_DRAW_ZOOM); // zoom to field level instead of placing a corner
      }
    },
    zoomend() {
      onZoom(map.getZoom());
    },
  });
  return null;
}

function Recenter({ point, ring }) {
  const map = useMap();
  useEffect(() => {
    if (ring.length >= 3) map.fitBounds(L.latLngBounds(ring), { padding: [30, 30], maxZoom: 18 });
    else if (point) map.setView([point.lat, point.lng], Math.max(map.getZoom(), 16));
    // only on first render with data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * Edit a farm's GPS point and parcel boundary.
 * value: { point: {lat,lng}|null, ring: [[lat,lng],…] }  — onChange(next)
 */
export default function ParcelEditor({ value, onChange, height = 420, disabled = false }) {
  const [mode, setMode] = useState(value.ring?.length ? 'draw' : 'point');
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [zoom, setZoom] = useState(value.point ? 16 : 8);
  const [recenterKey, setRecenterKey] = useState(0);
  const ring = value.ring || [];
  const point = value.point || null;
  const area = areaSqm(ring);

  const useGps = () => {
    if (!navigator.geolocation) {
      setGeoError('This device has no GPS / location support');
      return;
    }
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ ...value, point: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        setRecenterKey((k) => k + 1);
      },
      (err) => {
        setLocating(false);
        setGeoError(err.code === 1 ? 'Location permission was denied' : 'Could not get your location');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const tool = (active) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
      active ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
    }`;

  return (
    <div className="space-y-2">
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={tool(mode === 'point')} onClick={() => setMode('point')}>
            <MapPin className="h-3.5 w-3.5" /> Set farm point
          </button>
          <button type="button" className={tool(mode === 'draw')} onClick={() => setMode('draw')}>
            <PenLine className="h-3.5 w-3.5" /> Draw boundary
          </button>
          <button type="button" className={tool(false)} onClick={useGps} disabled={locating}>
            <LocateFixed className="h-3.5 w-3.5" /> {locating ? 'Locating…' : 'Use my GPS'}
          </button>
          {mode === 'draw' && (
            <>
              <button type="button" className={tool(false)} disabled={!ring.length} onClick={() => onChange({ ...value, ring: ring.slice(0, -1) })}>
                <Undo2 className="h-3.5 w-3.5" /> Undo point
              </button>
              <button type="button" className={tool(false)} disabled={!ring.length} onClick={() => onChange({ ...value, ring: [] })}>
                <Trash2 className="h-3.5 w-3.5" /> Clear boundary
              </button>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-slate-500">
        {disabled
          ? 'Read only.'
          : mode === 'point'
            ? 'Click the map where the farm is (or use GPS while standing on the farm).'
            : zoom < MIN_DRAW_ZOOM
              ? 'Zoom in to your field first — click the map to zoom there, then click each corner of the parcel.'
              : 'Click each corner of the parcel in order. Switch to Satellite (top right) to see field edges.'}
        {ring.length >= 3 && <span className="ml-1 font-medium text-slate-700">Boundary area ≈ {(area / 10000).toFixed(3)} ha ({Math.round(area).toLocaleString()} m²)</span>}
      </p>
      {geoError && <p className="text-xs text-rose-600">{geoError}</p>}
      <div style={{ height }} className="relative isolate overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={point ? [point.lat, point.lng] : RWANDA_CENTER} zoom={point ? 16 : 8} className="h-full w-full" scrollWheelZoom>
          <BaseLayers />
          <ScaleControl position="bottomleft" />
          <Recenter key={recenterKey} point={point} ring={ring} />
          {!disabled && (
            <ClickHandler
              mode={mode}
              onPoint={(p) => onChange({ ...value, point: p })}
              onVertex={(v) => onChange({ ...value, ring: [...ring, v] })}
              onZoom={setZoom}
            />
          )}
          {point && <Marker position={[point.lat, point.lng]} icon={pinIcon} />}
          {ring.length >= 3 && <Polygon positions={ring} pathOptions={{ color: '#15803d', weight: 2, fillOpacity: 0.2 }} />}
          {ring.length === 2 && <Polyline positions={ring} pathOptions={{ color: '#15803d', weight: 2 }} />}
          {mode === 'draw' && ring.map((v, i) => <CircleMarker key={i} center={v} radius={4} pathOptions={{ color: '#fff', fillColor: '#15803d', fillOpacity: 1, weight: 2 }} />)}
        </MapContainer>
      </div>
    </div>
  );
}

/** GeoJSON Polygon ([lng,lat], closed) ⇄ editor ring ([lat,lng], open). */
export const ringToGeoJson = (ring) =>
  ring.length >= 3 ? { type: 'Polygon', coordinates: [[...ring.map(([lat, lng]) => [lng, lat]), [ring[0][1], ring[0][0]]]] } : null;

export const geoJsonToRing = (polygon) => {
  const coords = polygon?.coordinates?.[0];
  if (!Array.isArray(coords) || coords.length < 4) return [];
  return coords.slice(0, -1).map(([lng, lat]) => [lat, lng]);
};
