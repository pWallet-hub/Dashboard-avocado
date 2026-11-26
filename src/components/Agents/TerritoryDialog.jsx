/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { MapPinned, Plus, Trash2, Users } from 'lucide-react';
import { Dialog, Button, Badge, Spinner } from '../Ui/kit';
import LocationPicker from '../Location/LocationPicker';
import { getAgentTerritory, setAgentTerritory } from '../../services/agent-information';
import { useToast } from '../Ui/Toast';
import { describeArea } from '../../utils/rwandaLocations';

const emptyArea = () => ({ province: '', district: '', sector: '', cell: '', village: '' });

/**
 * Admin: choose the area(s) a VBA serves. A VBA only sees and serves the
 * farmers inside these areas. An area can be a whole province, a district,
 * a sector, a cell or a single village.
 */
export default function TerritoryDialog({ agent, onClose, onSaved }) {
  const toast = useToast();
  const [areas, setAreas] = useState(null);
  const [covered, setCovered] = useState(null);
  const [draft, setDraft] = useState(emptyArea());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAgentTerritory(agent.id)
      .then((t) => {
        setAreas(t.territory || []);
        setCovered(t.farmers_covered);
      })
      .catch((e) => {
        toast.error(e.message);
        setAreas([]);
      });
  }, [agent.id, toast]);

  const add = () => {
    if (!draft.province) return;
    const area = Object.fromEntries(Object.entries(draft).filter(([, v]) => v));
    if (!areas.some((a) => JSON.stringify(a) === JSON.stringify(area))) setAreas([...areas, area]);
    setDraft(emptyArea());
    setCovered(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await setAgentTerritory(agent.id, areas);
      toast.success(`Area saved — ${res.farmers_covered} farmer${res.farmers_covered === 1 ? '' : 's'} covered`);
      onSaved?.(res);
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={`Area served by ${agent.full_name}`}
      subtitle="This VBA will only see and serve farmers in these areas."
      onClose={() => !saving && onClose()}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button icon={MapPinned} onClick={save} loading={saving} disabled={areas === null}>Save area</Button>
        </>
      }
    >
      {areas === null ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Assigned areas</p>
              {covered != null && <Badge tone="blue"><Users className="mr-1 h-3.5 w-3.5" />{covered} farmer{covered === 1 ? '' : 's'}</Badge>}
            </div>
            {areas.length === 0 ? (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">No area yet — this VBA sees no farmers until you add one.</p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {areas.map((a, i) => (
                  <li key={JSON.stringify(a)} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-slate-800"><MapPinned className="h-4 w-4 text-brand-600" />{describeArea(a)}</span>
                    <button type="button" aria-label="Remove area" onClick={() => { setAreas(areas.filter((_, j) => j !== i)); setCovered(null); }} className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Add an area</p>
            <LocationPicker idPrefix="terr" value={draft} onChange={setDraft} required="province" columns={3} />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{draft.province ? `Adds: ${describeArea(Object.fromEntries(Object.entries(draft).filter(([, v]) => v)))}` : 'Stop at any level: a whole province, a district, a sector…'}</p>
              <Button size="sm" icon={Plus} onClick={add} disabled={!draft.province}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
