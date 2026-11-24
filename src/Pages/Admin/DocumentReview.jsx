import { useCallback, useEffect, useState } from 'react';
import { FileCheck2, Eye, Download, CheckCircle2, XCircle, RefreshCw, Search, Upload, FileText, UserRound, Info } from 'lucide-react';
import {
  listDocumentsPage,
  fetchDocumentBlob,
  downloadDocument,
  reviewNotarization,
  uploadNotarizedCopy,
} from '../../services/documentsService';
import { listUsersPage } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

// Backend DocumentType / DocumentStatus enums (dash-api prisma/schema.prisma).
const TYPE_LABELS = {
  profile_card: 'Profile card',
  contract: 'Contract',
  ipm_form: 'IPM form',
  notarized_upload: 'Notarized upload',
  other: 'Other',
};
const STATUS_META = {
  generated: { label: 'Generated', tone: 'slate' },
  pending_notarization: { label: 'Pending review', tone: 'amber' },
  notarized: { label: 'Notarized', tone: 'brand' },
  rejected: { label: 'Rejected', tone: 'rose' },
};
const statusMeta = (s) => STATUS_META[s] || { label: s || 'Unknown', tone: 'slate' };

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fileName = (doc) => doc?.file_key?.split('/').pop() || `document-${doc?.id}`;
const ROLE_LABELS = { farmer: 'Farmer', agent: 'Agent', shop_manager: 'Shop manager', admin: 'Admin' };

/** Search users by name/email and pick one whose documents to review. */
const OwnerPicker = ({ owner, onSelect }) => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await listUsersPage('all', { search: q, limit: 8 });
        if (!cancelled) setResults(res.data);
      } catch (err) {
        if (!cancelled) toast.error(err.message);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, toast]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a user by name or email…"
          aria-label="Search users"
          className={`${inputClass} pl-9`}
        />
      </div>
      {searching && <p className="text-sm text-slate-500">Searching…</p>}
      {!searching && query.trim().length >= 2 && results.length === 0 && <p className="text-sm text-slate-500">No users match “{query.trim()}”.</p>}
      {results.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(u);
                  setQuery('');
                  setResults([]);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${owner?.id === u.id ? 'bg-brand-50' : ''}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-900">{u.full_name || u.email}</span>
                  <span className="block truncate text-xs text-slate-500">{u.email}</span>
                </span>
                <Badge>{ROLE_LABELS[u.role] || u.role}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DocumentReview = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [owner, setOwner] = useState(null);
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [preview, setPreview] = useState(null); // { doc, url, type, loading }
  const [review, setReview] = useState(null); // { doc, reason }
  const [reviewing, setReviewing] = useState(false);
  const [notarize, setNotarize] = useState(null); // { doc, file }
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!owner) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listDocumentsPage({ owner_id: owner.id, page, limit: 20 });
      setDocs(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [owner, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Revoke preview object URLs when the preview closes/changes.
  const previewUrl = preview?.url;
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectOwner = (u) => {
    setOwner(u);
    setPage(1);
    setStatusTab('all');
  };

  const openPreview = async (doc) => {
    setPreview({ doc, loading: true });
    try {
      const blob = await fetchDocumentBlob(doc.id);
      setPreview({ doc, url: URL.createObjectURL(blob), type: blob.type || doc.mimetype });
    } catch (err) {
      toast.error(err.message);
      setPreview(null);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await downloadDocument(doc.id, fileName(doc));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitReview = async (approved) => {
    const reason = review.reason.trim();
    if (!approved && !reason) {
      toast.error('A rejection reason is required');
      return;
    }
    const ok = await confirm(
      approved ? 'Mark this document as notarized? The owner will see it as approved.' : 'Reject this document? The uploader will need to submit a new notarized copy.',
      { title: approved ? 'Approve document' : 'Reject document', confirmLabel: approved ? 'Approve' : 'Reject', danger: !approved }
    );
    if (!ok) return;
    setReviewing(true);
    try {
      await reviewNotarization(review.doc.id, { approved, rejectionReason: reason || undefined });
      toast.success(approved ? 'Document approved' : 'Document rejected');
      setReview(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReviewing(false);
    }
  };

  const submitNotarized = async (e) => {
    e.preventDefault();
    if (!notarize.file) {
      toast.error('Choose the scanned notarized copy (PDF, JPEG, PNG or WEBP, max 5 MB)');
      return;
    }
    if (notarize.file.size > 5 * 1024 * 1024) {
      toast.error('File is larger than 5 MB');
      return;
    }
    setUploading(true);
    try {
      await uploadNotarizedCopy(notarize.doc.id, notarize.file);
      toast.success('Notarized copy uploaded — now pending review');
      setNotarize(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const counts = docs.reduce((acc, d) => ({ ...acc, [d.status]: (acc[d.status] || 0) + 1 }), {});
  const visible = statusTab === 'all' ? docs : docs.filter((d) => d.status === statusTab);
  const tabs = [
    { id: 'all', label: 'All', count: docs.length },
    ...Object.entries(STATUS_META).map(([id, m]) => ({ id, label: m.label, count: counts[id] || 0 })),
  ];

  return (
    <Page>
      <PageHeader
        icon={FileCheck2}
        title="Document review"
        subtitle="View users' private documents, upload notarized copies and approve or reject them"
        actions={owner && <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>}
      />

      <Card title="Choose a user" subtitle="Documents are stored per user. Search for the farmer, agent or shop manager whose documents you want to review.">
        <OwnerPicker owner={owner} onSelect={selectOwner} />
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          A platform-wide queue of documents awaiting review isn’t available yet: the API only lists documents for one owner at a time.
        </p>
      </Card>

      {owner && (
        <Card
          padded={false}
          title={
            <span className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-400" /> {owner.full_name || owner.email}
            </span>
          }
          subtitle={owner.email}
          actions={<Tabs tabs={tabs} value={statusTab} onChange={setStatusTab} />}
        >
          {loading ? (
            <Spinner label="Loading documents…" />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={docs.length === 0 ? 'No documents for this user' : 'No documents with this status'}
              description={docs.length === 0 ? 'Profile cards, contracts and IPM forms appear here once they are generated.' : undefined}
            />
          ) : (
            <>
              <Table head={['Document', 'Status', 'Version', 'Updated', 'Actions']}>
                {visible.map((doc) => {
                  const meta = statusMeta(doc.status);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <Td>
                        <div className="font-medium text-slate-900">{TYPE_LABELS[doc.type] || doc.type}</div>
                        <div className="max-w-[16rem] truncate text-xs text-slate-500">{fileName(doc)}</div>
                      </Td>
                      <Td>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <div className="mt-1 max-w-[16rem] truncate text-xs text-rose-700" title={doc.rejection_reason}>{doc.rejection_reason}</div>
                        )}
                      </Td>
                      <Td>v{doc.version ?? 1}</Td>
                      <Td>{formatDate(doc.updated_at || doc.created_at)}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          <Button size="sm" variant="secondary" icon={Eye} onClick={() => openPreview(doc)}>View</Button>
                          <Button size="sm" variant="ghost" icon={Download} onClick={() => handleDownload(doc)} aria-label={`Download ${TYPE_LABELS[doc.type] || 'document'}`} />
                          {doc.status === 'pending_notarization' ? (
                            <Button size="sm" icon={CheckCircle2} onClick={() => setReview({ doc, reason: '' })}>Review</Button>
                          ) : (
                            doc.status !== 'notarized' && (
                              <Button size="sm" variant="secondary" icon={Upload} onClick={() => setNotarize({ doc, file: null })}>Upload notarized</Button>
                            )
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </Table>
              {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />}
            </>
          )}
        </Card>
      )}

      {review && (
        <Dialog
          title="Review notarized document"
          subtitle={`${TYPE_LABELS[review.doc.type] || 'Document'} · v${review.doc.version ?? 1}`}
          onClose={() => !reviewing && setReview(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setReview(null)} disabled={reviewing}>Cancel</Button>
              <Button variant="danger" icon={XCircle} onClick={() => submitReview(false)} loading={reviewing}>Reject</Button>
              <Button icon={CheckCircle2} onClick={() => submitReview(true)} loading={reviewing}>Approve</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Button variant="secondary" size="sm" icon={Eye} onClick={() => openPreview(review.doc)}>Open the uploaded copy</Button>
            <Field label="Rejection reason" hint="Required when rejecting; shown to the uploader.">
              <textarea
                className={textareaClass}
                value={review.reason}
                onChange={(e) => setReview((r) => ({ ...r, reason: e.target.value }))}
                placeholder="e.g. Stamp is not legible, please re-scan"
              />
            </Field>
          </div>
        </Dialog>
      )}

      {notarize && (
        <Dialog
          title="Upload notarized copy"
          subtitle={`${TYPE_LABELS[notarize.doc.type] || 'Document'} for ${owner?.full_name || owner?.email || 'user'}`}
          onClose={() => !uploading && setNotarize(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setNotarize(null)} disabled={uploading}>Cancel</Button>
              <Button type="submit" form="notarize-form" icon={Upload} loading={uploading}>Upload</Button>
            </>
          }
        >
          <form id="notarize-form" onSubmit={submitNotarized} className="space-y-3">
            <Field label="Scanned notarized copy" required hint="PDF, JPEG, PNG or WEBP, up to 5 MB. Replaces the current file and sets the document to “Pending review”.">
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setNotarize((n) => ({ ...n, file: e.target.files?.[0] || null }))}
                className={inputClass}
              />
            </Field>
          </form>
        </Dialog>
      )}
      {/* Rendered last so it stacks above the review dialog. */}
      {preview && (
        <Dialog
          title={TYPE_LABELS[preview.doc.type] || 'Document'}
          subtitle={fileName(preview.doc)}
          size="xl"
          onClose={() => setPreview(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
              {preview.url && (
                <Button icon={Download} onClick={() => handleDownload(preview.doc)}>Download</Button>
              )}
            </>
          }
        >
          {preview.loading ? (
            <Spinner label="Loading file…" />
          ) : preview.type?.startsWith('image/') ? (
            <img src={preview.url} alt={TYPE_LABELS[preview.doc.type] || 'Document'} className="mx-auto max-h-[70vh] rounded-lg" />
          ) : preview.type === 'application/pdf' ? (
            <iframe src={preview.url} title="Document preview" className="h-[70vh] w-full rounded-lg border border-slate-200" />
          ) : (
            <EmptyState icon={FileText} title="Preview not available" description="This file type can’t be shown in the browser. Use Download instead." />
          )}
        </Dialog>
      )}

    </Page>
  );
};

export default DocumentReview;
