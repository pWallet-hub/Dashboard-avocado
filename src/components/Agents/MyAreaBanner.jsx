import { useEffect, useState } from 'react';
import { MapPinned, AlertTriangle } from 'lucide-react';
import { getAgentTerritory } from '../../services/agent-information';
import { describeArea } from '../../utils/rwandaLocations';

const myId = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.id || localStorage.getItem('id');
  } catch {
    return localStorage.getItem('id');
  }
};

/** VBA: the area an admin assigned, which decides which farmers they see. */
export default function MyAreaBanner() {
  const [t, setT] = useState(null);
  useEffect(() => {
    const id = myId();
    if (id) getAgentTerritory(id).then(setT).catch(() => setT(null));
  }, []);
  if (!t) return null;
  if (!t.territory?.length) {
    return (
      <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p><span className="font-semibold">No area assigned yet.</span> An administrator assigns the area you serve; until then no farmers are shown to you.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900 ring-1 ring-brand-200 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2"><MapPinned className="mt-0.5 h-5 w-5 shrink-0" /><span><span className="font-semibold">Your area:</span> {t.territory.map(describeArea).join('; ')}</span></p>
      <span className="shrink-0 text-brand-700">{t.farmers_covered} farmer{t.farmers_covered === 1 ? '' : 's'} · assigned by an admin</span>
    </div>
  );
}
