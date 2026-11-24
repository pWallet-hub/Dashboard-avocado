/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, GeoJSON, useMap, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { RWANDA_CENTER, RWANDA_BOUNDS } from '../../utils/rwanda';

export const STATUS_COLORS = {
  producing: '#15803d',
  harvesting: '#16a34a',
  growing: '#2563eb',
  planted: '#0891b2',
  preparing: '#a16207',
  dormant: '#64748b',
};

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const dotIcon = (color, selected) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:${selected ? 20 : 14}px;height:${selected ? 20 : 14}px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
    iconSize: selected ? [20, 20] : [14, 14],
    iconAnchor: selected ? [10, 10] : [7, 7],
  });

export function BaseLayers() {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="Street map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name="Satellite">
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
}

/** Clustered farm markers (leaflet.markercluster) driven by GeoJSON point features. */
function ClusteredFarms({ points, selectedId, onSelect }) {
  const map = useMap();
  // Keep the latest callback without rebuilding every marker when it changes.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const group = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, chunkedLoading: true });
    for (const f of points) {
      const [lng, lat] = f.geometry.coordinates;
      const p = f.properties;
      const marker = L.marker([lat, lng], {
        icon: dotIcon(STATUS_COLORS[p.status] || '#15803d', p.id === selectedId),
        title: p.farm_name,
        keyboard: true,
      });
      marker.bindTooltip(
        `<strong>${escapeHtml(p.farm_name)}</strong><br/>${escapeHtml(p.farmer_name)} · ${escapeHtml(p.district || '')}`,
        { direction: 'top', offset: [0, -8] }
      );
      marker.on('click', () => onSelectRef.current?.(p));
      group.addLayer(marker);
    }
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, points, selectedId]);

  return null;
}

/** Fit the map to the data once it loads (falls back to all of Rwanda). */
function FitToData({ points, padding = 40 }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.fitBounds(RWANDA_BOUNDS);
      return;
    }
    const bounds = L.latLngBounds(points.map((f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]]));
    map.fitBounds(bounds.pad(0.1), { padding: [padding, padding], maxZoom: 15 });
  }, [map, points, padding]);
  return null;
}

/** Pan to the selected farm. */
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [map, target]);
  return null;
}

/**
 * Farm map: clustered farm points coloured by status, optional parcel boundaries,
 * street/satellite base layers.
 */
export default function FarmMapView({ collection, selectedId, onSelect, height = '70vh', flyTo }) {
  const features = useMemo(() => collection?.features || [], [collection]);
  const points = useMemo(() => features.filter((f) => f.geometry?.type === 'Point'), [features]);
  const parcels = useMemo(
    () => ({ type: 'FeatureCollection', features: features.filter((f) => f.geometry?.type === 'Polygon') }),
    [features]
  );

  return (
    <div style={{ height }} className="relative isolate overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={RWANDA_CENTER} zoom={8} scrollWheelZoom className="h-full w-full" maxBounds={[[-4, 27.5], [0, 32]]}>
        <BaseLayers />
        <ScaleControl position="bottomleft" />
        {parcels.features.length > 0 && (
          <GeoJSON
            key={parcels.features.map((f) => f.properties.id).join(',')}
            data={parcels}
            style={(f) => ({
              color: f.properties.land_verified ? '#15803d' : '#d97706',
              weight: 2,
              fillOpacity: 0.15,
              dashArray: f.properties.land_verified ? null : '4 4',
            })}
          />
        )}
        <ClusteredFarms points={points} selectedId={selectedId} onSelect={onSelect} />
        <FitToData points={points} />
        <FlyTo target={flyTo} />
      </MapContainer>
    </div>
  );
}
