import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { Dialog, Button, Field, inputClass, Table, Td, Badge, EmptyState, Spinner } from '../Ui/kit';
import { useToast } from '../Ui/Toast';
import { ALL_DISTRICTS } from '../../utils/rwanda';
import { OSM_TYPES, facilityTypeLabel, searchOsmFacilities, importOsmFacilities } from '../../services/facilitiesService';

/**
 * Find markets, banks/SACCOs, agro-input shops, government offices… on
 * OpenStreetMap and add the ones you pick to the facility directory.
 * Places already in the directory are flagged and unticked.
 */
export default function OsmImportDialog({ onClose, onImported }) {
  const toast = useToast();
  const [district, setDistrict] = useState('');
  const [types, setTypes] = useState(['market', 'sacco_bank', 'input_supplier']);
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState(new Set());
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await searchOsmFacilities({ types, district: district || undefined });
      setResult(r);
      setPicked(new Set(r.items.filter((i) => !i.already_in_directory).map((i) => i.external_id)));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const r = await importOsmFacilities(result.items.filter((i) => picked.has(i.external_id)));
      toast.success(`${r.created} facilities added${r.skipped_already_imported ? ` (${r.skipped_already_imported} were already there)` : ''}`);
      onImported?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id) => setPicked((cur) => {
    const n = new Set(cur);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  return (
    <Dialog
      open
      size="xl"
      title="Import facilities from OpenStreetMap"
      subtitle="Open map data, mapped by volunteers. Good for markets, banks, SACCOs and offices; collection centres and cold rooms are rarely mapped — add those by hand."
      onClose={onClose}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {result && <Button icon={Download} loading={busy} disabled={!picked.size} onClick={save}>Add {picked.size} to the directory</Button>}
      </>}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="District">
            <select className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">All of Rwanda</option>
              {ALL_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Types</span>
            <div className="flex flex-wrap gap-2">
              {OSM_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))}
                  className={`rounded-full px-3 py-1 text-sm ring-1 ring-inset ${types.includes(t) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300'}`}
                  aria-pressed={types.includes(t)}>
                  {facilityTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button icon={Search} loading={busy && !result} disabled={!types.length} onClick={search}>Search OpenStreetMap</Button>

        {busy && !result && <Spinner label="Searching… (up to a minute for all of Rwanda)" />}
        {result && (result.items.length === 0 ? (
          <EmptyState icon={Search} title="Nothing found" description="OpenStreetMap has no named places of these types here." />
        ) : (
          <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200">
            <Table head={['', 'Name', 'Type', 'Location', '']}>
              {result.items.map((i) => (
                <tr key={i.external_id}>
                  <Td><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" checked={picked.has(i.external_id)} onChange={() => toggle(i.external_id)} aria-label={`Select ${i.name}`} /></Td>
                  <Td className="font-medium text-slate-900">{i.name}</Td>
                  <Td>{facilityTypeLabel(i.type)}</Td>
                  <Td>{[i.sector, i.district].filter(Boolean).join(', ')}</Td>
                  <Td>{i.already_in_directory ? <Badge tone="amber">Already in directory</Badge> : <Badge tone="brand">New</Badge>}</Td>
                </tr>
              ))}
            </Table>
          </div>
        ))}
        {result && <p className="text-xs text-slate-500">{result.total} found · {result.new} new · {result.attribution}</p>}
      </div>
    </Dialog>
  );
}
