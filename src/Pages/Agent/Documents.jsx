import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Download, Eye, PenTool, UploadCloud, RefreshCw, Eraser } from 'lucide-react';
import { listDocuments, getDocument, downloadDocument, attachSignature, uploadNotarizedCopy } from '../../services/documentsService';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog, Tabs,
} from '../../components/Ui/kit';

const TYPE_LABEL = {
  profile_card: 'Profile card',
  contract: 'Contract',
  ipm_form: 'IPM form',
  notarized_upload: 'Notarized upload',
  other: 'Other',
};
const TYPE_FILTERS = [{ id: '', label: 'All' }, ...Object.entries(TYPE_LABEL).slice(0, 3).map(([id, label]) => ({ id, label }))];
const STATUS = {
  generated: { label: 'Generated', tone: 'slate' },
  pending_notarization: { label: 'Pending review', tone: 'amber' },
  notarized: { label: 'Notarized', tone: 'brand' },
  rejected: { label: 'Rejected', tone: 'rose' },
};
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 5 * 1024 * 1024;
const EXT = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
const fileName = (doc) => `${doc.type || 'document'}-v${doc.version || 1}.${EXT[doc.mimetype] || 'pdf'}`;
const checkFile = (file, imagesOnly = false) => {
  if (!file) return 'Please choose a file';
  const types = imagesOnly ? ALLOWED_TYPES.filter((t) => t.startsWith('image/')) : ALLOWED_TYPES;
  if (!types.includes(file.type)) return imagesOnly ? 'Use a PNG, JPEG or WEBP image' : 'Use a PDF, PNG, JPEG or WEBP file';
  if (file.size > MAX_BYTES) return 'File must be 5 MB or smaller';
  return null;
};

/** Minimal pointer-driven signature pad. Exposes the drawing via onChange(hasInk). */
function SignaturePad({ canvasRef, onChange }) {
  const drawing = useRef(false);
  useEffect(() => {
    const c = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  }, [canvasRef]);
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  return (
    <canvas
      ref={canvasRef}
      aria-label="Signature pad — draw your signature"
      className="h-40 w-full touch-none rounded-lg border border-dashed border-slate-300 bg-white"
      onPointerDown={(e) => {
        drawing.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(...pos(e));
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(...pos(e));
        ctx.stroke();
        onChange(true);
      }}
      onPointerUp={() => { drawing.current = false; }}
      onPointerLeave={() => { drawing.current = false; }}
    />
  );
}

export default function Documents() {
  const toast = useToast();
  const [docs, setDocs] = useState([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowBusy, setRowBusy] = useState(null);

  const [viewing, setViewing] = useState(null);
  const [signing, setSigning] = useState(null); // { doc, mode: 'draw'|'upload', file, hasInk }
  const [notarizing, setNotarizing] = useState(null); // { doc, file }
  const [busy, setBusy] = useState(false);
  const padRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDocs(await listDocuments(type ? { type } : {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const view = async (doc) => {
    setRowBusy(doc.id);
    try {
      setViewing(await getDocument(doc.id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRowBusy(null);
    }
  };

  const download = async (doc) => {
    setRowBusy(doc.id);
    try {
      await downloadDocument(doc.id, fileName(doc));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRowBusy(null);
    }
  };

  const submitSignature = async (e) => {
    e.preventDefault();
    let file = signing.file;
    if (signing.mode === 'draw') {
      if (!signing.hasInk) return toast.error('Please draw your signature first');
      const blob = await new Promise((resolve) => padRef.current.toBlob(resolve, 'image/png'));
      file = new File([blob], 'signature.png', { type: 'image/png' });
    } else {
      const problem = checkFile(file, true);
      if (problem) return toast.error(problem);
    }
    setBusy(true);
    try {
      await attachSignature(signing.doc.id, file);
      toast.success('Signature attached');
      setSigning(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitNotarized = async (e) => {
    e.preventDefault();
    const problem = checkFile(notarizing.file);
    if (problem) return toast.error(problem);
    setBusy(true);
    try {
      await uploadNotarizedCopy(notarizing.doc.id, notarizing.file);
      toast.success('Notarized copy submitted for admin review');
      setNotarizing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const clearPad = () => {
    const c = padRef.current;
    c?.getContext('2d').clearRect(0, 0, c.width, c.height);
    setSigning((s) => ({ ...s, hasInk: false }));
  };

  return (
    <Page>
      <PageHeader
        icon={FileText}
        title="My Documents"
        subtitle="Your profile card, contract and forms. Sign them or upload a notarized copy for review."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>}
      />

      <Card padded={false}>
        <div className="border-b border-slate-100 p-4">
          <Tabs tabs={TYPE_FILTERS} value={type} onChange={setType} />
        </div>
        {loading ? (
          <Spinner label="Loading documents…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Documents generated for your account (profile card, contract, IPM forms) will appear here."
          />
        ) : (
          <Table head={['Document', 'Status', 'Version', 'Signed', 'Updated', 'Actions']}>
            {docs.map((d) => {
              const st = STATUS[d.status] || { label: d.status || 'Unknown', tone: 'slate' };
              const canNotarize = d.status === 'generated' || d.status === 'rejected';
              return (
                <tr key={d.id}>
                  <Td className="font-medium text-slate-900">{TYPE_LABEL[d.type] || d.type || 'Document'}</Td>
                  <Td>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {d.status === 'rejected' && d.rejection_reason && (
                      <p className="mt-1 max-w-[220px] truncate text-xs text-rose-600" title={d.rejection_reason}>{d.rejection_reason}</p>
                    )}
                  </Td>
                  <Td>v{d.version || 1}</Td>
                  <Td>{d.signature_id ? <Badge tone="brand">Signed</Badge> : <span className="text-slate-400">Not signed</span>}</Td>
                  <Td>{fmtDate(d.updated_at || d.created_at)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" icon={Eye} disabled={rowBusy === d.id} onClick={() => view(d)}>Details</Button>
                      <Button size="sm" variant="secondary" icon={Download} loading={rowBusy === d.id} onClick={() => download(d)}>Download</Button>
                      {!d.signature_id && (
                        <Button size="sm" variant="secondary" icon={PenTool} onClick={() => setSigning({ doc: d, mode: 'draw', file: null, hasInk: false })}>Sign</Button>
                      )}
                      {canNotarize && (
                        <Button size="sm" icon={UploadCloud} onClick={() => setNotarizing({ doc: d, file: null })}>Upload notarized</Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {viewing && (
        <Dialog
          title={TYPE_LABEL[viewing.type] || 'Document'}
          subtitle={`Version ${viewing.version || 1}`}
          onClose={() => setViewing(null)}
          footer={<Button icon={Download} onClick={() => download(viewing)}>Download</Button>}
        >
          <dl className="space-y-3 text-sm">
            {[
              ['Status', <Badge key="s" tone={(STATUS[viewing.status] || {}).tone}>{(STATUS[viewing.status] || {}).label || viewing.status}</Badge>],
              ['Signed', viewing.signature_id ? 'Yes' : 'No'],
              ['File type', viewing.mimetype || '—'],
              ['Created', fmtDate(viewing.created_at)],
              ['Last updated', fmtDate(viewing.updated_at)],
              ...(viewing.rejection_reason ? [['Rejection reason', viewing.rejection_reason]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="font-medium text-slate-500">{k}</dt>
                <dd className="text-right text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </Dialog>
      )}

      {signing && (
        <Dialog
          title="Sign document"
          subtitle={TYPE_LABEL[signing.doc.type] || 'Document'}
          onClose={() => !busy && setSigning(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSigning(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="sign-form" icon={PenTool} loading={busy}>Attach signature</Button>
            </>
          }
        >
          <form id="sign-form" onSubmit={submitSignature} className="space-y-4">
            <Tabs
              tabs={[{ id: 'draw', label: 'Draw' }, { id: 'upload', label: 'Upload image' }]}
              value={signing.mode}
              onChange={(mode) => setSigning({ ...signing, mode, hasInk: false })}
            />
            {signing.mode === 'draw' ? (
              <div className="space-y-2">
                <SignaturePad canvasRef={padRef} onChange={(hasInk) => setSigning((s) => (s.hasInk === hasInk ? s : { ...s, hasInk }))} />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Sign with your finger or mouse.</span>
                  <Button size="sm" variant="ghost" icon={Eraser} onClick={clearPad}>Clear</Button>
                </div>
              </div>
            ) : (
              <Field label="Signature image" required hint="PNG, JPEG or WEBP, up to 5 MB.">
                <input type="file" accept="image/png,image/jpeg,image/webp" className={inputClass} onChange={(e) => setSigning({ ...signing, file: e.target.files?.[0] || null })} />
              </Field>
            )}
            <p className="text-xs text-slate-500">A document can be signed once; the signature cannot be replaced afterwards.</p>
          </form>
        </Dialog>
      )}

      {notarizing && (
        <Dialog
          title="Upload notarized copy"
          subtitle={TYPE_LABEL[notarizing.doc.type] || 'Document'}
          onClose={() => !busy && setNotarizing(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setNotarizing(null)} disabled={busy}>Cancel</Button>
              <Button type="submit" form="notarize-form" icon={UploadCloud} loading={busy}>Submit for review</Button>
            </>
          }
        >
          <form id="notarize-form" onSubmit={submitNotarized} className="space-y-4">
            <p className="text-sm text-slate-600">Upload a scan or photo of the stamped document. An admin reviews it before it is marked notarized.</p>
            <Field label="Notarized file" required hint="PDF, PNG, JPEG or WEBP, up to 5 MB.">
              <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className={inputClass} onChange={(e) => setNotarizing({ ...notarizing, file: e.target.files?.[0] || null })} />
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
}
