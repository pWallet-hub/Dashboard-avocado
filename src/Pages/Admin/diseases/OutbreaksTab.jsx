import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, ShieldAlert } from 'lucide-react';
import { listDiseaseOutbreaksPage, declareDiseaseOutbreak, updateDiseaseOutbreak } from '../../../services/diseasesService';
import { useToast } from '../../../components/Ui/Toast';
import { Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination } from '../../../components/Ui/kit';
import { SEVERITIES, OUTBREAK_STATUSES, SEVERITY_TONES, OUTBREAK_TONES, cap, fmtDate, clean } from './shared';

const EMPTY_DECLARE = { disease_name: '', severity: 'medium', province: '', district: '', description: '', response_plan: '' };

/** Regional disease outbreaks: declare, then track status / response plan until resolved. */
const OutbreaksTab = ({ diseases, onChanged }) => {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null); // { mode: 'declare' | 'update', item?, values }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDiseaseOutbreaksPage({ page, limit: 15, status });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openUpdate = (o) =>
    setDialog({
      mode: 'update',
      item: o,
      values: { status: o.status, affected_farms: o.affected_farms ?? '', response_plan: o.response_plan || '', description: o.description || '' },
    });

  const setValue = (k, val) => setDialog((d) => ({ ...d, values: { ...d.values, [k]: val } }));

  const submit = async (e) => {
    e.preventDefault();
    const v = dialog.values;
    if (dialog.mode === 'declare' && !v.disease_name.trim()) return toast.error('Disease is required');
    if (v.affected_farms !== undefined && v.affected_farms !== '' && (!Number.isInteger(Number(v.affected_farms)) || Number(v.affected_farms) < 0)) {
      return toast.error('Affected farms must be a whole number');
    }
    setBusy(true);
    try {
      if (dialog.mode === 'declare') {
        await declareDiseaseOutbreak(clean(v));
        toast.success('Outbreak declared');
      } else {
        const payload = { status: v.status, response_plan: v.response_plan.trim(), description: v.description.trim() };
        if (v.affected_farms !== '') payload.affected_farms = Number(v.affected_farms);
        await updateDiseaseOutbreak(dialog.item.id, payload);
        toast.success('Outbreak updated');
      }
      setDialog(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || 'Failed to save outbreak');
    } finally {
      setBusy(false);
    }
  };

  const v = dialog?.values;

  return (
    <Card
      padded={false}
      title="Outbreaks"
      subtitle="Declared regional outbreaks and their response"
      actions={<Button icon={Plus} onClick={() => setDialog({ mode: 'declare', values: EMPTY_DECLARE })}>Declare outbreak</Button>}
    >
      <div className="border-b border-slate-100 p-4">
        <select className={inputClass + ' sm:max-w-[180px]'} aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {OUTBREAK_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
      </div>
      {loading ? (
        <Spinner label="Loading outbreaks…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No outbreaks" description={status ? 'Try a different filter.' : 'No outbreaks have been declared.'} />
      ) : (
        <>
          <Table head={['Outbreak', 'Disease', 'Region', 'Severity', 'Farms', 'Cases', 'Started', 'Status', '']}>
            {rows.map((o) => (
              <tr key={o.id}>
                <Td className="font-mono text-xs">{o.outbreak_number}</Td>
                <Td className="font-medium text-slate-900">{o.disease_name}</Td>
                <Td>{[o.district, o.province].filter(Boolean).join(', ') || '—'}</Td>
                <Td><Badge tone={SEVERITY_TONES[o.severity]}>{cap(o.severity)}</Badge></Td>
                <Td>{o.affected_farms ?? 0}</Td>
                <Td>{o._count?.cases ?? 0}</Td>
                <Td>{fmtDate(o.start_date)}{o.end_date ? ` – ${fmtDate(o.end_date)}` : ''}</Td>
                <Td><Badge tone={OUTBREAK_TONES[o.status]}>{cap(o.status)}</Badge></Td>
                <Td className="text-right">
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openUpdate(o)} aria-label={`Update outbreak ${o.outbreak_number}`} />
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
        </>
      )}

      {dialog && (
        <Dialog
          title={dialog.mode === 'declare' ? 'Declare outbreak' : `Update ${dialog.item.outbreak_number}`}
          subtitle={dialog.mode === 'update' ? dialog.item.disease_name : undefined}
          onClose={() => !busy && setDialog(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="outbreak-form" loading={busy}>{dialog.mode === 'declare' ? 'Declare' : 'Save'}</Button>
            </>
          }
        >
          <form id="outbreak-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dialog.mode === 'declare' ? (
              <>
                <Field label="Disease" required hint="Pick from the registry or type a name" className="sm:col-span-2">
                  <input className={inputClass} list="outbreak-diseases" value={v.disease_name} onChange={(e) => setValue('disease_name', e.target.value)} />
                  <datalist id="outbreak-diseases">
                    {diseases.map((d) => <option key={d.id} value={d.name} />)}
                  </datalist>
                </Field>
                <Field label="Severity">
                  <select className={inputClass} value={v.severity} onChange={(e) => setValue('severity', e.target.value)}>
                    {SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </Field>
                <Field label="Province">
                  <input className={inputClass} value={v.province} onChange={(e) => setValue('province', e.target.value)} />
                </Field>
                <Field label="District">
                  <input className={inputClass} value={v.district} onChange={(e) => setValue('district', e.target.value)} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Status" hint={v.status === 'resolved' ? 'The end date is set automatically.' : undefined}>
                  <select className={inputClass} value={v.status} onChange={(e) => setValue('status', e.target.value)}>
                    {OUTBREAK_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </Field>
                <Field label="Affected farms">
                  <input type="number" min="0" step="1" className={inputClass} value={v.affected_farms} onChange={(e) => setValue('affected_farms', e.target.value)} />
                </Field>
              </>
            )}
            <Field label="Description" className="sm:col-span-2">
              <textarea className={textareaClass} value={v.description} onChange={(e) => setValue('description', e.target.value)} />
            </Field>
            <Field label="Response plan" className="sm:col-span-2">
              <textarea className={textareaClass} value={v.response_plan} onChange={(e) => setValue('response_plan', e.target.value)} />
            </Field>
          </form>
        </Dialog>
      )}
    </Card>
  );
};

export default OutbreaksTab;
