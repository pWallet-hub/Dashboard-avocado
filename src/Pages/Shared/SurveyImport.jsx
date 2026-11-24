/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, AlertTriangle, XCircle, CheckCircle2, UserPlus, Link2, MapPinned, RotateCcw } from 'lucide-react';
import { Card, StatGrid, StatCard, Badge, Button, Table, Td, EmptyState } from '../../components/Ui/kit';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  previewSurveyImport,
  getImportBatch,
  commitSurveyImport,
  listImportBatches,
  downloadSurveyTemplate,
} from '../../services/surveysService';

const FILTERS = [
  { value: 'all', label: 'All rows' },
  { value: 'errors', label: 'Errors' },
  { value: 'warnings', label: 'Warnings' },
];

/**
 * Excel import wizard for the farmer field survey:
 * 1) upload → 2) review the validated preview → 3) commit (admin).
 */
export default function SurveyImport({ role, onImported }) {
  const toast = useToast();
  const confirm = useConfirm();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState({ create_accounts: true, update_profiles: true });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const isAdmin = role === 'admin';

  const loadHistory = () => listImportBatches().then(setHistory).catch(() => {});
  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!preview) return;
    getImportBatch(preview.batch_id, { filter, page, limit: 25 })
      .then((b) => {
        setRows(b.rows);
        setTotalFiltered(b.total_filtered);
      })
      .catch((e) => toast.error(e.message));
  }, [preview, filter, page, toast]);

  const choose = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(null);
    setResult(null);
  };

  const runPreview = async () => {
    setBusy(true);
    try {
      const p = await previewSurveyImport(file);
      setPreview(p);
      setFilter(p.error_rows ? 'errors' : 'all');
      setPage(1);
      loadHistory();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    const ok = await confirm(
      `Import ${preview.valid_rows} survey rows? ${options.create_accounts ? `${preview.new_farmers} new farmer accounts will be created (they can claim them with their phone number). ` : ''}${preview.error_rows} rows with errors will be skipped.`,
      { confirmLabel: 'Import now' }
    );
    if (!ok) return;
    setBusy(true);
    try {
      const r = await commitSurveyImport(preview.batch_id, options);
      setResult(r);
      toast.success(`Imported ${r.surveys} surveys`);
      loadHistory();
      onImported?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setRows([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Step 1 — upload */}
      <Card
        title="1 · Upload the survey spreadsheet"
        subtitle="Excel (.xlsx/.xls) or CSV with the field-survey columns. Up to 5,000 rows per file."
        actions={<Button variant="secondary" icon={Download} onClick={() => downloadSurveyTemplate().catch((e) => toast.error(e.message))}>Download template</Button>}
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); choose(e.dataTransfer.files?.[0]); }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50'}`}
        >
          <FileSpreadsheet className="h-10 w-10 text-brand-600" />
          <p className="mt-3 font-medium text-slate-900">{file ? file.name : 'Drag the Excel file here'}</p>
          <p className="text-sm text-slate-500">{file ? `${(file.size / 1024).toFixed(0)} KB` : 'or'}</p>
          <div className="mt-3 flex gap-2">
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => choose(e.target.files?.[0])} data-testid="survey-file" />
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>{file ? 'Choose another file' : 'Choose file'}</Button>
            {file && <Button icon={Upload} loading={busy && !preview} onClick={runPreview}>Check file</Button>}
          </div>
          <p className="mt-4 max-w-xl text-xs text-slate-500">
            Tip: format the <b>national_id</b> and phone columns as <b>Text</b> in Excel before typing, otherwise Excel drops digits from 16-digit IDs.
          </p>
        </div>
      </Card>

      {/* Step 2 — preview */}
      {preview && (
        <Card
          title="2 · Review"
          subtitle={`${preview.file_name} · sheet "${preview.sheet}". Nothing has been imported yet.`}
          actions={<Button variant="ghost" icon={RotateCcw} onClick={reset}>Start over</Button>}
        >
          <div className="space-y-5">
            <StatGrid>
              <StatCard label="Rows ready" value={preview.valid_rows} hint={`of ${preview.total_rows} rows`} icon={CheckCircle2} />
              <StatCard label="Rows with errors" value={preview.error_rows} hint="will be skipped" icon={XCircle} tone="rose" />
              <StatCard label="Existing farmers matched" value={preview.matched_existing} hint={`${preview.new_farmers} new farmers`} icon={Link2} tone="blue" />
              <StatCard label="Rows with GPS" value={preview.with_location} hint="will appear on the map" icon={MapPinned} tone="amber" />
            </StatGrid>

            {(preview.columns.unrecognized.length > 0 || preview.columns.missing_core.length > 0) && (
              <div className="space-y-1 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                {preview.columns.missing_core.length > 0 && (
                  <p><b>Missing important columns:</b> {preview.columns.missing_core.join(', ')}</p>
                )}
                {preview.columns.unrecognized.length > 0 && (
                  <p><b>Columns not recognised</b> (kept in the raw record only): {preview.columns.unrecognized.join(', ')}</p>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500">{preview.columns.recognized.length} columns recognised.</p>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setFilter(f.value); setPage(1); }}
                  className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${filter === f.value ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                >
                  {f.label}
                </button>
              ))}
              <span className="self-center text-sm text-slate-500">{totalFiltered} rows</span>
            </div>

            {rows.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing to show" description="No rows match this filter." />
            ) : (
              <Table head={['Row', 'Farmer', 'District', 'Phone / ID', 'Match', 'Issues']}>
                {rows.map((r) => (
                  <tr key={r.row_number} className={r.errors.length ? 'bg-rose-50/40' : ''}>
                    <Td className="text-slate-500">{r.row_number}</Td>
                    <Td className="font-medium text-slate-900">{r.farmer_name || <span className="text-slate-400">—</span>}</Td>
                    <Td>{[r.sector, r.district].filter(Boolean).join(', ') || '—'}</Td>
                    <Td className="text-xs">
                      <div>{r.phone || '—'}</div>
                      <div className="font-mono text-slate-500">{r.national_id || ''}</div>
                    </Td>
                    <Td>
                      {r.errors.length ? <Badge tone="rose">Skipped</Badge>
                        : r.match ? <Badge tone="blue">Existing · {r.match.type === 'national_id' ? 'ID' : 'phone'}</Badge>
                        : <Badge tone="brand">New farmer</Badge>}
                    </Td>
                    <td className="max-w-md px-4 py-3 text-xs">
                      {r.errors.map((e) => <p key={e} className="flex gap-1 text-rose-700"><XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{e}</p>)}
                      {r.warnings.map((w) => <p key={w} className="flex gap-1 text-amber-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{w}</p>)}
                      {!r.errors.length && !r.warnings.length && <span className="text-brand-700">OK</span>}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
            {totalFiltered > 25 && (
              <div className="flex items-center justify-end gap-2 text-sm">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="text-slate-500">Page {page} of {Math.ceil(totalFiltered / 25)}</span>
                <Button variant="secondary" size="sm" disabled={page >= Math.ceil(totalFiltered / 25)} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 3 — commit */}
      {preview && !result && (
        <Card title="3 · Import" subtitle={isAdmin ? 'Creates/links farmer accounts, farms (with GPS) and the survey records.' : 'Only an admin can run the import. Share this preview with an admin.'}>
          {isAdmin ? (
            <div className="space-y-4">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" checked={options.create_accounts}
                  onChange={(e) => setOptions({ ...options, create_accounts: e.target.checked })} />
                <span><b>Create accounts for new farmers.</b> They activate it themselves on the login page (“Activate your account”) using the phone number from the survey. Without this, surveys are stored but not linked to a farmer.</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" checked={options.update_profiles}
                  onChange={(e) => setOptions({ ...options, update_profiles: e.target.checked })} />
                <span><b>Fill empty profile fields of existing farmers</b> from the survey (never overwrites existing values).</span>
              </label>
              <Button icon={UserPlus} loading={busy} disabled={!preview.valid_rows} onClick={commit}>
                Import {preview.valid_rows} rows
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Preview saved as batch <span className="font-mono">{preview.batch_id.slice(0, 8)}</span>.</p>
          )}
        </Card>
      )}

      {result && (
        <Card title="Import finished">
          <StatGrid>
            <StatCard label="Survey records" value={result.surveys} icon={FileSpreadsheet} />
            <StatCard label="New farmer accounts" value={result.created_farmers} icon={UserPlus} tone="blue" />
            <StatCard label="Linked to existing" value={result.linked_farmers} icon={Link2} tone="slate" />
            <StatCard label="Farms created / updated" value={`${result.created_farms} / ${result.updated_farms}`} icon={MapPinned} tone="amber" />
          </StatGrid>
          {result.failed.length > 0 && (
            <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-medium">{result.failed.length} rows failed:</p>
              <ul className="mt-1 list-disc pl-5">{result.failed.slice(0, 20).map((f) => <li key={f.row_number}>Row {f.row_number}: {f.error}</li>)}</ul>
            </div>
          )}
          <div className="mt-4"><Button variant="secondary" icon={RotateCcw} onClick={reset}>Import another file</Button></div>
        </Card>
      )}

      {history.length > 0 && (
        <Card title="Previous imports" padded={false}>
          <Table head={['Date', 'File', 'By', 'Rows', 'Status', 'Result']}>
            {history.map((b) => (
              <tr key={b.id}>
                <Td>{new Date(b.created_at).toLocaleString()}</Td>
                <Td className="max-w-xs truncate">{b.file_name}</Td>
                <Td>{b.creator?.full_name || '—'}</Td>
                <Td>{b.valid_rows}/{b.total_rows}</Td>
                <Td><Badge tone={b.status === 'committed' ? 'brand' : b.status === 'failed' ? 'rose' : 'amber'}>{b.status === 'previewed' ? 'not imported' : b.status}</Badge></Td>
                <Td className="text-xs text-slate-500">{b.result ? `${b.result.surveys} surveys · ${b.result.created_farmers} new farmers` : '—'}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}
