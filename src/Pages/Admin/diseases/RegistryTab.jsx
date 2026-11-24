import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Ban, RotateCcw, ListChecks } from 'lucide-react';
import {
  listDiseaseRegistryPage,
  createDiseaseRegistryEntry,
  updateDiseaseRegistryEntry,
  deleteDiseaseRegistryEntry,
} from '../../../services/diseasesService';
import { useToast } from '../../../components/Ui/Toast';
import { useConfirm } from '../../../components/Ui/ConfirmDialog';
import { Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination } from '../../../components/Ui/kit';
import { clean } from './shared';

const EMPTY = { name: '', description: '', symptoms: '', treatment: '', prevention: '' };
const truncate = (s, n = 60) => (!s ? '—' : s.length > n ? `${s.slice(0, n)}…` : s);

/** Disease registry: the catalogue of known diseases (admin CRUD; "delete" deactivates). */
const RegistryTab = ({ onChanged }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | entry
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDiseaseRegistryPage({ page, limit: 15, search: query, is_active: active });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, query, active]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (entry) => {
    setForm(entry === 'new' ? EMPTY : Object.fromEntries(Object.keys(EMPTY).map((k) => [k, entry[k] || ''])));
    setEditing(entry);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Disease name is required');
    setBusy(true);
    try {
      if (editing === 'new') {
        await createDiseaseRegistryEntry(clean(form));
        toast.success('Disease added to registry');
      } else {
        const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
        await updateDiseaseRegistryEntry(editing.id, payload);
        toast.success('Disease updated');
      }
      setEditing(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || 'Failed to save disease');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (entry) => {
    if (entry.is_active) {
      const ok = await confirm(`Deactivate "${entry.name}"? It will no longer be offered when reporting cases. You can reactivate it later.`, { confirmLabel: 'Deactivate' });
      if (!ok) return;
    }
    try {
      if (entry.is_active) await deleteDiseaseRegistryEntry(entry.id);
      else await updateDiseaseRegistryEntry(entry.id, { is_active: true });
      toast.success(entry.is_active ? 'Disease deactivated' : 'Disease reactivated');
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || 'Failed to update disease');
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card
      padded={false}
      title="Disease registry"
      subtitle="Known diseases, their symptoms and recommended treatment"
      actions={<Button icon={Plus} onClick={() => open('new')}>Add disease</Button>}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <input className={inputClass + ' sm:max-w-xs'} placeholder="Search by name…" aria-label="Search diseases" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={inputClass + ' sm:max-w-[180px]'} aria-label="Active filter" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}>
          <option value="">All entries</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>
      {loading ? (
        <Spinner label="Loading registry…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="No diseases found" description={query || active ? 'Try a different filter.' : 'Add the diseases agents should be able to report.'} />
      ) : (
        <>
          <Table head={['Name', 'Symptoms', 'Treatment', 'Status', '']}>
            {rows.map((d) => (
              <tr key={d.id}>
                <Td className="font-medium text-slate-900">{d.name}</Td>
                <Td>{truncate(d.symptoms)}</Td>
                <Td>{truncate(d.treatment)}</Td>
                <Td>{d.is_active ? <Badge tone="brand">Active</Badge> : <Badge>Inactive</Badge>}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" icon={Pencil} onClick={() => open(d)} aria-label={`Edit ${d.name}`} />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={d.is_active ? Ban : RotateCcw}
                      onClick={() => toggleActive(d)}
                      aria-label={`${d.is_active ? 'Deactivate' : 'Reactivate'} ${d.name}`}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
        </>
      )}

      {editing && (
        <Dialog
          title={editing === 'new' ? 'Add disease' : 'Edit disease'}
          onClose={() => !busy && setEditing(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="registry-form" loading={busy}>Save</Button>
            </>
          }
        >
          <form id="registry-form" onSubmit={submit} className="space-y-4">
            <Field label="Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Anthracnose" maxLength={120} />
            </Field>
            {['description', 'symptoms', 'treatment', 'prevention'].map((k) => (
              <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                <textarea className={textareaClass} value={form[k]} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
          </form>
        </Dialog>
      )}
    </Card>
  );
};

export default RegistryTab;
