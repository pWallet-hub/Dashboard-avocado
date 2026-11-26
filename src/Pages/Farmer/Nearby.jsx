import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass, UserCheck, Store, Phone, Navigation, LocateFixed, RefreshCw, Warehouse, Plane, ShoppingBasket, Snowflake,
  Factory, Sprout, Landmark, Building2, MapPin, Package,
} from 'lucide-react';
import { BaseLayers } from '../../components/Map/FarmMapView';
import { getNearby, currentPosition, directionsUrl, facilityTypeLabel, FACILITY_TYPES } from '../../services/facilitiesService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Badge, Button, EmptyState, Spinner, ErrorState, Tabs } from '../../components/Ui/kit';
import { RWANDA_CENTER } from '../../utils/rwanda';

const TYPE_ICONS = {
  market: ShoppingBasket,
  collection_center: Warehouse,
  cold_storage: Snowflake,
  packhouse: Package,
  processing_plant: Factory,
  airport: Plane,
  nursery: Sprout,
  demo_farm: Sprout,
  input_supplier: Store,
  sacco_bank: Landmark,
  government_office: Building2,
  other: MapPin,
};

const COLORS = { origin: '#dc2626', agent: '#2563eb', shop: '#a16207', facility: '#15803d' };

const km = (d, approx) => (d == null ? '—' : `${approx ? '≈ ' : ''}${d < 1 ? '< 1' : d.toLocaleString()} km`);

function FitTo({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [30, 30], maxZoom: 13 });
    else if (points.length === 1) map.setView(points[0], 12);
  }, [map, points]);
  return null;
}

const CallButton = ({ phone }) =>
  phone ? (
    <a href={`tel:${phone}`} className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700">
      <Phone className="h-3.5 w-3.5" /> Call
    </a>
  ) : null;

const DirectionsButton = ({ lat, lng }) => (
  <a href={directionsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
    <Navigation className="h-3.5 w-3.5" /> Directions
  </a>
);

const Row = ({ icon: Icon, tone, title, subtitle, distance, badges, actions }) => (
  <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-start gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{title}</p>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        {badges && <div className="mt-1 flex flex-wrap gap-1">{badges}</div>}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
      <span className="text-sm font-semibold text-slate-900">{distance}</span>
      <div className="flex gap-2">{actions}</div>
    </div>
  </li>
);

/**
 * "Near me": the field agents, input shops, markets, collection centres,
 * airports and other places closest to the farmer's farm.
 */
export default function Nearby() {
  const toast = useToast();
  const [state, setState] = useState({ loading: true });
  const [position, setPosition] = useState(null); // { lat, lng } from the phone, when shared
  const [locating, setLocating] = useState(false);
  const [tab, setTab] = useState('all');

  const load = useCallback(async (pos) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await getNearby({ limit: 6, ...(pos && { lat: pos.lat, lng: pos.lng }) });
      setState({ loading: false, data });
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }, []);

  useEffect(() => {
    load(null);
  }, [load]);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await currentPosition();
      setPosition(pos);
      await load(pos);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLocating(false);
    }
  };

  const resetToFarm = () => {
    setPosition(null);
    load(null);
  };

  const data = state.data;
  const facilityGroups = useMemo(
    () => FACILITY_TYPES.map((t) => ({ ...t, items: data?.facilities?.[t.value] || [] })).filter((g) => g.items.length),
    [data]
  );

  const points = useMemo(() => {
    if (!data?.origin) return [];
    const pts = [[data.origin.lat, data.origin.lng]];
    facilityGroups.forEach((g) => g.items.slice(0, 3).forEach((f) => pts.push([f.latitude, f.longitude])));
    return pts;
  }, [data, facilityGroups]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'agents', label: 'Agents', count: data?.agents?.length ?? 0 },
    { id: 'shops', label: 'Input shops', count: data?.shops?.length ?? 0 },
    ...facilityGroups.map((g) => ({ id: g.value, label: g.plural, count: g.items.length })),
  ];
  const show = (id) => tab === 'all' || tab === id;

  return (
    <Page>
      <PageHeader
        icon={Compass}
        title="Near my farm"
        subtitle="Your closest field agents, input shops, markets, collection centres, airports and other services."
        actions={
          <>
            <Button icon={LocateFixed} onClick={useMyLocation} loading={locating}>Use my current location</Button>
            {position && <Button variant="secondary" onClick={resetToFarm}>Back to my farm</Button>}
            <Button variant="secondary" icon={RefreshCw} onClick={() => load(position)} loading={state.loading}>Refresh</Button>
          </>
        }
      />

      {state.loading && !data ? (
        <Card><Spinner label="Finding what is near you…" /></Card>
      ) : state.error ? (
        <Card>
          <ErrorState
            title="We could not work out where your farm is"
            message={state.error}
            onRetry={() => load(position)}
          />
          <div className="flex flex-wrap justify-center gap-3 pb-6">
            <Button icon={LocateFixed} onClick={useMyLocation} loading={locating}>Use my current location</Button>
            <Link to="/dashboard/farmer/my-farm" className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Add my farm location</Link>
          </div>
        </Card>
      ) : data ? (
        <>
          <Card padded={false}>
            <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-600">
                Distances measured from <span className="font-medium text-slate-900">{data.origin.label}</span>
              </span>
              {data.origin.source === 'district_centre' && (
                <Link to="/dashboard/farmer/my-farm" className="text-brand-700 hover:underline">Add your farm&apos;s GPS for exact distances</Link>
              )}
            </div>
            <div className="h-72 w-full sm:h-80">
              <MapContainer center={RWANDA_CENTER} zoom={9} className="h-full w-full" scrollWheelZoom={false}>
                <BaseLayers />
                <FitTo points={points} />
                <CircleMarker center={[data.origin.lat, data.origin.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: COLORS.origin, fillOpacity: 1 }}>
                  <Tooltip>{data.origin.label}</Tooltip>
                </CircleMarker>
                {facilityGroups.flatMap((g) => g.items).map((f) => (
                  <CircleMarker key={f.id} center={[f.latitude, f.longitude]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: COLORS.facility, fillOpacity: 1 }}>
                    <Tooltip>{f.name} · {facilityTypeLabel(f.type)} · {km(f.distance_km)}</Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </Card>

          <Tabs tabs={tabs} value={tab} onChange={setTab} />

          {show('agents') && (
            <Card title="Field agents" subtitle="Agents who cover your area come first." padded={false}>
              {data.agents.length === 0 ? (
                <EmptyState icon={UserCheck} title="No agents found yet" description="Ask the Avocado Society office to assign an agent to your area." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.agents.map((a) => (
                    <Row
                      key={a.id}
                      icon={UserCheck}
                      tone="bg-blue-50 text-blue-700"
                      title={a.full_name}
                      subtitle={[a.sector, a.district].filter(Boolean).join(', ') + (a.specialization ? ` · ${a.specialization}` : '')}
                      distance={km(a.distance_km, a.distance_approx)}
                      badges={
                        a.covers_your_sector ? <Badge tone="brand">Covers your sector</Badge>
                          : a.covers_your_district ? <Badge tone="brand">Covers your district</Badge> : null
                      }
                      actions={<CallButton phone={a.phone} />}
                    />
                  ))}
                </ul>
              )}
            </Card>
          )}

          {show('shops') && (
            <Card title="Input shops" subtitle="Shops selling seedlings, fertiliser, crates and tools." padded={false}>
              {data.shops.length === 0 ? (
                <EmptyState icon={Store} title="No shops found" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.shops.map((s) => (
                    <Row
                      key={s.id}
                      icon={Store}
                      tone="bg-amber-50 text-amber-700"
                      title={s.name}
                      subtitle={`${s.district}${s.description ? ` · ${s.description}` : ''}`}
                      distance={km(s.distance_km, s.distance_approx)}
                      actions={
                        <>
                          <CallButton phone={s.phone} />
                          <Link to="/dashboard/farmer/market" className="inline-flex h-8 items-center rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Shop online</Link>
                        </>
                      }
                    />
                  ))}
                </ul>
              )}
            </Card>
          )}

          {facilityGroups.filter((g) => show(g.value)).map((g) => {
            const Icon = TYPE_ICONS[g.value] || MapPin;
            return (
              <Card key={g.value} title={g.plural} padded={false}>
                <ul className="divide-y divide-slate-100">
                  {g.items.map((f) => (
                    <Row
                      key={f.id}
                      icon={Icon}
                      tone="bg-brand-50 text-brand-700"
                      title={f.name}
                      subtitle={[f.sector, f.district].filter(Boolean).join(', ') + (f.opening_hours ? ` · ${f.opening_hours}` : '')}
                      distance={km(f.distance_km)}
                      badges={
                        <>
                          {f.farm_gate_price_60d != null && <Badge tone="amber">Farm-gate ≈ {f.farm_gate_price_60d.toLocaleString()} RWF/kg</Badge>}
                          {f.description && <span className="text-xs text-slate-500">{f.description}</span>}
                        </>
                      }
                      actions={
                        <>
                          <CallButton phone={f.contact_phone} />
                          <DirectionsButton lat={f.latitude} lng={f.longitude} />
                        </>
                      }
                    />
                  ))}
                </ul>
              </Card>
            );
          })}

          {tab === 'all' && facilityGroups.length === 0 && (
            <Card>
              <EmptyState icon={MapPin} title="No markets or collection centres registered yet" description="Your agent and the Avocado Society are adding markets, collection centres, airports and other places. Check back soon." />
            </Card>
          )}
        </>
      ) : null}
    </Page>
  );
}
