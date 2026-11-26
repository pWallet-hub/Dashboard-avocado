import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, FileSpreadsheet, Download, AlertTriangle, XCircle, CheckCircle2, UserPlus, Link2, MapPinned, RotateCcw, Copy, Smartphone, Landmark, FolderOpen,
} from 'lucide-react';
import { Card, StatGrid, StatCard, Badge, Button, Table, Td, EmptyState } from '../../components/Ui/kit';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  previewSurveyImport,
  getImportBatch,
  getImportStatus,
  commitSurveyImport,
  listImportBatches,
  downloadSurveyTemplate,
} from '../../services/surveysService';

const FILTERS = [
  { value: 'all', label: 'All rows' },
  { value: 'errors', label: 'Errors' },
  { value: 'warnings', label: 'Warnings' },
  { value: 'duplicates', label: 'Merged / repeated' },
];

const KIND_LABEL = { survey: 'Field survey', register: 'ASR member register' };
const PAGE_SIZE = 25;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Defaults for counters a re-opened batch may not carry. */
const withDefaults = (b) => ({
  matched_existing: 0, new_farmers: 0, with_location: 0, with_upi: 0, without_phone: 0, duplicate_rows: 0,
  columns: { recognized: [], unrecognized: [], missing_core: [] }, sheets: [], ...b, batch_id: b.batch_id || b.id,
});

/**
 * Bring farmers into the system from Excel — the field survey (one sheet per
 * district is fine) or the ASR member register.
 * 1) upload → 2) review the validated preview → 3) import (admin).
 * New farmers get an account they activate themselves with an SMS code.
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
  const [progress, setProgress] = useState(null); // { progress, total_rows } while importing
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const isAdmin = role === 'admin';
  const activationPath = `/dashboard/${isAdmin ? 'admin' : 'agent'}/activation`;

  const loadHistory = useCallback(() => listImportBatches().then(setHistory).catch(() => {}), []);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!preview) return;
    getImportBatch(preview.batch_id, { filter, page, limit: PAGE_SIZE })
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
      setPreview(withDefaults(p));
      setFilter(p.error_rows ? 'errors' : 'all');
      setPage(1);
      loadHistory();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  /** Follow a background import until it finishes. */
  const follow = useCallback(async (batchId) => {
    for (;;) {
      await sleep(2000);
      let s;
      try {
        s = await getImportStatus(batchId);
      } catch {
        continue; // transient network error: keep polling
      }
      setProgress({ progress: s.progress, total_rows: s.total_rows });
      if (s.status === 'committed' || s.status === 'failed') {
        setProgress(null);
        setResult({ ...s.result, status: s.status });
        if (s.status === 'failed') toast.error('The import stopped. You can resume it from "Previous imports".');
        else toast.success('Import finished');
        loadHistory();
        onImported?.();
        return;
      }
    }
  }, [toast, loadHistory, onImported]);

  const commit = async () => {
    const ok = await confirm(
      `Import ${preview.valid_rows - preview.duplicate_rows} rows? ${options.create_accounts ? `About ${preview.new_farmers} new farmer accounts will be created — each farmer activates their own account with a code sent to their phone. ` : ''}${preview.error_rows} rows with errors are skipped.`,
      { confirmLabel: 'Import now' }
    );
    if (!ok) return;
    setBusy(true);
    try {
      const r = await commitSurveyImport(preview.batch_id, options);
      if (r.background) {
        setProgress({ progress: r.progress || 0, total_rows: r.total_rows });
        await follow(preview.batch_id);
      } else {
        setResult(r);
        toast.success(`Imported ${r.created_farmers} new and ${r.linked_farmers} existing farmers`);
        loadHistory();
        onImported?.();
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  /** Re-open a saved batch: review an agent's preview, resume or watch an import. */
  const openBatch = async (b) => {
    try {
      const full = await getImportBatch(b.id, { limit: 1 });
      setFile(null);
      setResult(null);
      setPreview(withDefaults(full));
      setFilter(full.error_rows ? 'errors' : 'all');
      setPage(1);
      if (b.status === 'committing') {
        setProgress({ progress: full.progress, total_rows: full.total_rows });
        setBusy(true);
        follow(b.id).finally(() => setBusy(false));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(null);
    setRows([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const pages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const importable = preview ? preview.valid_rows - (preview.duplicate_rows || 0) : 0;
  const resumable = preview && preview.status === 'failed' && preview.progress < preview.total_rows;
  const canCommit = preview && (preview.status === undefined || preview.status === 'previewed' || resumable);

  return (
    <div className="space-y-6">
      {/* Step 1 — upload */}
      <Card
        title="1 · Upload the farmer spreadsheet"
        subtitle="The field survey (one sheet per district is fine) or the ASR member register (firstname, lastname, telephone, idnumber, UPI …). Every sheet is read. Up to 25,000 rows."
        actions={<Button variant="secondary" icon={Download} onClick={() => downloadSurveyTemplate().catch((e) => toast.error(e.message))}>Survey template</Button>}
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
            Big files take up to a minute to check. Tip: format the <b>national ID</b> and phone columns as <b>Text</b> in Excel, otherwise Excel drops digits from 16-digit IDs.
          </p>
        </div>
      </Card>

      {/* Step 2 — preview */}
      {preview && (
        <Card
          title="2 · Review"
          subtitle={`${preview.file_name} · ${KIND_LABEL[preview.kind] || 'Spreadsheet'}${preview.status && preview.status !== 'previewed' ? ` · ${preview.status}` : ' · nothing has been imported yet'}`}
          actions={<Button variant="ghost" icon={RotateCcw} onClick={reset}>Start over</Button>}
        >
          <div className="space-y-5">
            <StatGrid>
              <StatCard label="Rows to import" value={importable.toLocaleString()} hint={`of ${preview.total_rows.toLocaleString()} rows`} icon={CheckCircle2} />
              <StatCard label="Rows with errors" value={preview.error_rows} hint={preview.duplicate_rows ? `skipped · ${preview.duplicate_rows} repeated rows merged` : 'will be skipped'} icon={XCircle} tone="rose" />
              <StatCard label="Farmers" value={`${preview.new_farmers.toLocaleString()} new`} hint={`${preview.matched_existing.toLocaleString()} rows match farmers already in the system`} icon={Link2} tone="blue" />
              <StatCard label="Without a usable phone" value={preview.without_phone.toLocaleString()} hint="cannot activate until a phone is added" icon={Smartphone} tone="amber" />
            </StatGrid>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge tone="slate"><MapPinned className="mr-1 h-3.5 w-3.5" />{preview.with_location.toLocaleString()} with GPS</Badge>
              <Badge tone="slate"><Landmark className="mr-1 h-3.5 w-3.5" />{preview.with_upi.toLocaleString()} with a valid UPI</Badge>
            </div>

            {preview.sheets?.length > 1 && (
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="mb-2 font-medium text-slate-800">Sheets</p>
                <div className="flex flex-wrap gap-2">
                  {preview.sheets.map((s) => (
                    <span key={s.name} title={s.skipped_reason || s.note || ''}>
                      <Badge tone={s.skipped_reason ? 'slate' : s.note ? 'amber' : 'brand'}>
                        {s.name}: {s.skipped_reason ? 'skipped' : `${s.rows} rows`}{s.note ? ' *' : ''}
                      </Badge>
                    </span>
                  ))}
                </div>
                {preview.sheets.some((s) => s.note) && <p className="mt-2 text-xs text-slate-500">* Sheet had no header row — read with the columns of the sheet before it.</p>}
              </div>
            )}

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
              <span className="self-center text-sm text-slate-500">{totalFiltered.toLocaleString()} rows</span>
            </div>

            {rows.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing to show" description="No rows match this filter." />
            ) : (
              <Table head={['Row', 'Farmer', 'Farm location', 'Phone / ID / UPI', 'Match', 'Issues']}>
                {rows.map((r) => (
                  <tr key={`${r.sheet || ''}-${r.row_number}`} className={r.errors.length ? 'bg-rose-50/40' : r.skip ? 'bg-slate-50' : ''}>
                    <Td className="text-xs text-slate-500">{r.sheet && <div>{r.sheet}</div>}<div>row {r.row_number}</div></Td>
                    <Td className="font-medium text-slate-900">{r.farmer_name || <span className="text-slate-400">—</span>}</Td>
                    <Td>{[r.sector, r.district].filter(Boolean).join(', ') || '—'}</Td>
                    <Td className="text-xs">
                      <div>{r.phone || <span className="text-amber-700">no phone</span>}</div>
                      <div className="font-mono text-slate-500">{r.national_id || ''}</div>
                      {r.upi && <div className="font-mono text-slate-500">UPI {r.upi}</div>}
                    </Td>
                    <Td>
                      {r.errors.length ? <Badge tone="rose">Skipped</Badge>
                        : r.skip ? <Badge tone="slate">Merged</Badge>
                        : r.match ? <Badge tone="blue">Existing · {r.match.type === 'national_id' ? 'ID' : 'phone'}</Badge>
                        : <Badge tone="brand">New farmer</Badge>}
                    </Td>
                    <td className="max-w-md px-4 py-3 text-xs">
                      {r.skip && <p className="flex gap-1 text-slate-600"><Copy className="mt-0.5 h-3.5 w-3.5 shrink-0" />{r.skip}</p>}
                      {r.errors.map((e) => <p key={e} className="flex gap-1 text-rose-700"><XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{e}</p>)}
                      {r.warnings.map((w) => <p key={w} className="flex gap-1 text-amber-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{w}</p>)}
                      {!r.errors.length && !r.warnings.length && !r.skip && <span className="text-brand-700">OK</span>}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
            {totalFiltered > PAGE_SIZE && (
              <div className="flex items-center justify-end gap-2 text-sm">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="text-slate-500">Page {page} of {pages}</span>
                <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 3 — commit */}
      {preview && !result && (canCommit || progress) && (
        <Card
          title="3 · Import"
          subtitle={isAdmin ? 'Creates or links farmer accounts, profiles and farms (GPS point and UPI). Field surveys are also stored as survey records.' : 'Only an admin can run the import. The admin finds this preview under “Previous imports” → Open.'}
        >
          {progress ? (
            <div className="space-y-2" aria-live="polite">
              <p className="text-sm text-slate-700">Importing… {progress.progress.toLocaleString()} of {progress.total_rows.toLocaleString()} rows. You can leave this page — the import carries on.</p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${Math.round((progress.progress / Math.max(1, progress.total_rows)) * 100)}%` }} />
              </div>
            </div>
          ) : isAdmin ? (
            <div className="space-y-4">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" checked={options.create_accounts}
                  onChange={(e) => setOptions({ ...options, create_accounts: e.target.checked })} />
                <span><b>Create accounts for new farmers.</b> Nobody gets a password: each farmer activates their own account on “Activate your account” with a code sent by SMS to the phone number in the file.</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" checked={options.update_profiles}
                  onChange={(e) => setOptions({ ...options, update_profiles: e.target.checked })} />
                <span><b>Fill empty profile fields of existing farmers</b> from the file (never overwrites existing values).</span>
              </label>
              <Button icon={UserPlus} loading={busy} disabled={!importable} onClick={commit}>
                {resumable ? `Resume import (row ${preview.progress} of ${preview.total_rows})` : `Import ${importable.toLocaleString()} rows`}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Preview saved as batch <span className="font-mono">{preview.batch_id.slice(0, 8)}</span>.</p>
          )}
        </Card>
      )}

      {result && (
        <Card title={result.status === 'failed' ? 'Import stopped' : 'Import finished'}>
          <StatGrid>
            <StatCard label="New farmer accounts" value={result.created_farmers} hint={result.accounts_without_phone ? `${result.accounts_without_phone} without a phone` : 'all with a phone'} icon={UserPlus} tone="blue" />
            <StatCard label="Linked to existing" value={result.linked_farmers} icon={Link2} tone="slate" />
            <StatCard label="Farms created / updated" value={`${result.created_farms} / ${result.updated_farms}`} hint={result.upis_saved ? `${result.upis_saved} UPIs saved` : undefined} icon={MapPinned} tone="amber" />
            <StatCard label="Survey records" value={result.surveys} hint={result.skipped_duplicates ? `${result.skipped_duplicates} repeated rows merged` : undefined} icon={FileSpreadsheet} />
          </StatGrid>
          {result.upi_conflicts > 0 && (
            <p className="mt-3 text-sm text-amber-800">{result.upi_conflicts} UPIs were already registered to another farmer’s farm and were not copied — check them on the land issues list.</p>
          )}
          {result.failed?.length > 0 && (
            <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-medium">{result.failed.length} rows failed:</p>
              <ul className="mt-1 list-disc pl-5">{result.failed.slice(0, 20).map((f) => <li key={`${f.sheet || ''}-${f.row_number}`}>{f.sheet ? `${f.sheet} ` : ''}row {f.row_number}: {f.error}</li>)}</ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {result.created_farmers > 0 && (
              <Link to={`${activationPath}?batch_id=${preview?.batch_id || ''}`}>
                <Button icon={Smartphone}>Invite these farmers to activate</Button>
              </Link>
            )}
            <Button variant="secondary" icon={RotateCcw} onClick={reset}>Import another file</Button>
          </div>
        </Card>
      )}

      {history.length > 0 && (
        <Card title="Previous imports" padded={false}>
          <Table head={['Date', 'File', 'Type', 'By', 'Rows', 'Status', 'Result', '']}>
            {history.map((b) => (
              <tr key={b.id}>
                <Td>{new Date(b.created_at).toLocaleString()}</Td>
                <Td className="max-w-xs truncate">{b.file_name}</Td>
                <Td className="text-xs">{KIND_LABEL[b.kind] || '—'}</Td>
                <Td>{b.creator?.full_name || '—'}</Td>
                <Td>{b.valid_rows}/{b.total_rows}</Td>
                <Td>
                  <Badge tone={b.status === 'committed' ? 'brand' : b.status === 'failed' ? 'rose' : 'amber'}>
                    {b.status === 'previewed' ? 'not imported' : b.status === 'committing' ? `importing ${b.progress}/${b.total_rows}` : b.status}
                  </Badge>
                </Td>
                <Td className="text-xs text-slate-500">{b.result && b.status !== 'committing' ? `${b.result.created_farmers} new · ${b.result.linked_farmers} linked farmers` : '—'}</Td>
                <Td>
                  {b.status !== 'committed' && (
                    <Button variant="secondary" size="sm" icon={FolderOpen} onClick={() => openBatch(b)}>
                      {b.status === 'previewed' ? (isAdmin ? 'Review & import' : 'Open') : b.status === 'failed' ? 'Open / resume' : 'Watch'}
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}
