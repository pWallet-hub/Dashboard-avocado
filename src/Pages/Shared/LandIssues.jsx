import { useCallback, useEffect, useState } from 'react';
import { MapPinOff, ExternalLink, MapPinned } from 'lucide-react';
import { Page, PageHeader, Card, Badge, Button, Table, Td, EmptyState, Spinner, ErrorState, Pagination, Dialog, inputClass } from '../../components/Ui/kit';
import LandEditor from '../../components/Map/LandEditor';
import { ALL_DISTRICTS } from '../../utils/rwanda';
import { getLandIssues } from '../../services/activationService';
import { RWASIS_PORTAL_URL } from '../../services/landService';

const ISSUES = [
  { code: '', label: 'All issues' },
  { code: 'upi_without_boundary', label: 'UPI but no boundary' },
  { code: 'not_on_map', label: 'Not on the map' },
  { code: 'point_outside_boundary', label: 'GPS point outside boundary' },
  { code: 'area_mismatch', label: 'Area ≠ farm size' },
  { code: 'far_from_district', label: 'Wrong district' },
];

/**
 * Farms whose land data is missing or inconsistent, so agents can fix maps
 * after a visit (or by tracing the parcel seen on RwaSIS). Opening a row edits
 * the farm's land right here.
 */
export default function LandIssues({ role }) {
  const [filters, setFilters] = useState({ code: 'upi_without_boundary', district: '', page: 1 });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await getLandIssues({ ...filters, limit: 25 }));
    } catch (e) {
      setError(e.message);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (patch) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  return (
    <Page>
      <PageHeader
        icon={MapPinOff}
        title="Land data issues"
        subtitle="Farms whose map is missing or does not add up. Fix them after a farm visit, or trace the parcel you see on RwaSIS for the farm's UPI."
        actions={<a href={RWASIS_PORTAL_URL} target="_blank" rel="noreferrer"><Button variant="secondary" icon={ExternalLink}>Open RwaSIS</Button></a>}
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data ? (
        <Spinner label="Checking farms…" />
      ) : (
        <Card padded={false}>
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {ISSUES.map((i) => (
                <button key={i.code} onClick={() => set({ code: i.code })}
                  className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${filters.code === i.code ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
                  {i.label}{i.code && data.counts[i.code] ? ` · ${data.counts[i.code].toLocaleString()}` : ''}
                </button>
              ))}
            </div>
            <select className={`${inputClass} md:ml-auto md:w-48`} value={filters.district} onChange={(e) => set({ district: e.target.value })} aria-label="District">
              <option value="">All districts</option>
              {ALL_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          {data.items.length === 0 ? (
            <EmptyState icon={MapPinned} title="Nothing to fix here" description={`${data.farms_checked.toLocaleString()} farms checked.`} />
          ) : (
            <Table head={['Farm', 'Location', 'UPI', 'Issues', '']}>
              {data.items.map((f) => (
                <tr key={f.farm_id}>
                  <Td>
                    <div className="font-medium text-slate-900">{f.farm_name}</div>
                    <div className="text-xs text-slate-500">{f.farmer_name}</div>
                  </Td>
                  <Td>{[f.sector, f.district].filter(Boolean).join(', ') || '—'}</Td>
                  <Td className="font-mono text-xs">{f.upi || '—'}</Td>
                  <td className="max-w-md px-4 py-3 text-xs text-amber-800">
                    {f.issues.map((i) => <p key={i.code}>{i.message}</p>)}
                    {f.verified && <Badge tone="brand" className="mt-1">verified earlier</Badge>}
                  </td>
                  <Td><Button size="sm" variant="secondary" onClick={() => setEditing(f)}>Fix map</Button></Td>
                </tr>
              ))}
            </Table>
          )}
          <Pagination page={data.page} totalPages={Math.ceil(data.total / data.limit)} total={data.total} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </Card>
      )}

      {editing && (
        <Dialog open title={`Land — ${editing.farm_name}`} subtitle={editing.farmer_name} onClose={() => { setEditing(null); load(); }} size="xl">
          <LandEditor farmId={editing.farm_id} canVerify={role === 'admin' || role === 'agent'} mapHeight={380} />
        </Dialog>
      )}
    </Page>
  );
}
