import { useEffect, useState } from 'react';
import { LandPlot, Info } from 'lucide-react';
import { Page, PageHeader, Card, inputClass, EmptyState, Spinner } from '../../components/Ui/kit';
import LandEditor from '../../components/Map/LandEditor';
import { getFarmOptions } from '../../services/harvestLotsService';
import { useToast } from '../../components/Ui/Toast';

/**
 * Farmer: record where my farm is and its land title (UPI), and draw the
 * parcel boundary. An agent verifies it on the next visit.
 */
export default function MyFarm() {
  const toast = useToast();
  const [farms, setFarms] = useState(null);
  const [farmId, setFarmId] = useState('');

  useEffect(() => {
    getFarmOptions()
      .then((list) => {
        setFarms(list);
        if (list.length) setFarmId(list[0].id);
      })
      .catch((e) => {
        toast.error(e.message);
        setFarms([]);
      });
  }, [toast]);

  return (
    <Page>
      <PageHeader
        icon={LandPlot}
        title="My Farm & Land"
        subtitle="Show where your farm is and add your land title number (UPI). This helps agents find you and buyers trust your harvest."
        actions={
          farms?.length > 1 && (
            <select className={`${inputClass} w-64`} value={farmId} onChange={(e) => setFarmId(e.target.value)} aria-label="Farm">
              {farms.map((f) => <option key={f.id} value={f.id}>{f.farmName}</option>)}
            </select>
          )
        }
      />

      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">How to fill this in</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Type the UPI from your land title (e.g. <span className="font-mono">5/01/02/03/1234</span>) and press <b>Check</b>.</li>
            <li>Standing on your farm, press <b>Use my GPS</b> — or click the map where the farm is.</li>
            <li>Optional: choose <b>Draw boundary</b> and click each corner of your field.</li>
            <li>Press <b>Save land details</b>. Your agent will verify it on the next visit.</li>
          </ol>
        </div>
      </div>

      {farms === null ? (
        <Spinner />
      ) : farms.length === 0 ? (
        <Card>
          <EmptyState icon={LandPlot} title="No farm registered yet" description="Ask your field agent to register your farm, then come back here to add its location and land title." />
        </Card>
      ) : (
        <Card title={farms.find((f) => f.id === farmId)?.farmName || 'My farm'}>
          {farmId && <LandEditor key={farmId} farmId={farmId} mapHeight={460} />}
        </Card>
      )}
    </Page>
  );
}
