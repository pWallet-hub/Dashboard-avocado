/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, AlertTriangle, Save, Search, ShieldCheck } from 'lucide-react';
import ParcelEditor, { ringToGeoJson, geoJsonToRing, areaSqm } from './ParcelEditor';
import { Button, Field, inputClass, Badge, Spinner } from '../Ui/kit';
import { useToast } from '../Ui/Toast';
import { getFarmLand, saveFarmLand, verifyFarmLand, checkUpi, looksLikeUpi, formatArea } from '../../services/landService';

const LAND_USES = ['Agriculture', 'Agroforestry', 'Residential & agriculture', 'Forestry', 'Other'];
const TENURES = ['Freehold (owned)', 'Emphyteutic lease', 'Rented / leased', 'Family / customary', 'Cooperative', 'Other'];

/**
 * Edit a farm's land parcel: UPI (checked against its province/district codes and
 * the land registry when connected), land use, tenure, GPS point and boundary.
 * Staff (`canVerify`) can stamp the record as verified after a field visit.
 */
export default function LandEditor({ farmId, canVerify = false, onSaved, mapHeight = 420 }) {
  const toast = useToast();
  const [land, setLand] = useState(null);
  const [form, setForm] = useState({ upi: '', land_use: '', land_tenure: '' });
  const [geo, setGeo] = useState({ point: null, ring: [] });
  const [upiCheck, setUpiCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [warnings, setWarnings] = useState([]);

  const load = useCallback(async () => {
    try {
      const l = await getFarmLand(farmId);
      setLand(l);
      setForm({ upi: l.upi || '', land_use: l.land_use || '', land_tenure: l.land_tenure || '' });
      setGeo({ point: l.latitude != null ? { lat: l.latitude, lng: l.longitude } : null, ring: geoJsonToRing(l.parcel_boundary) });
      setUpiCheck(null);
      setWarnings([]);
    } catch (e) {
      toast.error(e.message);
    }
  }, [farmId, toast]);

  useEffect(() => {
    setLand(null);
    load();
  }, [load]);

  const runUpiCheck = async () => {
    setChecking(true);
    setUpiCheck(null);
    try {
      setUpiCheck(await checkUpi(form.upi));
    } catch (e) {
      setUpiCheck({ error: e.message });
    } finally {
      setChecking(false);
    }
  };

  const save = async () => {
    if (form.upi && !looksLikeUpi(form.upi)) {
      toast.error('UPI format: province/district/sector/cell/parcel, e.g. 5/01/02/03/1234');
      return;
    }
    if (geo.ring.length > 0 && geo.ring.length < 3) {
      toast.error('A boundary needs at least 3 corners (or clear it)');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        upi: form.upi.trim() || null,
        land_use: form.land_use || null,
        land_tenure: form.land_tenure || null,
        parcel_boundary: ringToGeoJson(geo.ring),
      };
      if (geo.point) {
        payload.latitude = geo.point.lat;
        payload.longitude = geo.point.lng;
      }
      const saved = await saveFarmLand(farmId, payload);
      setLand(saved);
      setWarnings(saved.warnings || []);
      toast.success('Land details saved');
      onSaved?.(saved);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    try {
      const v = await verifyFarmLand(farmId);
      setLand(v);
      toast.success(v.registry_status === 'disabled' ? 'Marked as verified (field check)' : 'Verified against the land registry');
      onSaved?.(v);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVerifying(false);
    }
  };

  if (!land) return <Spinner label="Loading land details…" />;

  const drawnArea = areaSqm(geo.ring);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {land.land_verified_at ? (
          <Badge tone="brand"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Verified {new Date(land.land_verified_at).toLocaleDateString()}</Badge>
        ) : (
          <Badge tone="amber">Not verified yet</Badge>
        )}
        {land.land_source && <Badge>Source: {land.land_source}</Badge>}
        {land.parcel_area_sqm ? <Badge tone="blue">Parcel {formatArea(land.parcel_area_sqm)}</Badge> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="UPI (land title number)" hint="From the land title / Irembo, e.g. 5/01/02/03/1234">
          <div className="flex gap-2">
            <input
              className={`${inputClass} font-mono`}
              value={form.upi}
              placeholder="5/01/02/03/1234"
              onChange={(e) => { setForm({ ...form, upi: e.target.value }); setUpiCheck(null); }}
            />
            <Button variant="secondary" icon={Search} loading={checking} disabled={!form.upi} onClick={runUpiCheck} aria-label="Check UPI">
              Check
            </Button>
          </div>
        </Field>
        <Field label="Land use">
          <select className={inputClass} value={form.land_use} onChange={(e) => setForm({ ...form, land_use: e.target.value })}>
            <option value="">—</option>
            {LAND_USES.map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Tenure">
          <select className={inputClass} value={form.land_tenure} onChange={(e) => setForm({ ...form, land_tenure: e.target.value })}>
            <option value="">—</option>
            {TENURES.map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
      </div>

      {upiCheck && (
        <div className={`rounded-xl p-3 text-sm ${upiCheck.error ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'}`}>
          {upiCheck.error ? (
            upiCheck.error
          ) : (
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 font-medium text-brand-700">
                <CheckCircle2 className="h-4 w-4" /> Valid UPI {upiCheck.parsed.normalized} — {upiCheck.parsed.district}, {upiCheck.parsed.province}{' '}
                (sector code {upiCheck.parsed.sector_code}, cell code {upiCheck.parsed.cell_code}, parcel {upiCheck.parsed.parcel_number})
              </p>
              {upiCheck.in_use_by?.some((f) => f.id !== farmId && !f.own) && (
                <p className="flex items-center gap-1.5 text-amber-700"><AlertTriangle className="h-4 w-4" /> Already registered to another farm in the system.</p>
              )}
              <p className="text-xs text-slate-500">
                {upiCheck.registry.status === 'disabled' && 'National land registry not connected — checked by format and location codes only.'}
                {upiCheck.registry.status === 'found' && `Land registry: ${formatArea(upiCheck.registry.parcel.area_sqm)} · ${upiCheck.registry.parcel.land_use || 'use n/a'}`}
                {upiCheck.registry.status === 'not_found' && 'Not found in the land registry.'}
                {upiCheck.registry.status === 'error' && upiCheck.registry.message}
              </p>
            </div>
          )}
        </div>
      )}

      <ParcelEditor value={geo} onChange={setGeo} height={mapHeight} />

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {warnings.map((w) => <li key={w} className="flex gap-1.5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{w}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {geo.point ? `Point: ${geo.point.lat.toFixed(6)}, ${geo.point.lng.toFixed(6)}` : 'No GPS point yet'}
          {geo.ring.length >= 3 && ` · Boundary: ${geo.ring.length} corners, ≈ ${(drawnArea / 10000).toFixed(3)} ha`}
        </p>
        <div className="flex gap-2">
          {canVerify && (
            <Button variant="secondary" icon={ShieldCheck} loading={verifying} onClick={verify}>
              Mark verified
            </Button>
          )}
          <Button icon={Save} loading={saving} onClick={save}>Save land details</Button>
        </div>
      </div>
    </div>
  );
}
