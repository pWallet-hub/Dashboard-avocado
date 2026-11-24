import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Stethoscope } from 'lucide-react';
import { listDiseaseCasesPage, reportDiseaseCase, updateDiseaseCase } from '../../../services/diseasesService';
import { listFarmsPage } from '../../../services/farmsService';
import { useToast } from '../../../components/Ui/Toast';
import { Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination } from '../../../components/Ui/kit';
import { SEVERITIES, CASE_STATUSES, SEVERITY_TONES, CASE_TONES, cap, fmtDate, clean } from './shared';

const EMPTY_REPORT = { farm_id: '', disease_name: '', severity: 'low', affected_trees: '', symptoms: '', notes: '', outbreak_id: '' };

/** Disease cases reported on individual farms; admin can report and update them. */
const CasesTab = ({ diseases, outbreaks, onChanged }) => {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', severity: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farms, setFarms] = useState([]);
  const [dialog, setDialog] = useState(null); // { mode: 'report' | 'update', item?, values }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDiseaseCasesPage({ page, limit: 15, ...filters });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const openReport = () => {
    setDialog({ mode: 'report', values: EMPTY_REPORT });
    if (farms.length === 0) {
      listFarmsPage({ limit: 100 })
        .then((r) => setFarms(r.data.filter((f) => !f.archived_at)))
        .catch(() => toast.error('Could not load farms'));
    }
  };

  const openUpdate = (c) =>
    setDialog({
      mode: 'update',
      item: c,
      values: { status: c.status, severity: c.severity, affected_trees: c.affected_trees ?? '', treatment: c.treatment || '', notes: c.notes || '' },
    });

  const setValue = (k, v) => setDialog((d) => ({ ...d, values: { ...d.values, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    const v = dialog.values;
    if (v.affected_trees !== '' && (!Number.isInteger(Number(v.affected_trees)) || Number(v.affected_trees) < 0)) {
      return toast.error('Affected trees must be a whole number');
    }
    setBusy(true);
    try {
      if (dialog.mode === 'report') {
        if (!v.farm_id || !v.disease_name.trim()) {
          setBusy(false);
          return toast.error('Farm and disease are required');
        }
        const payload = clean(v);
        if (payload.affected_trees !== undefined) payload.affected_trees = Number(payload.affected_trees);
        await reportDiseaseCase(payload);
        toast.success('Disease case reported');
      } else {
        const payload = { status: v.status, severity: v.severity, treatment: v.treatment.trim(), notes: v.notes.trim() };
        if (v.affected_trees !== '') payload.affected_trees = Number(v.affected_trees);
        if (v.status === 'resolved' && dialog.item.status !== 'resolved') payload.resolved_date = new Date().toISOString();
        await updateDiseaseCase(dialog.item.id, payload);
        toast.success('Case updated');
      }
      setDialog(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || 'Failed to save case');
    } finally {
      setBusy(false);
    }
  };

  const setFilter = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const v = dialog?.values;

  return (
    <Card padded={false} title="Disease cases" subtitle="Cases reported on individual farms" actions={<Button icon={Plus} onClick={openReport}>Report case</Button>}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <select className={inputClass + ' sm:max-w-[180px]'} aria-label="Status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {CASE_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
        <select className={inputClass + ' sm:max-w-[180px]'} aria-label="Severity" value={filters.severity} onChange={(e) => setFilter('severity', e.target.value)}>
          <option value="">All severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
      </div>
      {loading ? (
        <Spinner label="Loading cases…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No disease cases" description={filters.status || filters.severity ? 'Try a different filter.' : 'Cases reported by agents and farmers will appear here.'} />
      ) : (
        <>
          <Table head={['Case', 'Disease', 'Farm', 'Severity', 'Trees', 'Detected', 'Status', '']}>
            {rows.map((c) => (
              <tr key={c.id}>
                <Td className="font-mono text-xs">{c.case_number}</Td>
                <Td className="font-medium text-slate-900">{c.disease_name}</Td>
                <Td>{c.farm?.farmName || '—'}</Td>
                <Td><Badge tone={SEVERITY_TONES[c.severity]}>{cap(c.severity)}</Badge></Td>
                <Td>{c.affected_trees ?? 0}</Td>
                <Td>{fmtDate(c.detected_date)}</Td>
                <Td><Badge tone={CASE_TONES[c.status]}>{cap(c.status)}</Badge></Td>
                <Td className="text-right">
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openUpdate(c)} aria-label={`Update case ${c.case_number}`} />
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
        </>
      )}

      {dialog && (
        <Dialog
          title={dialog.mode === 'report' ? 'Report disease case' : `Update case ${dialog.item.case_number}`}
          subtitle={dialog.mode === 'update' ? `${dialog.item.disease_name} · ${dialog.item.farm?.farmName || ''}` : undefined}
          onClose={() => !busy && setDialog(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="case-form" loading={busy}>{dialog.mode === 'report' ? 'Report' : 'Save'}</Button>
            </>
          }
        >
          <form id="case-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dialog.mode === 'report' ? (
              <>
                <Field label="Farm" required className="sm:col-span-2">
                  <select className={inputClass} value={v.farm_id} onChange={(e) => setValue('farm_id', e.target.value)}>
                    <option value="">{farms.length ? 'Select farm' : 'Loading farms…'}</option>
                    {farms.map((f) => <option key={f.id} value={f.id}>{f.farmName} — {f.farmerName || f.farmer?.full_name}</option>)}
                  </select>
                </Field>
                <Field label="Disease" required hint="Pick from the registry or type a name" className="sm:col-span-2">
                  <input className={inputClass} list="registry-diseases" value={v.disease_name} onChange={(e) => setValue('disease_name', e.target.value)} />
                  <datalist id="registry-diseases">
                    {diseases.map((d) => <option key={d.id} value={d.name} />)}
                  </datalist>
                </Field>
              </>
            ) : (
              <Field label="Status">
                <select className={inputClass} value={v.status} onChange={(e) => setValue('status', e.target.value)}>
                  {CASE_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </Field>
            )}
            <Field label="Severity">
              <select className={inputClass} value={v.severity} onChange={(e) => setValue('severity', e.target.value)}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </Field>
            <Field label="Affected trees">
              <input type="number" min="0" step="1" className={inputClass} value={v.affected_trees} onChange={(e) => setValue('affected_trees', e.target.value)} />
            </Field>
            {dialog.mode === 'report' && (
              <Field label="Linked outbreak">
                <select className={inputClass} value={v.outbreak_id} onChange={(e) => setValue('outbreak_id', e.target.value)}>
                  <option value="">None</option>
                  {outbreaks.map((o) => <option key={o.id} value={o.id}>{o.outbreak_number} — {o.disease_name}</option>)}
                </select>
              </Field>
            )}
            {dialog.mode === 'report' ? (
              <Field label="Symptoms" className="sm:col-span-2">
                <textarea className={textareaClass} value={v.symptoms} onChange={(e) => setValue('symptoms', e.target.value)} />
              </Field>
            ) : (
              <Field label="Treatment" className="sm:col-span-2">
                <textarea className={textareaClass} value={v.treatment} onChange={(e) => setValue('treatment', e.target.value)} />
              </Field>
            )}
            <Field label="Notes" className="sm:col-span-2">
              <textarea className={textareaClass} value={v.notes} onChange={(e) => setValue('notes', e.target.value)} />
            </Field>
          </form>
        </Dialog>
      )}
    </Card>
  );
};

export default CasesTab;
