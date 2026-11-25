import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, Archive, Send, RefreshCw, Eye } from 'lucide-react';
import {
  CONTENT_TYPES,
  listAllTrainingPaged,
  createTraining,
  updateTraining,
  deleteTraining,
  publishTraining,
  archiveTraining,
} from '../../services/trainingService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Table, Td, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

const TYPE_LABELS = { article: 'Article', video: 'Video', guide: 'Guide', checklist: 'Checklist', faq: 'FAQ' };
const STATUS_TONES = { draft: 'amber', published: 'brand', archived: 'slate' };
const PAGE_SIZE = 50;

const emptyForm = { title: '', description: '', content: '', content_type: 'article', category: '', tags: '' };
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const isUrl = (s) => /^https?:\/\/\S+$/i.test((s || '').trim());

const Training = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(null); // { id?, values }
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAllTrainingPaged({ page, limit: PAGE_SIZE });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (item) => {
    setForm(
      item
        ? {
            id: item.id,
            values: {
              title: item.title || '',
              description: item.description || '',
              content: item.content || '',
              content_type: CONTENT_TYPES.includes(item.content_type) ? item.content_type : 'article',
              category: item.category || '',
              tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
            },
          }
        : { values: { ...emptyForm } }
    );
  };
  const setValue = (k, v) => setForm((f) => ({ ...f, values: { ...f.values, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    const v = form.values;
    if (!v.title.trim() || !v.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    const payload = {
      title: v.title.trim(),
      description: v.description.trim() || null,
      content: v.content.trim(),
      content_type: v.content_type,
      category: v.category.trim() || null,
      tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (form.id) {
        await updateTraining(form.id, payload);
        toast.success('Training content updated');
      } else {
        await createTraining(payload);
        toast.success('Draft created — publish it to make it visible to farmers');
      }
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (item, action) => {
    if (action === 'delete') {
      const ok = await confirm(`Delete “${item.title}”? This cannot be undone.`, { title: 'Delete training content', confirmLabel: 'Delete' });
      if (!ok) return;
    }
    if (action === 'archive') {
      const ok = await confirm(`Archive “${item.title}”? Farmers will no longer see it.`, { title: 'Archive training content', confirmLabel: 'Archive', danger: false });
      if (!ok) return;
    }
    setBusyId(item.id);
    try {
      if (action === 'publish') await publishTraining(item.id);
      else if (action === 'archive') await archiveTraining(item.id);
      else await deleteTraining(item.id);
      toast.success({ publish: 'Published — now visible to farmers', archive: 'Archived', delete: 'Deleted' }[action]);
      if (action === 'delete' && items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const counts = items.reduce((acc, i) => ({ ...acc, [i.status]: (acc[i.status] || 0) + 1 }), {});
  const visible = statusTab === 'all' ? items : items.filter((i) => i.status === statusTab);
  const tabs = [
    { id: 'all', label: 'All', count: items.length },
    { id: 'draft', label: 'Drafts', count: counts.draft || 0 },
    { id: 'published', label: 'Published', count: counts.published || 0 },
    { id: 'archived', label: 'Archived', count: counts.archived || 0 },
  ];

  return (
    <Page>
      <PageHeader
        icon={GraduationCap}
        title="Training content"
        subtitle="Create, publish and archive learning material for farmers"
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={() => openForm(null)}>New content</Button>
          </>
        }
      />

      <Card padded={false} title="Library" subtitle={`${pagination.total ?? items.length} item${(pagination.total ?? items.length) === 1 ? "" : "s"} in total`} actions={<Tabs tabs={tabs} value={statusTab} onChange={setStatusTab} />}>
        {loading ? (
          <Spinner label="Loading training content…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={items.length === 0 ? 'No training content yet' : `No ${statusTab} content`}
            description={items.length === 0 ? 'Create your first article, video, guide, checklist or FAQ.' : undefined}
            action={items.length === 0 && <Button icon={Plus} onClick={() => openForm(null)}>New content</Button>}
          />
        ) : (
          <>
            <Table head={['Title', 'Type', 'Category', 'Status', 'Views', 'Updated', 'Actions']}>
              {visible.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <Td className="max-w-[18rem]">
                    <button type="button" onClick={() => setView(item)} className="block max-w-full truncate text-left font-medium text-slate-900 hover:text-brand-700">
                      {item.title}
                    </button>
                    {item.description && <div className="truncate text-xs text-slate-500">{item.description}</div>}
                  </Td>
                  <Td>{TYPE_LABELS[item.content_type] || item.content_type}</Td>
                  <Td>{item.category || '—'}</Td>
                  <Td><Badge tone={STATUS_TONES[item.status]}>{label(item.status)}</Badge></Td>
                  <Td>{item.view_count ?? 0}</Td>
                  <Td>{formatDate(item.updated_at)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} onClick={() => setView(item)} aria-label={`Preview ${item.title}`} />
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openForm(item)} aria-label={`Edit ${item.title}`} />
                      {item.status !== 'published' && (
                        <Button size="sm" variant="secondary" icon={Send} onClick={() => runAction(item, 'publish')} disabled={busyId === item.id}>Publish</Button>
                      )}
                      {item.status !== 'archived' && (
                        <Button size="sm" variant="ghost" icon={Archive} onClick={() => runAction(item, 'archive')} disabled={busyId === item.id} aria-label={`Archive ${item.title}`} />
                      )}
                      <Button size="sm" variant="ghost" icon={Trash2} onClick={() => runAction(item, 'delete')} disabled={busyId === item.id} aria-label={`Delete ${item.title}`} className="text-rose-600 hover:bg-rose-50" />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />}
          </>
        )}
      </Card>

      {view && (
        <Dialog
          title={view.title}
          subtitle={`${TYPE_LABELS[view.content_type] || view.content_type} · ${label(view.status)}${view.author?.full_name ? ` · by ${view.author.full_name}` : ''}`}
          size="lg"
          onClose={() => setView(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setView(null)}>Close</Button>
              <Button variant="secondary" icon={Pencil} onClick={() => { openForm(view); setView(null); }}>Edit</Button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            {view.description && <p className="text-slate-600">{view.description}</p>}
            {isUrl(view.content) ? (
              <a href={view.content.trim()} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-brand-700 underline">
                {view.content.trim()}
              </a>
            ) : (
              <div className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-slate-800">{view.content}</div>
            )}
            {Array.isArray(view.tags) && view.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {view.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
            )}
          </div>
        </Dialog>
      )}

      {form && (
        <Dialog
          title={form.id ? 'Edit training content' : 'New training content'}
          subtitle={form.id ? undefined : 'Saved as a draft; publish it when ready.'}
          size="lg"
          onClose={() => !saving && setForm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="training-form" loading={saving}>{form.id ? 'Save changes' : 'Create draft'}</Button>
            </>
          }
        >
          <form id="training-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" required className="sm:col-span-2">
              <input className={inputClass} value={form.values.title} onChange={(e) => setValue('title', e.target.value)} maxLength={200} required />
            </Field>
            <Field label="Type" required>
              <select className={inputClass} value={form.values.content_type} onChange={(e) => setValue('content_type', e.target.value)}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <input className={inputClass} value={form.values.category} onChange={(e) => setValue('category', e.target.value)} placeholder="e.g. Pest control" />
            </Field>
            <Field label="Short description" className="sm:col-span-2">
              <input className={inputClass} value={form.values.description} onChange={(e) => setValue('description', e.target.value)} maxLength={300} />
            </Field>
            <Field label="Content" required hint="The article text, or a link (https://…) to the video / document." className="sm:col-span-2">
              <textarea className={`${textareaClass} min-h-[160px]`} value={form.values.content} onChange={(e) => setValue('content', e.target.value)} required />
            </Field>
            <Field label="Tags" hint="Comma separated" className="sm:col-span-2">
              <input className={inputClass} value={form.values.tags} onChange={(e) => setValue('tags', e.target.value)} placeholder="irrigation, hass, pruning" />
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default Training;
