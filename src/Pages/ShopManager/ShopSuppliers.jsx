import { useCallback, useEffect, useState } from 'react';
import { Truck, Search, Eye, Star, RefreshCw, Plus, Pencil, Trash2, Info } from 'lucide-react';
import {
  listSuppliersPage, getSupplierById, getSupplierEvaluations, createSupplierEvaluation, getSupplierHistory,
  createSupplier, updateSupplier, deleteSupplier,
} from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog,
  Pagination, Badge, Tabs, StatGrid, StatCard,
} from '../../components/Ui/kit';
import { rwf, num, fmtDate, humanize, errMsg } from './shopCommon';

const PAGE_SIZE = 15;
const CATEGORIES = ['seeds_supplier', 'fertilizer_supplier', 'equipment_supplier', 'produce_buyer', 'input_distributor', 'logistics_provider', 'financial_services', 'other'];
const STATUSES = ['active', 'inactive', 'pending_approval', 'suspended'];
const STATUS_TONE = { active: 'brand', inactive: 'slate', pending_approval: 'amber', suspended: 'rose' };
const SCORES = [
  ['overall_score', 'Overall'],
  ['quality_score', 'Product quality'],
  ['delivery_score', 'Delivery'],
  ['price_score', 'Price'],
  ['service_score', 'Service'],
];
/** The backend only lets administrators create, edit or delete suppliers (routes/suppliers.ts). */
const SUPPLIER_WRITE_ROLES = ['admin'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Stars = ({ value }) => (
  <span className="inline-flex items-center gap-1 text-sm text-slate-700" aria-label={`Rated ${Number(value || 0).toFixed(1)} of 5`}>
    <Star className={`h-4 w-4 ${value > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
    {value > 0 ? Number(value).toFixed(1) : '—'}
  </span>
);

const ScorePicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-slate-700">{label}</span>
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)}
          className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <Star className={`h-5 w-5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  </div>
);

const emptySupplier = () => ({ name: '', category: 'input_distributor', contact_person: '', email: '', phone: '', city: '', province: '', website: '', payment_terms: '', notes: '', status: 'active' });
const emptyEval = () => ({ overall_score: 0, quality_score: 0, delivery_score: 0, price_score: 0, service_score: 0, notes: '' });

const ShopSuppliers = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const canWrite = SUPPLIER_WRITE_ROLES.includes(localStorage.getItem('role'));

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null); // { supplier, evaluations, history, loading, error }
  const [tab, setTab] = useState('overview');
  const [evalForm, setEvalForm] = useState(emptyEval);
  const [evaluating, setEvaluating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySupplier);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSuppliersPage({
        page, limit: PAGE_SIZE, ...(query && { search: query }),
        ...(filters.category && { category: filters.category }), ...(filters.status && { status: filters.status }),
      });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Could not load suppliers'));
    } finally {
      setLoading(false);
    }
  }, [page, query, filters]);
  useEffect(() => { load(); }, [load]);

  const openDetail = async (s, keepTab = false) => {
    if (!keepTab) setTab('overview');
    setDetail({ supplier: s, loading: true });
    try {
      const [supplier, evaluations, history] = await Promise.all([
        getSupplierById(s.id), getSupplierEvaluations(s.id), getSupplierHistory(s.id),
      ]);
      setDetail({ supplier: supplier || s, evaluations: Array.isArray(evaluations) ? evaluations : [], history, loading: false });
    } catch (err) {
      setDetail({ supplier: s, loading: false, error: errMsg(err, 'Could not load supplier details') });
    }
  };

  const submitEvaluation = async (e) => {
    e.preventDefault();
    if (!evalForm.overall_score) return toast.error('Give an overall score from 1 to 5 stars');
    setEvaluating(true);
    try {
      const payload = { overall_score: evalForm.overall_score, notes: evalForm.notes.trim() || undefined };
      SCORES.slice(1).forEach(([k]) => { if (evalForm[k]) payload[k] = evalForm[k]; });
      await createSupplierEvaluation(detail.supplier.id, payload);
      toast.success('Evaluation submitted');
      setEvalForm(emptyEval());
      await openDetail(detail.supplier, true);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not submit the evaluation'));
    } finally {
      setEvaluating(false);
    }
  };

  const openEdit = (s) => {
    setForm(s === 'new' ? emptySupplier() : {
      name: s.name || '', category: s.category || 'other', contact_person: s.contact_person || '', email: s.email || '', phone: s.phone || '',
      city: s.address?.city || '', province: s.address?.province || '', website: s.website || '', payment_terms: s.payment_terms || '',
      notes: s.notes || '', status: s.status || 'active',
    });
    setEditing(s);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveSupplier = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error('Enter the supplier name');
    if (!form.contact_person.trim()) return toast.error('Enter a contact person');
    if (!EMAIL_RE.test(form.email.trim())) return toast.error('Enter a valid email address');
    if (form.phone.trim().length < 9) return toast.error('Enter a valid phone number');
    const payload = {
      name: form.name.trim(), category: form.category, contact_person: form.contact_person.trim(), email: form.email.trim(),
      phone: form.phone.trim(), website: form.website.trim() || null, payment_terms: form.payment_terms.trim() || null,
      notes: form.notes.trim() || null, status: form.status,
      address: { ...(editing !== 'new' ? editing.address : {}), city: form.city.trim(), province: form.province.trim(), country: 'Rwanda' },
    };
    setSaving(true);
    try {
      if (editing === 'new') await createSupplier(payload);
      else await updateSupplier(editing.id, payload);
      toast.success(editing === 'new' ? 'Supplier added' : 'Supplier updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not save the supplier'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (!(await confirm(`Delete supplier "${s.name}"? This cannot be undone.`, { confirmLabel: 'Delete supplier' }))) return;
    try {
      await deleteSupplier(s.id);
      toast.success('Supplier deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete the supplier — it may still be linked to products or purchase orders'));
    }
  };

  const filtered = query || filters.category || filters.status;
  const sup = detail?.supplier;

  return (
    <Page>
      <PageHeader icon={Truck} title="Suppliers" subtitle="Shared supplier directory — review performance and rate suppliers"
        actions={<>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          {canWrite && <Button icon={Plus} onClick={() => openEdit('new')}>Add supplier</Button>}
        </>} />

      {!canWrite && (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          The supplier directory is maintained by administrators. Contact an administrator to add or change a supplier; you can view suppliers, order from them under Procurement and rate them here.
        </div>
      )}

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <label className="relative block">
            <span className="sr-only">Search suppliers</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Name, contact or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select aria-label="Category" className={inputClass} value={filters.category} onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1); }}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
          </select>
          <select aria-label="Status" className={inputClass} value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUSES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
          </select>
        </div>
        {loading && !rows.length ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> : rows.length === 0 ? (
          <EmptyState icon={Truck} title={filtered ? 'No suppliers match' : 'No suppliers yet'} description={filtered ? 'Try another search or filter.' : 'Suppliers added by an administrator will appear here.'} />
        ) : (
          <>
            <Table head={['Supplier', 'Category', 'Contact', 'Location', 'Rating', 'Status', '']}>
              {rows.map((s) => (
                <tr key={s.id}>
                  <Td className="font-medium text-slate-900">{s.name}</Td>
                  <Td>{humanize(s.category)}</Td>
                  <Td><p>{s.contact_person}</p><p className="text-xs text-slate-500">{s.phone}</p></Td>
                  <Td>{[s.address?.city, s.address?.province].filter(Boolean).join(', ') || '—'}</Td>
                  <Td><Stars value={s.rating} /></Td>
                  <Td><Badge tone={STATUS_TONE[s.status]}>{humanize(s.status)}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" aria-label={`View ${s.name}`} onClick={() => openDetail(s)}><Eye className="h-4 w-4" /></Button>
                      {canWrite && <>
                        <Button variant="ghost" size="sm" aria-label={`Edit ${s.name}`} onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={`Delete ${s.name}`} onClick={() => remove(s)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
                      </>}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {detail && (
        <Dialog title={sup.name} subtitle={humanize(sup.category)} size="xl" onClose={() => { setDetail(null); setEvalForm(emptyEval()); }}>
          {detail.loading ? <Spinner /> : detail.error ? <ErrorState message={detail.error} onRetry={() => openDetail(sup)} /> : (
            <div className="space-y-5">
              <Tabs value={tab} onChange={setTab} tabs={[
                { id: 'overview', label: 'Overview' },
                { id: 'products', label: 'Products', count: sup.products?.length || 0 },
                { id: 'history', label: 'Purchase orders', count: detail.history?.purchase_orders?.length || 0 },
                { id: 'evaluations', label: 'Evaluations', count: detail.evaluations.length },
              ]} />

              {tab === 'overview' && (
                <div className="space-y-5">
                  <StatGrid>
                    <StatCard label="Rating" value={sup.rating > 0 ? `${Number(sup.rating).toFixed(1)} / 5` : 'Not rated'} />
                    <StatCard label="Evaluations" value={num(detail.evaluations.length)} tone="slate" />
                    <StatCard label="Received POs" value={num(detail.history?.total_orders)} tone="blue" />
                    <StatCard label="Received value" value={rwf(detail.history?.total_value)} tone="slate" />
                  </StatGrid>
                  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    {[
                      ['Contact person', sup.contact_person], ['Phone', sup.phone], ['Email', sup.email],
                      ['Website', sup.website], ['Address', [sup.address?.street_address, sup.address?.city, sup.address?.province, sup.address?.country].filter(Boolean).join(', ')],
                      ['Payment terms', sup.payment_terms], ['Status', humanize(sup.status)], ['Supplier since', fmtDate(sup.created_at)],
                    ].map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v || '—'}</dd></div>)}
                  </dl>
                  {sup.notes && <p className="text-sm text-slate-600">{sup.notes}</p>}
                </div>
              )}

              {tab === 'products' && (sup.products?.length ? (
                <Table head={['Product', 'Category', 'Price', 'Stock']}>
                  {sup.products.map((p) => (
                    <tr key={p.id}><Td className="font-medium text-slate-900">{p.name}</Td><Td>{humanize(p.category)}</Td><Td>{rwf(p.price)}</Td><Td>{num(p.quantity)} {p.unit}</Td></tr>
                  ))}
                </Table>
              ) : <EmptyState title="No products listed for this supplier" />)}

              {tab === 'history' && (detail.history?.purchase_orders?.length ? (
                <Table head={['PO number', 'Date', 'Status', 'Amount']}>
                  {detail.history.purchase_orders.map((po) => (
                    <tr key={po.id}><Td className="font-medium text-slate-900">{po.po_number}</Td><Td>{fmtDate(po.order_date)}</Td><Td><Badge>{humanize(po.status)}</Badge></Td><Td>{rwf(po.total_amount)}</Td></tr>
                  ))}
                </Table>
              ) : <EmptyState title="No purchase orders with this supplier yet" />)}

              {tab === 'evaluations' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <form onSubmit={submitEvaluation} className="space-y-3 rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-900">Rate this supplier</p>
                    {SCORES.map(([k, label]) => (
                      <ScorePicker key={k} label={k === 'overall_score' ? `${label} *` : label} value={evalForm[k]} onChange={(n) => setEvalForm((f) => ({ ...f, [k]: n }))} />
                    ))}
                    <Field label="Comments"><textarea className={textareaClass} value={evalForm.notes} maxLength={1000} onChange={(e) => setEvalForm((f) => ({ ...f, notes: e.target.value }))} /></Field>
                    <Button type="submit" loading={evaluating} disabled={!evalForm.overall_score}>Submit evaluation</Button>
                  </form>
                  <div className="space-y-3">
                    {detail.evaluations.length === 0 ? <EmptyState icon={Star} title="No evaluations yet" /> : detail.evaluations.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Stars value={ev.overall_score} />
                          <span className="text-xs text-slate-500">{fmtDate(ev.created_at)}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{ev.evaluator?.full_name || 'Unknown'} · {humanize(ev.evaluator?.role)}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {SCORES.slice(1).filter(([k]) => ev[k]).map(([k, label]) => <Badge key={k}>{label}: {ev[k]}/5</Badge>)}
                        </div>
                        {ev.notes && <p className="mt-2 text-slate-600">{ev.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Dialog>
      )}

      {editing && (
        <Dialog title={editing === 'new' ? 'Add supplier' : `Edit ${editing.name}`} size="lg" onClose={() => !saving && setEditing(null)}
          footer={<>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="supplier-form" loading={saving}>Save</Button>
          </>}>
          <form id="supplier-form" onSubmit={saveSupplier} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required className="sm:col-span-2"><input className={inputClass} value={form.name} onChange={set('name')} /></Field>
            <Field label="Category" required>
              <select className={inputClass} value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}</select>
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={set('status')}>{STATUSES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}</select>
            </Field>
            <Field label="Contact person" required><input className={inputClass} value={form.contact_person} onChange={set('contact_person')} /></Field>
            <Field label="Phone" required><input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Email" required><input type="email" className={inputClass} value={form.email} onChange={set('email')} /></Field>
            <Field label="Website"><input className={inputClass} value={form.website} onChange={set('website')} /></Field>
            <Field label="City / district"><input className={inputClass} value={form.city} onChange={set('city')} /></Field>
            <Field label="Province"><input className={inputClass} value={form.province} onChange={set('province')} /></Field>
            <Field label="Payment terms" className="sm:col-span-2"><input className={inputClass} value={form.payment_terms} onChange={set('payment_terms')} placeholder="e.g. Net 30" /></Field>
            <Field label="Notes" className="sm:col-span-2"><textarea className={textareaClass} value={form.notes} onChange={set('notes')} /></Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default ShopSuppliers;
