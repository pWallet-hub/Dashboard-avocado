import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LandPlot, Plus, Pencil, Archive, MapPin, Trees, Ruler, Sprout, CalendarCheck, ShieldCheck, MapPinOff, Info, PackageCheck, RefreshCw,
} from 'lucide-react';
import { Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, EmptyState, Spinner, Dialog, ErrorState } from '../../components/Ui/kit';
import LandEditor from '../../components/Map/LandEditor';
import LocationPicker from '../../components/Location/LocationPicker';
import { listMyFarms, addMyFarm, updateFarm, archiveFarm } from '../../services/farmsService';
import { getFarmerInformation } from '../../services/farmer-information';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { farmLocationFromProfile } from './farmerShared';

const VARIETIES = ['Hass', 'Fuerte', 'Bacon', 'Zutano', 'Ettinger', 'Local'];
const IRRIGATION = ['None (rain-fed)', 'Drip irrigation', 'Sprinkler', 'Furrow', 'Manual watering'];
const THIS_YEAR = new Date().getFullYear();

const place = (loc) => [loc?.village, loc?.cell, loc?.sector, loc?.district].filter(Boolean).join(', ') || 'Location not set';

const emptyForm = (loc = {}, variety) => ({
  farm_name: '', location: { province: '', district: '', sector: '', cell: '', village: '', ...loc },
  tree_count: '', farm_size: '', varieties: variety ? [variety] : ['Hass'], planting_year: '', irrigation_system: '',
});

/**
 * Farmer: all my farms. Add a farm with a few fields (name, where, trees),
 * then mark it on the map and add the land title so a VBA can verify it.
 */
export default function MyFarm() {
  const toast = useToast();
  const confirm = useConfirm();
  const [farms, setFarms] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState(null); // { id?, values }
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await listMyFarms();
      setFarms(list);
      setSelected((cur) => (list.some((f) => f.id === cur) ? cur : list[0]?.id || ''));
    } catch (e) {
      setError(e.message);
      setFarms([]);
    }
  }, []);

  useEffect(() => {
    load();
    getFarmerInformation()
      .then((r) => setProfile((r?.data || r)?.farmer_profile || null))
      .catch(() => setProfile(null));
  }, [load]);

  const openAdd = () => {
    setFormErrors({});
    // First farm: start from the farm address on the profile. Later ones: same district.
    const base = farms?.length ? { province: farms[0].location?.province, district: farms[0].location?.district } : farmLocationFromProfile(profile);
    setForm({ values: { ...emptyForm(base, profile?.avocado_type), farm_name: farms?.length ? `Farm ${farms.length + 1}` : 'My farm' } });
  };

  const openEdit = (f) => {
    setFormErrors({});
    setForm({
      id: f.id,
      values: {
        farm_name: f.farmName,
        location: { province: '', district: '', sector: '', cell: '', village: '', ...(f.location || {}) },
        tree_count: f.tree_count ?? '',
        farm_size: f.farm_size || '',
        varieties: f.varieties?.length ? f.varieties : [],
        planting_year: f.planting_date ? new Date(f.planting_date).getFullYear() : '',
        irrigation_system: f.irrigation_system || '',
      },
    });
  };

  const setValue = (k, v) => {
    setForm((f) => ({ ...f, values: { ...f.values, [k]: v } }));
    setFormErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = form.values;
    const errs = {};
    if (!v.farm_name.trim()) errs.farm_name = 'Give the farm a name';
    if (!v.location.district) errs.district = 'Choose the district';
    if (v.tree_count !== '' && (!Number.isInteger(Number(v.tree_count)) || Number(v.tree_count) < 0)) errs.tree_count = 'Whole number';
    if (v.planting_year !== '' && (Number(v.planting_year) < 1950 || Number(v.planting_year) > THIS_YEAR)) errs.planting_year = `Between 1950 and ${THIS_YEAR}`;
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = {
        farm_name: v.farm_name.trim(),
        location: Object.fromEntries(Object.entries(v.location).filter(([, x]) => x)),
        varieties: v.varieties,
        ...(v.tree_count !== '' && { tree_count: Number(v.tree_count) }),
        ...(v.farm_size !== '' && { farm_size: Number(v.farm_size) }),
        ...(v.irrigation_system && { irrigation_system: v.irrigation_system }),
      };
      if (form.id) {
        const { farm_name, ...rest } = payload;
        await updateFarm(form.id, {
          farmName: farm_name,
          ...rest,
          ...(v.planting_year && { planting_date: `${v.planting_year}-01-01` }),
        });
        toast.success('Farm updated');
      } else {
        const created = await addMyFarm({ ...payload, ...(v.planting_year && { planting_year: Number(v.planting_year) }) });
        setSelected(created.id);
        toast.success('Farm added — now mark it on the map below');
      }
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archive = async (f) => {
    if (!(await confirm(`Remove "${f.farmName}" from your farms? Its harvest records are kept.`, { confirmLabel: 'Remove farm' }))) return;
    try {
      await archiveFarm(f.id);
      toast.success('Farm removed');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const totals = (farms || []).reduce(
    (t, f) => ({ trees: t.trees + (f.tree_count || 0), ha: t.ha + (f.farm_size || 0), gps: t.gps + (f.latitude != null ? 1 : 0), verified: t.verified + (f.land_verified_at ? 1 : 0) }),
    { trees: 0, ha: 0, gps: 0, verified: 0 }
  );
  const current = farms?.find((f) => f.id === selected);
  const v = form?.values;

  return (
    <Page>
      <PageHeader
        icon={LandPlot}
        title="My Farms"
        subtitle="All your avocado farms in one place. Add each farm, mark it on the map and add its land title (UPI) so your VBA can verify it."
        actions={
          <>
            <Button icon={Plus} onClick={openAdd} disabled={farms === null}>Add a farm</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>
          </>
        }
      />

      {farms === null ? (
        <Card><Spinner label="Loading your farms…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : farms.length === 0 ? (
        <Card>
          <EmptyState
            icon={LandPlot}
            title="No farm yet"
            description="Add your first farm — it takes less than a minute. You only need its name, where it is and how many trees it has."
            action={<Button icon={Plus} onClick={openAdd}>Add my first farm</Button>}
          />
        </Card>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Farms" value={farms.length} icon={LandPlot} />
            <StatCard label="Trees" value={totals.trees.toLocaleString()} icon={Trees} tone="blue" />
            <StatCard label="Area" value={`${Math.round(totals.ha * 100) / 100} ha`} icon={Ruler} tone="amber" />
            <StatCard label="Land verified" value={`${totals.verified} of ${farms.length}`} hint={`${totals.gps} on the map`} icon={ShieldCheck} tone="slate" />
          </StatGrid>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {farms.map((f) => {
              const active = f.id === selected;
              return (
                <section
                  key={f.id}
                  className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition ${active ? 'border-brand-400 ring-2 ring-brand-200' : 'border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-slate-900">{f.farmName}</h2>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{place(f.location)}</span></p>
                    </div>
                    {f.land_verified_at ? <Badge tone="brand"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Verified</Badge> : <Badge tone="amber">Not verified</Badge>}
                  </div>
                  <dl className="my-4 grid grid-cols-3 gap-2 text-sm">
                    <div><dt className="text-xs text-slate-500">Trees</dt><dd className="font-semibold text-slate-900">{(f.tree_count || 0).toLocaleString()}</dd></div>
                    <div><dt className="text-xs text-slate-500">Area</dt><dd className="font-semibold text-slate-900">{f.farm_size ? `${f.farm_size} ha` : '—'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Planted</dt><dd className="font-semibold text-slate-900">{f.planting_date ? new Date(f.planting_date).getFullYear() : '—'}</dd></div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(f.varieties || []).map((x) => <Badge key={x}><Sprout className="mr-1 h-3 w-3" />{x}</Badge>)}
                    {f.latitude == null && <Badge tone="rose"><MapPinOff className="mr-1 h-3 w-3" />Not on map</Badge>}
                    {f._count?.harvest_lots > 0 && <Badge tone="blue"><PackageCheck className="mr-1 h-3 w-3" />{f._count.harvest_lots} harvest lots</Badge>}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    <Button size="sm" variant={active ? 'primary' : 'secondary'} icon={MapPin} onClick={() => setSelected(f.id)}>Map & land title</Button>
                    <Link to={`/dashboard/farmer/HarvestingDay?farm=${f.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      <CalendarCheck className="h-3.5 w-3.5" /> Book harvest
                    </Link>
                    <button type="button" title="Edit" onClick={() => openEdit(f)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                    {farms.length > 1 && (
                      <button type="button" title="Remove" onClick={() => archive(f)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><Archive className="h-4 w-4" /></button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {current && (
            <Card title={`${current.farmName} — map & land title`} subtitle={place(current.location)}>
              <div className="mb-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <Info className="mt-0.5 h-5 w-5 shrink-0" />
                <ol className="list-decimal space-y-0.5 pl-5">
                  <li>Type the UPI from your land title (e.g. <span className="font-mono">5/01/02/03/1234</span>) and press <b>Check</b>.</li>
                  <li>Standing on the farm, press <b>Use my GPS</b> — or click the map where the farm is.</li>
                  <li>Optional: <b>Draw boundary</b> by clicking each corner of the field.</li>
                  <li>Press <b>Save land details</b>. Your VBA verifies it on the next visit.</li>
                </ol>
              </div>
              <LandEditor key={current.id} farmId={current.id} mapHeight={440} onSaved={load} />
            </Card>
          )}
        </>
      )}

      {form && (
        <Dialog
          title={form.id ? 'Edit farm' : 'Add a farm'}
          subtitle={form.id ? undefined : 'Only the name and district are required.'}
          onClose={() => setForm(null)}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" form="farm-form" loading={saving}>{form.id ? 'Save' : 'Add farm'}</Button>
            </>
          }
        >
          <form id="farm-form" onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Farm name" required hint="A name you will recognise, e.g. “Home farm” or “Hill plot”.">
              <input className={inputClass} value={v.farm_name} maxLength={80} onChange={(e) => setValue('farm_name', e.target.value)} />
              {formErrors.farm_name && <span className="mt-1 block text-xs text-rose-600">{formErrors.farm_name}</span>}
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Where is it?</p>
              <LocationPicker idPrefix="farm-form" value={v.location} onChange={(l) => setValue('location', l)} errors={{ district: formErrors.district }} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Number of trees">
                <input type="number" min="0" step="1" inputMode="numeric" className={inputClass} value={v.tree_count} onChange={(e) => setValue('tree_count', e.target.value)} />
                {formErrors.tree_count && <span className="mt-1 block text-xs text-rose-600">{formErrors.tree_count}</span>}
              </Field>
              <Field label="Size (hectares)">
                <input type="number" min="0" step="0.01" inputMode="decimal" className={inputClass} value={v.farm_size} onChange={(e) => setValue('farm_size', e.target.value)} />
              </Field>
              <Field label="Year planted">
                <input type="number" min="1950" max={THIS_YEAR} inputMode="numeric" placeholder={String(THIS_YEAR - 3)} className={inputClass} value={v.planting_year} onChange={(e) => setValue('planting_year', e.target.value)} />
                {formErrors.planting_year && <span className="mt-1 block text-xs text-rose-600">{formErrors.planting_year}</span>}
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">Varieties</legend>
              <div className="flex flex-wrap gap-2">
                {VARIETIES.map((x) => {
                  const on = v.varieties.includes(x);
                  return (
                    <button
                      type="button"
                      key={x}
                      aria-pressed={on}
                      onClick={() => setValue('varieties', on ? v.varieties.filter((y) => y !== x) : [...v.varieties, x])}
                      className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset ${on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                    >
                      {x}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Watering">
              <select className={inputClass} value={v.irrigation_system} onChange={(e) => setValue('irrigation_system', e.target.value)}>
                <option value="">Not specified</option>
                {IRRIGATION.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
}
