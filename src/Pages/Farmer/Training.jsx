import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, Video, FileText, ListChecks, HelpCircle, BookOpen, Search, ExternalLink } from 'lucide-react';
import { listTraining, getTraining } from '../../services/trainingService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Badge, inputClass, EmptyState, ErrorState, Spinner, Dialog, Tabs } from '../../components/Ui/kit';
import { formatDate, errMsg } from './farmerShared';

const TYPES = [
  { id: '', label: 'All' },
  { id: 'article', label: 'Articles', icon: FileText },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'guide', label: 'Guides', icon: BookOpen },
  { id: 'checklist', label: 'Checklists', icon: ListChecks },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];
const typeIcon = (t) => TYPES.find((x) => x.id === t)?.icon || FileText;
const isUrl = (s) => typeof s === 'string' && /^https?:\/\/\S+$/.test(s.trim());

export default function Training() {
  const toast = useToast();
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listTraining({ content_type: type || undefined, search: query || undefined, limit: 100 }));
    } catch (e) {
      setError(errMsg(e, 'Failed to load training content'));
    } finally {
      setLoading(false);
    }
  }, [type, query]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (item) => {
    setSelected(item);
    setDetailLoading(true);
    try {
      setSelected(await getTraining(item.id));
    } catch (e) {
      toast.error(errMsg(e, 'Failed to open this item'));
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const content = selected?.content;

  return (
    <Page>
      <PageHeader icon={GraduationCap} title="Training" subtitle="Guides, videos and checklists from ASR agronomists to help you grow better avocados." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={TYPES} value={type} onChange={setType} />
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={`${inputClass} pl-9`} placeholder="Search by title" aria-label="Search training" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <Card><Spinner label="Loading training content…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={GraduationCap} title="No training content yet" description={type || query ? 'Nothing matches these filters.' : 'New guides and videos will appear here when they are published.'} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = typeIcon(item.content_type);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => open(item)}
                className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
                  <Badge className="capitalize">{item.content_type}</Badge>
                </div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                {item.description && <p className="line-clamp-3 text-sm text-slate-500">{item.description}</p>}
                <p className="mt-auto text-xs text-slate-400">
                  {[item.category, item.author?.full_name, formatDate(item.published_at)].filter((x) => x && x !== '—').join(' · ')}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(selected)} title={selected?.title || ''} subtitle={selected?.description} size="lg" onClose={() => setSelected(null)}>
        {detailLoading ? (
          <Spinner />
        ) : selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="capitalize">{selected.content_type}</Badge>
              {selected.category && <Badge tone="blue">{selected.category}</Badge>}
              {(selected.tags || []).map((t) => <Badge key={t}>#{t}</Badge>)}
            </div>
            {isUrl(content) ? (
              <a href={content.trim()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                <ExternalLink className="h-4 w-4" /> Open {selected.content_type === 'video' ? 'video' : 'resource'}
              </a>
            ) : (
              <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{content || 'No content.'}</div>
            )}
            <p className="text-xs text-slate-400">
              {[selected.author?.full_name && `By ${selected.author.full_name}`, selected.published_at && `Published ${formatDate(selected.published_at)}`].filter(Boolean).join(' · ')}
            </p>
          </div>
        ) : null}
      </Dialog>
    </Page>
  );
}
