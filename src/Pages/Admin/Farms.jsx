import { useState, useEffect, useCallback } from 'react';
import { Trees, MapPin, UserCheck, Plus, Pencil, Archive, RefreshCw, Layers, Sprout, CheckCircle2 } from 'lucide-react';
import { listFarmsPage, getFarmsOverview, assignFarmAgent, createFarm, updateFarm, archiveFarm } from '../../services/farmsService';
import { listUsersPage } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';

// Backend FarmStatus enum (dash-api prisma/schema.prisma)
const STATUS_OPTIONS = ['preparing', 'planted', 'growing', 'producing', 'harvesting', 'dormant'];
const STATUS_TONES = { preparing: 'slate', planted: 'blue', growing: 'brand', producing: 'brand', harvesting: 'amber', dormant: 'slate' };
const LOCATION_KEYS = ['province', 'district', 'sector', 'cell', 'village'];
const PAGE_SIZE = 15;

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
const farmName = (f) => f?.farmName || f?.farm_name || 'Unnamed farm';
const num = (n, digits = 0) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits });

const emptyForm = () => ({
  farmer_id: '', farm_name: '', farm_size: '', tree_count: '', varieties: '', status: 'planted',
  planting_date: '', notes: '', province: '', district: '', sector: '', cell: '', village: '',
});

const formFromFarm = (f) => ({
  farmer_id: f.farmer_id || '',
  farm_name: farmName(f),
  farm_size: f.farm_size ?? '',
  tree_count: f.tree_count ?? '',
  varieties: Array.isArray(f.varieties) ? f.varieties.join(', ') : '',
  status: f.status || 'planted',
  planting_date: f.planting_date ? String(f.planting_date).slice(0, 10) : '',
  notes: f.notes || '',
  ...Object.fromEntries(LOCATION_KEYS.map((k) => [k, f.location?.[k] || ''])),
});

const AdminFarms = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [farms, setFarms] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);

  const [agents, setAgents] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [agentId, setAgentId] = useState('');

  const [editing, setEditing] = useState(null); // null | 'new' | farm
  const [form, setForm] = useState(emptyForm);
  const [farmers, setFarmers] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, ov] = await Promise.all([
        listFarmsPage({ page, limit: PAGE_SIZE, status }),
        getFarmsOverview().catch(() => null),
      ]);
      setFarms(list.data);
      setPagination(list.pagination);
      setOverview(ov);
    } catch (err) {
      setError(err.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listUsersPage('agents', { limit: 100 })
      .then((r) => setAgents(r.data))
      .catch(() => setAgents([]));
  }, []);

  // Farmer picker for the create dialog: server-side search, debounced.
  useEffect(() => {
    if (editing !== 'new') return undefined;
    const t = setTimeout(() => {
      listUsersPage('farmers', { limit: 50, search: farmerSearch.trim() })
        .then((r) => setFarmers(r.data))
        .catch(() => setFarmers([]));
    }, 300);
    return () => clearTimeout(t);
  }, [editing, farmerSearch]);

  const term = filter.trim().toLowerCase();
  const visible = term
    ? farms.filter((f) => farmName(f).toLowerCase().includes(term) || (f.farmerName || f.farmer?.full_name || '').toLowerCase().includes(term))
    : farms;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(emptyForm());
    setFarmerSearch('');
    setEditing('new');
  };

  const openEdit = (farm) => {
    setForm(formFromFarm(farm));
    setEditing(farm);
  };

  const submitFarm = async (e) => {
    e.preventDefault();
    if (editing === 'new' && !form.farmer_id) return toast.error('Select the farmer who owns this farm');
    if (!form.farm_name.trim()) return toast.error('Farm name is required');
    if (form.farm_size !== '' && Number(form.farm_size) < 0) return toast.error('Farm size cannot be negative');
    if (form.tree_count !== '' && (!Number.isInteger(Number(form.tree_count)) || Number(form.tree_count) < 0)) {
      return toast.error('Tree count must be a whole number');
    }
    const payload = {
      farm_name: form.farm_name.trim(),
      status: form.status,
      notes: form.notes.trim() || null,
      varieties: form.varieties.split(',').map((v) => v.trim()).filter(Boolean),
      location: {
        ...(editing !== 'new' ? editing.location : {}),
        ...Object.fromEntries(LOCATION_KEYS.map((k) => [k, form[k].trim() || null])),
      },
    };
    if (form.farm_size !== '') payload.farm_size = Number(form.farm_size);
    if (form.tree_count !== '') payload.tree_count = Number(form.tree_count);
    if (form.planting_date) payload.planting_date = form.planting_date;

    setBusy(true);
    try {
      if (editing === 'new') {
        await createFarm({ ...payload, farmer_id: form.farmer_id });
        toast.success('Farm registered');
      } else {
        await updateFarm(editing.id, payload);
        toast.success('Farm updated');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save farm');
    } finally {
      setBusy(false);
    }
  };

  const doArchive = async (farm) => {
    const ok = await confirm(`Archive "${farmName(farm)}"? It stays in the records but is marked as archived.`, { confirmLabel: 'Archive' });
    if (!ok) return;
    try {
      await archiveFarm(farm.id);
      toast.success('Farm archived');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to archive farm');
    }
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!agentId) return toast.error('Select an agent');
    setBusy(true);
    try {
      await assignFarmAgent(assignTarget.id, agentId);
      toast.success('Agent assigned — an initial assessment visit was scheduled for next week');
      setAssignTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to assign agent');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <PageHeader
        icon={Trees}
        title="Farms"
        subtitle="All registered farms across the platform"
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={openCreate}>Register farm</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Total farms" value={overview ? num(overview.total_farms) : '—'} icon={Trees} />
        <StatCard label="Total area" value={overview ? `${num(overview.total_area, 1)} ha` : '—'} icon={Layers} tone="blue" />
        <StatCard label="Total trees" value={overview ? num(overview.total_trees) : '—'} icon={Sprout} tone="amber" />
        <StatCard label="Producing farms" value={overview ? num(overview.by_status?.producing) : '—'} icon={CheckCircle2} tone="slate" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <input
            className={inputClass + ' sm:max-w-xs'}
            placeholder="Filter this page by farm or farmer…"
            aria-label="Filter farms on this page"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            className={inputClass + ' sm:max-w-[200px]'}
            aria-label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading farms…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState icon={Trees} title="No farms found" description={term || status ? 'Try a different filter.' : 'Register the first farm to get started.'} />
        ) : (
          <>
            <Table head={['Farm', 'Farmer', 'Location', 'Size', 'Trees', 'Status', '']}>
              {visible.map((f) => {
                const archived = Boolean(f.archived_at);
                return (
                  <tr key={f.id} className={archived ? 'opacity-60' : undefined}>
                    <Td className="font-medium text-slate-900">{farmName(f)}</Td>
                    <Td>{f.farmerName || f.farmer?.full_name || '—'}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {[f.location?.district, f.location?.province].filter(Boolean).join(', ') || '—'}
                      </span>
                    </Td>
                    <Td>{f.farm_size ? `${num(f.farm_size, 2)} ha` : '—'}</Td>
                    <Td>{num(f.tree_count)}</Td>
                    <Td>
                      {archived ? <Badge>Archived</Badge> : <Badge tone={STATUS_TONES[f.status]}>{cap(f.status)}</Badge>}
                    </Td>
                    <Td className="text-right">
                      {!archived && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" icon={UserCheck} onClick={() => { setAssignTarget(f); setAgentId(''); }} aria-label={`Assign agent to ${farmName(f)}`} title="Assign agent" />
                          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(f)} aria-label={`Edit ${farmName(f)}`} title="Edit" />
                          <Button size="sm" variant="ghost" icon={Archive} onClick={() => doArchive(f)} aria-label={`Archive ${farmName(f)}`} title="Archive" />
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {assignTarget && (
        <Dialog
          title="Assign agent"
          subtitle={farmName(assignTarget)}
          onClose={() => !busy && setAssignTarget(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAssignTarget(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="assign-agent-form" loading={busy}>Assign</Button>
            </>
          }
        >
          <form id="assign-agent-form" onSubmit={submitAssign} className="space-y-3">
            <Field label="Agent" required>
              <select className={inputClass} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
                <option value="">Select agent</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>)}
              </select>
            </Field>
            <p className="text-xs text-slate-500">This schedules an initial farm assessment visit for the agent one week from today.</p>
          </form>
        </Dialog>
      )}

      {editing && (
        <Dialog
          size="lg"
          title={editing === 'new' ? 'Register farm' : 'Edit farm'}
          subtitle={editing === 'new' ? undefined : farmName(editing)}
          onClose={() => !busy && setEditing(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="farm-form" loading={busy}>{editing === 'new' ? 'Register' : 'Save changes'}</Button>
            </>
          }
        >
          <form id="farm-form" onSubmit={submitFarm} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editing === 'new' ? (
              <>
                <Field label="Search farmers">
                  <input className={inputClass} value={farmerSearch} onChange={(e) => setFarmerSearch(e.target.value)} placeholder="Name, email or phone" />
                </Field>
                <Field label="Farmer" required>
                  <select className={inputClass} value={form.farmer_id} onChange={(e) => set('farmer_id', e.target.value)}>
                    <option value="">Select farmer</option>
                    {farmers.map((u) => <option key={u.id} value={u.id}>{u.full_name}{u.phone ? ` (${u.phone})` : ''}</option>)}
                  </select>
                </Field>
              </>
            ) : (
              <Field label="Farmer" className="sm:col-span-2">
                <input className={inputClass} value={editing.farmerName || editing.farmer?.full_name || ''} disabled />
              </Field>
            )}
            <Field label="Farm name" required className="sm:col-span-2">
              <input className={inputClass} value={form.farm_name} onChange={(e) => set('farm_name', e.target.value)} maxLength={150} />
            </Field>
            <Field label="Size (hectares)">
              <input type="number" min="0" step="0.01" className={inputClass} value={form.farm_size} onChange={(e) => set('farm_size', e.target.value)} />
            </Field>
            <Field label="Number of trees">
              <input type="number" min="0" step="1" className={inputClass} value={form.tree_count} onChange={(e) => set('tree_count', e.target.value)} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </Field>
            <Field label="Planting date">
              <input type="date" className={inputClass} value={form.planting_date} onChange={(e) => set('planting_date', e.target.value)} />
            </Field>
            <Field label="Varieties" hint="Comma separated, e.g. Hass, Fuerte" className="sm:col-span-2">
              <input className={inputClass} value={form.varieties} onChange={(e) => set('varieties', e.target.value)} />
            </Field>
            {LOCATION_KEYS.map((k) => (
              <Field key={k} label={cap(k)}>
                <input className={inputClass} value={form[k]} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default AdminFarms;
