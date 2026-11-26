/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, RefreshCw, Pencil, Trash2, LocateFixed, Search, Navigation } from 'lucide-react';
import {
  listFacilities, saveFacility, deleteFacility, currentPosition, directionsUrl, FACILITY_TYPES, facilityTypeLabel,
} from '../../services/facilitiesService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, Spinner, Dialog, Pagination, Table, Td } from '../../components/Ui/kit';
import { ALL_DISTRICTS } from '../../utils/rwanda';

const emptyForm = () => ({
  name: '', type: 'market', description: '', district: '', sector: '', latitude: '', longitude: '',
  contact_name: '', contact_phone: '', opening_hours: '', active: true,
});

/**
 * Markets, collection centres, cold rooms, airports… with GPS, so farmers can
 * see the nearest ones on their "Near my farm" page. Admins and agents edit;
 * only admins delete.
 */
export default function Facilities({ role = 'admin' }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', district: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFacilities({ ...filters, page, limit: 20 });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (k, val) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: val }));
  };

  const openForm = (f) =>
    setForm(f
      ? { id: f.id, values: { ...emptyForm(), ...Object.fromEntries(Object.entries(f).filter(([k]) => k in emptyForm()).map(([k, val]) => [k, val ?? ''])) } }
      : { values: emptyForm() });
  const setValue = (k, val) => setForm((f) => ({ ...f, values: { ...f.values, [k]: val } }));

  const fillMyLocation = async () => {
    setLocating(true);
    try {
      const p = await currentPosition();
      setForm((f) => ({ ...f, values: { ...f.values, latitude: p.lat, longitude: p.lng } }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLocating(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form.values, latitude: Number(form.values.latitude), longitude: Number(form.values.longitude) };
      ['description', 'sector', 'contact_name', 'contact_phone', 'opening_hours'].forEach((k) => {
        if (payload[k] === '') payload[k] = form.id ? null : undefined;
      });
      await saveFacility(form.id, payload);
      toast.success(form.id ? 'Facility updated' : 'Facility added');
      setForm(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (f) => {
    if (!(await confirm(`Delete "${f.name}"? Farmers will no longer see it.`, { confirmLabel: 'Delete' }))) return;
    try {
      await deleteFacility(f.id);
      toast.success('Facility deleted');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const v = form?.values;

  return (
    <Page>
      <PageHeader
        icon={Building2}
        title="Facilities & Infrastructure"
        subtitle="Markets, collection centres, cold storage, airports and other places farmers need. Farmers see the nearest ones to their farm."
        actions={
          <>
            <Button icon={Plus} onClick={() => openForm(null)}>Add facility</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          </>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search by name" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <select className={inputClass} value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            {FACILITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className={inputClass} value={filters.district} onChange={(e) => setFilter('district', e.target.value)}>
            <option value="">All districts</option>
            {ALL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </Card>

      <Card padded={false}>
        {loading && !items.length ? (
          <Spinner />
        ) : !items.length ? (
          <EmptyState icon={Building2} title="No facilities yet" description="Add markets, collection centres and other places so farmers can find them." />
        ) : (
          <>
            <Table head={['Name', 'Type', 'Location', 'Contact', 'Status', '']}>
              {items.map((f) => (
                <tr key={f.id}>
                  <Td className="whitespace-normal font-medium text-slate-900">{f.name}</Td>
                  <Td>{facilityTypeLabel(f.type)}</Td>
                  <Td>
                    {[f.sector, f.district].filter(Boolean).join(', ')}
                    <a href={directionsUrl(f.latitude, f.longitude)} target="_blank" rel="noopener noreferrer" title="Open in maps" className="ml-2 inline-flex text-brand-700"><Navigation className="h-4 w-4" /></a>
                  </Td>
                  <Td>{[f.contact_name, f.contact_phone].filter(Boolean).join(' · ') || '—'}</Td>
                  <Td><Badge tone={f.active ? 'brand' : 'slate'}>{f.active ? 'Visible' : 'Hidden'}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Edit" onClick={() => openForm(f)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                      {role === 'admin' && (
                        <button type="button" title="Delete" onClick={() => remove(f)} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {form && (
        <Dialog
          title={form.id ? 'Edit facility' : 'Add a facility'}
          onClose={() => setForm(null)}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" form="facility-form" loading={busy}>Save</Button>
            </>
          }
        >
          <form id="facility-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required className="sm:col-span-2">
              <input className={inputClass} required value={v.name} onChange={(e) => setValue('name', e.target.value)} />
            </Field>
            <Field label="Type" required>
              <select className={inputClass} value={v.type} onChange={(e) => setValue('type', e.target.value)}>
                {FACILITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="District" required>
              <select className={inputClass} required value={v.district} onChange={(e) => setValue('district', e.target.value)}>
                <option value="">Choose…</option>
                {ALL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Sector">
              <input className={inputClass} value={v.sector} onChange={(e) => setValue('sector', e.target.value)} />
            </Field>
            <Field label="Opening hours">
              <input className={inputClass} placeholder="e.g. Mon–Sat 7:00–17:00" value={v.opening_hours} onChange={(e) => setValue('opening_hours', e.target.value)} />
            </Field>
            <Field label="Latitude" required hint="Rwanda is between −1.0 and −2.9">
              <input type="number" step="any" required className={inputClass} value={v.latitude} onChange={(e) => setValue('latitude', e.target.value)} />
            </Field>
            <Field label="Longitude" required hint="Rwanda is between 28.8 and 30.95">
              <input type="number" step="any" required className={inputClass} value={v.longitude} onChange={(e) => setValue('longitude', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="button" variant="secondary" size="sm" icon={LocateFixed} onClick={fillMyLocation} loading={locating}>
                I am at this place — use my location
              </Button>
            </div>
            <Field label="Contact name">
              <input className={inputClass} value={v.contact_name} onChange={(e) => setValue('contact_name', e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <input className={inputClass} value={v.contact_phone} onChange={(e) => setValue('contact_phone', e.target.value)} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea className={textareaClass} value={v.description} onChange={(e) => setValue('description', e.target.value)} placeholder="What farmers can do here (sell, store, ship…)" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
              <input type="checkbox" checked={v.active} onChange={(e) => setValue('active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              Visible to farmers
            </label>
          </form>
        </Dialog>
      )}
    </Page>
  );
}
