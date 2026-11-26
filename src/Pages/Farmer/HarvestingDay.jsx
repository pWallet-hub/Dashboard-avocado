/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, User, Users, Search, CheckCircle2, Trees, MapPin, ChevronDown, ChevronUp, Plus, UserPlus } from 'lucide-react';
import { createHarvestRequest, lookupFarmerByPhone } from '../../services/serviceRequestsService';
import { listMyFarms } from '../../services/farmsService';
import { uploadMultiple } from '../../services/uploadService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Button, Field, inputClass, textareaClass, Spinner, Badge } from '../../components/Ui/kit';
import LocationPicker from '../../components/Location/LocationPicker';
import { PhotoPicker, RequestSubmitted } from './FarmerBits';
import { isoDay, addDays, formatDate, errMsg, uploadPhotos } from './farmerShared';

const EQUIPMENT = ['Harvest clippers', 'Picking poles', 'Plastic crates', 'Ladders', 'Picking bags'];
const crewFor = (trees) => Math.max(2, Math.ceil((Number(trees) || 0) / 40));
const place = (l) => [l?.sector, l?.district].filter(Boolean).join(', ');

/** Selectable farm tile. */
function FarmChoice({ farm, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${selected ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>
        {selected && <CheckCircle2 className="h-4 w-4" />}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-slate-900">{farm.farmName}</span>
        <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Trees className="h-3.5 w-3.5" />{(farm.tree_count || 0).toLocaleString()} trees</span>
          {place(farm.location || farm) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{place(farm.location || farm)}</span>}
        </span>
      </span>
    </button>
  );
}

/**
 * Book a harvesting day — for one of my farms or for another farmer.
 * We already know the farm's location and trees, so the farmer usually only
 * picks the farm and a start date. Everything else is optional.
 */
export default function HarvestingDay() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [forWhom, setForWhom] = useState('me'); // 'me' | 'other'
  const [farms, setFarms] = useState(null);
  const [farmId, setFarmId] = useState(params.get('farm') || '');

  // Another farmer
  const [phone, setPhone] = useState('');
  const [lookup, setLookup] = useState({ state: 'idle' }); // idle | loading | found | notfound
  const [otherFarmId, setOtherFarmId] = useState('');
  const [other, setOther] = useState({ name: '', location: {} });

  // When & how much
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trees, setTrees] = useState('');
  const [workers, setWorkers] = useState('');
  const [more, setMore] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    listMyFarms()
      .then((list) => {
        setFarms(list);
        // Keep the farm from ?farm= if it is theirs; otherwise preselect the first one.
        setFarmId((cur) => (list.some((f) => f.id === cur) ? cur : list[0]?.id || ''));
      })
      .catch(() => setFarms([]));
  }, []);

  const chosenFarm = useMemo(() => {
    if (forWhom === 'me') return farms?.find((f) => f.id === farmId) || null;
    if (lookup.state === 'found') return lookup.farmer.farms.find((f) => f.id === otherFarmId) || null;
    return null;
  }, [forWhom, farms, farmId, lookup, otherFarmId]);

  const farmTrees = chosenFarm?.tree_count || 0;
  const effectiveTrees = trees !== '' ? Number(trees) : farmTrees;

  const findFarmer = async () => {
    setErrors((e) => ({ ...e, phone: undefined }));
    if (phone.replace(/\D/g, '').length < 9) {
      setErrors((e) => ({ ...e, phone: 'Enter the full phone number, e.g. 0788 123 456' }));
      return;
    }
    setLookup({ state: 'loading' });
    try {
      const farmer = await lookupFarmerByPhone(phone);
      setLookup({ state: 'found', farmer });
      setOtherFarmId(farmer.farms.length === 1 ? farmer.farms[0].id : '');
    } catch (e) {
      if (e.status === 404) setLookup({ state: 'notfound', message: e.message });
      else {
        setLookup({ state: 'idle' });
        toast.error(e.message);
      }
    }
  };

  const validate = () => {
    const e = {};
    if (!from) e.from = 'Choose the day the harvest can start';
    else if (from < isoDay(1)) e.from = 'Choose a day from tomorrow';
    if (to && from && to < from) e.to = 'Must be after the start date';
    if (forWhom === 'me' && farms?.length > 1 && !farmId) e.farm = 'Choose which farm';
    if (forWhom === 'other') {
      if (lookup.state === 'found' && lookup.farmer.farms.length > 1 && !otherFarmId) e.farm = 'Choose which farm';
      if (lookup.state === 'notfound') {
        if (other.name.trim().length < 2) e.other_name = 'Enter their name';
        if (!other.location.district) e.district = 'Choose their district';
      }
      if (lookup.state !== 'found' && lookup.state !== 'notfound') e.phone = 'Enter their phone number and press Find';
    }
    if (!chosenFarm || !farmTrees) {
      if (!(Number.isInteger(Number(trees)) && Number(trees) >= 1)) e.trees = 'How many trees should be harvested?';
    } else if (trees !== '' && !(Number.isInteger(Number(trees)) && Number(trees) >= 1)) e.trees = 'Whole number, at least 1';
    if (workers !== '' && !(Number.isInteger(Number(workers)) && Number(workers) >= 1)) e.workers = 'Whole number, at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (inFlight.current || !validate()) return;
    inFlight.current = true;
    setSaving(true);
    try {
      const harvestImages = await uploadPhotos(photos, uploadMultiple);
      const payload = {
        harvestDateFrom: from,
        ...(to && { harvestDateTo: to }),
        ...(trees !== '' && { treesToHarvest: Number(trees) }),
        ...(workers !== '' && { workersNeeded: Number(workers) }),
        equipmentNeeded: equipment,
        priority,
        notes: notes.trim(),
        harvestImages,
      };
      if (forWhom === 'me') {
        if (farmId) payload.farm_id = farmId;
      } else if (lookup.state === 'found') {
        payload.for_farmer_id = lookup.farmer.id;
        if (otherFarmId) payload.farm_id = otherFarmId;
      } else {
        payload.other_farmer = { name: other.name.trim(), phone, location: Object.fromEntries(Object.entries(other.location).filter(([, x]) => x)) };
      }
      setSubmitted(await createHarvestRequest(payload) || {});
      toast.success('Harvest request submitted');
    } catch (e) {
      toast.error(errMsg(e, 'Failed to submit harvest request'));
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  const reset = () => {
    setSubmitted(null);
    setFrom('');
    setTo('');
    setTrees('');
    setWorkers('');
    setNotes('');
    setPhotos([]);
    setEquipment([]);
    setErrors({});
  };

  const err = (k) => errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>;
  const whoName = forWhom === 'other' ? (lookup.state === 'found' ? lookup.farmer.full_name : other.name || 'the farmer') : null;

  if (submitted) {
    return (
      <Page>
        <PageHeader icon={CalendarCheck} title="Book a Harvesting Day" />
        <RequestSubmitted title="Harvest request submitted" request={submitted} onAnother={reset}>
          We received the request{whoName ? ` for ${whoName}` : ''}: {submitted?.harvest_details?.trees_to_harvest ?? effectiveTrees} trees from {formatDate(from)}
          {submitted?.harvest_details?.harvest_date_to ? ` to ${formatDate(submitted.harvest_details.harvest_date_to)}` : ''}. You will be notified when a VBA is assigned.
          {lookup.state === 'found' && forWhom === 'other' && ` ${lookup.farmer.full_name} has been notified too.`}
        </RequestSubmitted>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        icon={CalendarCheck}
        title="Book a Harvesting Day"
        subtitle="Choose the farm and the day. We already know where the farm is and how many trees it has."
      />
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Who */}
          <Card title="1. Who is the harvest for?">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'me', icon: User, title: 'My farm', text: 'One of my own farms' },
                { id: 'other', icon: Users, title: 'Another farmer', text: 'A family member or neighbour' },
              ].map(({ id, icon: Icon, title, text }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={forWhom === id}
                  onClick={() => { setForWhom(id); setErrors({}); setTrees(''); }}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${forWhom === id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${forWhom === id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-5 w-5" /></span>
                  <span><span className="block font-medium text-slate-900">{title}</span><span className="text-sm text-slate-500">{text}</span></span>
                </button>
              ))}
            </div>

            {forWhom === 'me' && (
              <div className="mt-5">
                {farms === null ? (
                  <Spinner label="Loading your farms…" />
                ) : farms.length === 0 ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                    You have no farm registered yet. <Link to="/dashboard/farmer/my-farm" className="font-medium underline">Add your farm</Link> (1 minute) — or continue and enter the number of trees below; we will use the farm address on your profile.
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-sm font-medium text-slate-700">Which farm?</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {farms.map((f) => <FarmChoice key={f.id} farm={f} selected={f.id === farmId} onSelect={() => { setFarmId(f.id); setErrors((e) => ({ ...e, farm: undefined })); }} />)}
                    </div>
                    {err('farm')}
                    <Link to="/dashboard/farmer/my-farm" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"><Plus className="h-3.5 w-3.5" />Add another farm</Link>
                  </>
                )}
              </div>
            )}

            {forWhom === 'other' && (
              <div className="mt-5 space-y-4">
                <Field label="Their phone number" required hint="If they are registered with ASR we will find their farms.">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      inputMode="tel"
                      className={inputClass}
                      placeholder="0788 123 456"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setLookup({ state: 'idle' }); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); findFarmer(); } }}
                    />
                    <Button type="button" variant="secondary" icon={Search} onClick={findFarmer} loading={lookup.state === 'loading'}>Find</Button>
                  </div>
                  {err('phone')}
                </Field>

                {lookup.state === 'found' && (
                  <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
                    <p className="flex items-center gap-2 text-sm text-slate-900">
                      <CheckCircle2 className="h-5 w-5 text-brand-600" />
                      <span><span className="font-semibold">{lookup.farmer.full_name}</span>{lookup.farmer.district ? ` · ${[lookup.farmer.sector, lookup.farmer.district].filter(Boolean).join(', ')}` : ''}</span>
                    </p>
                    {lookup.farmer.farms.length ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {lookup.farmer.farms.map((f) => <FarmChoice key={f.id} farm={f} selected={f.id === otherFarmId} onSelect={() => setOtherFarmId(f.id)} />)}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">No farm registered yet — enter the number of trees below.</p>
                    )}
                    {err('farm')}
                    <p className="mt-3 text-xs text-slate-500">They will get a notification that you booked this harvest for them.</p>
                  </div>
                )}

                {lookup.state === 'notfound' && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-sm text-slate-700"><UserPlus className="h-5 w-5 text-slate-500" />Not registered yet — tell us who they are and where the farm is.</p>
                    <Field label="Their name" required>
                      <input className={inputClass} value={other.name} onChange={(e) => setOther((o) => ({ ...o, name: e.target.value }))} />
                      {err('other_name')}
                    </Field>
                    <LocationPicker idPrefix="other" depth="village" value={other.location} onChange={(l) => setOther((o) => ({ ...o, location: l }))} errors={{ district: errors.district }} />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 2. When */}
          <Card title="2. When can the harvest start?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From" required>
                <input
                  type="date"
                  min={isoDay(1)}
                  className={inputClass}
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); if (to && to < e.target.value) setTo(''); setErrors((x) => ({ ...x, from: undefined })); }}
                />
                {err('from')}
              </Field>
              <Field label="Until" hint={from ? `Leave empty for ${formatDate(addDays(from, 4))} (5 days)` : 'Optional — 5 days by default'}>
                <input type="date" min={from || isoDay(1)} className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
                {err('to')}
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[['Tomorrow', 1], ['In 3 days', 3], ['Next week', 7], ['In 2 weeks', 14]].map(([label, d]) => (
                <button key={label} type="button" onClick={() => { setFrom(isoDay(d)); setErrors((x) => ({ ...x, from: undefined })); }}
                  className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset ${from === isoDay(d) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {/* 3. Optional details */}
          <Card>
            <button type="button" onClick={() => setMore((m) => !m)} className="flex w-full items-center justify-between text-left">
              <span>
                <span className="block text-base font-semibold text-slate-900">3. More details <span className="text-sm font-normal text-slate-500">(optional)</span></span>
                <span className="text-sm text-slate-500">Harvest only part of the farm, crew size, equipment, photos, notes</span>
              </span>
              {more ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </button>
            {(more || errors.trees || errors.workers) && (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Trees to harvest" required={!farmTrees} hint={farmTrees ? `All ${farmTrees} trees if empty` : undefined}>
                    <input type="number" min="1" step="1" inputMode="numeric" className={inputClass} placeholder={farmTrees ? String(farmTrees) : ''} value={trees} onChange={(e) => setTrees(e.target.value)} />
                    {err('trees')}
                  </Field>
                  <Field label="Pickers needed" hint={effectiveTrees ? `About ${crewFor(effectiveTrees)} if empty` : undefined}>
                    <input type="number" min="1" step="1" inputMode="numeric" className={inputClass} placeholder={effectiveTrees ? String(crewFor(effectiveTrees)) : ''} value={workers} onChange={(e) => setWorkers(e.target.value)} />
                    {err('workers')}
                  </Field>
                  <Field label="How urgent?">
                    <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="low">Not urgent</option>
                      <option value="medium">Normal</option>
                      <option value="high">Soon</option>
                      <option value="urgent">Urgent — fruit dropping</option>
                    </select>
                  </Field>
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-700">Equipment needed</legend>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map((item) => {
                      const on = equipment.includes(item);
                      return (
                        <button type="button" key={item} aria-pressed={on} onClick={() => setEquipment(on ? equipment.filter((x) => x !== item) : [...equipment, item])}
                          className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset ${on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label="Notes for the VBA">
                  <textarea className={textareaClass} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fruit maturity, road access, anything we should know" />
                </Field>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Photos of the trees</p>
                  <PhotoPicker files={photos} onChange={setPhotos} onError={toast.error} disabled={saving} />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card title="Summary">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">For</dt><dd className="text-right font-medium text-slate-900">{forWhom === 'me' ? 'Me' : whoName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Farm</dt><dd className="text-right font-medium text-slate-900">{chosenFarm?.farmName || (forWhom === 'other' && lookup.state === 'notfound' ? place(other.location) || '—' : '—')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Trees</dt><dd className="font-medium text-slate-900">{effectiveTrees || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Pickers</dt><dd className="font-medium text-slate-900">{workers || (effectiveTrees ? `≈ ${crewFor(effectiveTrees)}` : '—')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Dates</dt><dd className="text-right font-medium text-slate-900">{from ? `${formatDate(from)} – ${formatDate(to || addDays(from, 4))}` : '—'}</dd></div>
            </dl>
            {chosenFarm && !chosenFarm.tree_count && <Badge tone="amber" className="mt-3">This farm has no tree count — add it under More details</Badge>}
          </Card>
          <Button type="submit" loading={saving} className="w-full">Submit harvest request</Button>
          <p className="text-center text-xs text-slate-500">A VBA confirms the date and brings the harvesting team.</p>
        </div>
      </form>
    </Page>
  );
}
