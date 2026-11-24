import { useState, useEffect, useCallback } from 'react';
import { Bug, ListChecks, ShieldAlert, Stethoscope, Activity, AlertTriangle } from 'lucide-react';
import { getDiseaseStatistics, listDiseaseRegistryPage, listDiseaseOutbreaksPage } from '../../services/diseasesService';
import { Page, PageHeader, StatGrid, StatCard, Tabs } from '../../components/Ui/kit';
import RegistryTab from './diseases/RegistryTab';
import CasesTab from './diseases/CasesTab';
import OutbreaksTab from './diseases/OutbreaksTab';

const TABS = [
  { id: 'cases', label: 'Cases', icon: Stethoscope },
  { id: 'outbreaks', label: 'Outbreaks', icon: ShieldAlert },
  { id: 'registry', label: 'Registry', icon: ListChecks },
];

const sumCounts = (list = []) => list.reduce((n, x) => n + (x?.count || 0), 0);
const countFor = (list = [], key, value) => list.find((x) => x?.[key] === value)?.count || 0;

const Diseases = () => {
  const [tab, setTab] = useState('cases');
  const [stats, setStats] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [activeOutbreaks, setActiveOutbreaks] = useState([]);

  // Page-wide data: headline statistics plus lookups used by the case/outbreak forms.
  const refresh = useCallback(() => {
    getDiseaseStatistics().then(setStats).catch(() => setStats(null));
    listDiseaseRegistryPage({ limit: 100, is_active: 'true' }).then((r) => setDiseases(r.data)).catch(() => setDiseases([]));
    listDiseaseOutbreaksPage({ limit: 100, status: 'active' }).then((r) => setActiveOutbreaks(r.data)).catch(() => setActiveOutbreaks([]));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byStatus = stats?.cases_by_status;
  const bySeverity = stats?.cases_by_severity;
  const top = stats?.top_diseases?.[0];
  const show = (n) => (stats ? n.toLocaleString() : '—');

  return (
    <Page>
      <PageHeader icon={Bug} title="Disease Management" subtitle="Track disease cases on farms, declare outbreaks and maintain the disease registry" />

      <StatGrid>
        <StatCard label="Total cases" value={show(sumCounts(byStatus))} icon={Stethoscope} tone="slate" />
        <StatCard label="Active cases" value={show(countFor(byStatus, 'status', 'active'))} icon={Activity} tone="rose" />
        <StatCard
          label="High / critical cases"
          value={show(countFor(bySeverity, 'severity', 'high') + countFor(bySeverity, 'severity', 'critical'))}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label="Active outbreaks"
          value={show(stats?.active_outbreaks_count ?? 0)}
          hint={top ? `Most reported: ${top.disease_name} (${top.count})` : undefined}
          icon={ShieldAlert}
          tone="blue"
        />
      </StatGrid>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'cases' && <CasesTab diseases={diseases} outbreaks={activeOutbreaks} onChanged={refresh} />}
      {tab === 'outbreaks' && <OutbreaksTab diseases={diseases} onChanged={refresh} />}
      {tab === 'registry' && <RegistryTab onChanged={refresh} />}
    </Page>
  );
};

export default Diseases;
