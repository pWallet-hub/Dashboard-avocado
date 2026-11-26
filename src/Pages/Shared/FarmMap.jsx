import { useCallback, useEffect, useState } from 'react';
import { Map as MapIcon, MapPinned, Trees, BadgeCheck, MapPinOff, Phone, X, LandPlot, RefreshCw } from 'lucide-react';
import FarmMapView, { STATUS_COLORS } from '../../components/Map/FarmMapView';
import LandEditor from '../../components/Map/LandEditor';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState } from '../../components/Ui/kit';
import { useToast } from '../../components/Ui/Toast';
import { getFarmMap, formatArea } from '../../services/landService';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS, ALL_DISTRICTS } from '../../utils/rwanda';

const STATUSES = ['producing', 'harvesting', 'growing', 'planted', 'preparing', 'dormant'];

/**
 * Map of all farms (admin/agent): where farmers are, coloured by farm status,
 * with parcel boundaries, filters and an inline land/UPI editor.
 */
export default function FarmMap({ role = 'admin' }) {
  const toast = useToast();
  const [filters, setFilters] = useState({ province: '', district: '', variety: '', status: '', has_upi: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getFarmMap({ ...filters, boundaries: 'true' }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (k, v) => {
    setSelected(null);
    setEditing(false);
    setFilters((f) => ({ ...f, [k]: v, ...(k === 'province' ? { district: '' } : {}) }));
  };
  const districts = filters.province ? RWANDA_DISTRICTS[filters.province] : ALL_DISTRICTS;
  const meta = data?.meta;

  return (
    <Page>
      <PageHeader
        icon={MapIcon}
        title="Farm Map"
        subtitle="Where every registered farm is, its status and its land parcel. Switch to Satellite to check boundaries."
        actions={<Button variant="secondary" icon={RefreshCw} loading={loading} onClick={load}>Refresh</Button>}
      />

      <StatGrid>
        <StatCard label="Farms on the map" value={meta ? meta.mapped.toLocaleString() : '—'} hint={meta ? `of ${meta.total_farms} matching farms` : ''} icon={MapPinned} />
        <StatCard label="Trees mapped" value={meta ? meta.total_trees.toLocaleString() : '—'} icon={Trees} tone="blue" />
        <StatCard label="Farms with UPI" value={meta ? meta.with_upi.toLocaleString() : '—'} hint={meta ? `${meta.verified} verified` : ''} icon={BadgeCheck} tone="amber" />
        <StatCard label="Missing GPS location" value={meta ? meta.missing_location.toLocaleString() : '—'} hint="Ask agents to capture on the next visit" icon={MapPinOff} tone="rose" />
      </StatGrid>

      <Card padded>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Province">
            <select className={inputClass} value={filters.province} onChange={(e) => setFilter('province', e.target.value)}>
              <option value="">All provinces</option>
              {RWANDA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="District">
            <select className={inputClass} value={filters.district} onChange={(e) => setFilter('district', e.target.value)}>
              <option value="">All districts</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Variety">
            <select className={inputClass} value={filters.variety} onChange={(e) => setFilter('variety', e.target.value)}>
              <option value="">All varieties</option>
              {['Hass', 'Fuerte', 'Ettinger', 'Local'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Farm status">
            <select className={inputClass} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Land title (UPI)">
            <select className={inputClass} value={filters.has_upi} onChange={(e) => setFilter('has_upi', e.target.value)}>
              <option value="">Any</option>
              <option value="true">Has UPI</option>
              <option value="false">No UPI yet</option>
            </select>
          </Field>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-2">
          <FarmMapView
            collection={data}
            selectedId={selected?.id}
            onSelect={(p) => { setSelected(p); setEditing(false); }}
            height="68vh"
          />
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            {STATUSES.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full ring-2 ring-white shadow" style={{ background: STATUS_COLORS[s] }} />
                {s}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 border-2 border-brand-700 bg-brand-700/20" />verified parcel</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 border-2 border-dashed border-amber-600 bg-amber-500/20" />unverified parcel</span>
          </div>
        </div>

        <Card
          title={selected ? selected.farm_name : 'Farm details'}
          subtitle={selected ? `${selected.farmer_name} · ${[selected.village, selected.sector, selected.district].filter(Boolean).join(', ')}` : undefined}
          actions={selected && <Button variant="ghost" size="sm" icon={X} onClick={() => { setSelected(null); setEditing(false); }} aria-label="Close" />}
        >
          {!selected ? (
            <EmptyState icon={MapPinned} title="Select a farm on the map" description="Click a marker to see the farm, its land title and actions." />
          ) : (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div><dt className="text-slate-500">Status</dt><dd><Badge tone="brand">{selected.status}</Badge></dd></div>
                <div><dt className="text-slate-500">Trees</dt><dd className="font-medium">{selected.tree_count?.toLocaleString() ?? '—'}</dd></div>
                <div><dt className="text-slate-500">Varieties</dt><dd className="font-medium">{selected.varieties?.join(', ') || '—'}</dd></div>
                <div><dt className="text-slate-500">Farm size</dt><dd className="font-medium">{selected.farm_size_ha ? `${selected.farm_size_ha} ha` : '—'}</dd></div>
                <div><dt className="text-slate-500">UPI</dt><dd className="font-mono text-xs">{selected.upi || '—'}</dd></div>
                <div><dt className="text-slate-500">Parcel</dt><dd className="font-medium">{formatArea(selected.parcel_area_sqm)}</dd></div>
                <div><dt className="text-slate-500">Land</dt><dd>{selected.land_verified ? <Badge tone="brand">Verified</Badge> : <Badge tone="amber">Unverified</Badge>}</dd></div>
                <div><dt className="text-slate-500">Harvest lots</dt><dd className="font-medium">{selected.harvest_lots}</dd></div>
              </dl>
              <div className="flex flex-wrap gap-2">
                {selected.farmer_phone && (
                  <a href={`tel:${selected.farmer_phone}`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                    <Phone className="h-4 w-4" /> {selected.farmer_phone}
                  </a>
                )}
                <Button icon={LandPlot} onClick={() => setEditing((v) => !v)}>{editing ? 'Hide land editor' : 'Edit land & boundary'}</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {selected && editing && (
        <Card title={`Land parcel · ${selected.farm_name}`} subtitle="Set the UPI, correct the GPS point or draw the parcel boundary.">
          <LandEditor farmId={selected.id} canVerify={role === 'admin' || role === 'agent'} onSaved={load} />
        </Card>
      )}
    </Page>
  );
}
