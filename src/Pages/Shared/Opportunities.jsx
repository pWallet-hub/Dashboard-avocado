import { useCallback, useEffect, useState } from 'react';
import {
  Sparkles, Plus, RefreshCw, Phone, Mail, ExternalLink, CalendarClock, MapPin, Users, Pencil, Trash2, Lock, Unlock, HandHeart, Search,
} from 'lucide-react';
import {
  listOpportunities, saveOpportunity, deleteOpportunity, listInterests, expressInterest, withdrawInterest,
  OPPORTUNITY_TYPES, opportunityTypeLabel,
} from '../../services/opportunitiesService';
import { GRADES, labelFor } from '../../services/marketPricesService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, Spinner, Dialog, Pagination, Table, Td,
} from '../../components/Ui/kit';
import { ALL_DISTRICTS, RWANDA_PROVINCES } from '../../utils/rwanda';
import { formatDate, isoDay } from '../Farmer/farmerShared';

const TYPE_TONES = {
  buyer_demand: 'brand', export_contract: 'brand', grant_funding: 'blue', loan_credit: 'blue', input_subsidy: 'amber',
  training: 'slate', certification: 'slate', job: 'slate', tender: 'amber', other: 'slate',
};

const emptyForm = () => ({
  title: '', type: 'buyer_demand', description: '', organization: '', province: '', district: '',
  quantity_kg: '', price_per_kg: '', min_grade: '', deadline: '', contact_name: '', contact_phone: '', contact_email: '', link: '', notify: true,
});

const area = (o) => o.district ? `${o.district}, ${o.province}` : o.province || 'Nationwide';

const daysLeft = (deadline) => {
  if (!deadline) return null;
  const d = Math.ceil((new Date(deadline).setHours(23, 59, 59) - Date.now()) / 864e5);
  return d;
};

const DeadlineBadge = ({ deadline }) => {
  const d = daysLeft(deadline);
  if (d === null) return <Badge>No deadline</Badge>;
  if (d < 0) return <Badge tone="rose">Closed {formatDate(deadline)}</Badge>;
  return <Badge tone={d <= 3 ? 'rose' : d <= 10 ? 'amber' : 'slate'}>{d === 0 ? 'Last day today' : `${d} day${d === 1 ? '' : 's'} left`}</Badge>;
};

/** Opportunity details shared by the farmer card and the staff table. */
function Details({ o }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="whitespace-pre-line text-slate-700">{o.description}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {area(o)}</span>
        {o.deadline && <span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4" /> Apply by {formatDate(o.deadline)}</span>}
        {o.quantity_kg && <span>Wants {Number(o.quantity_kg).toLocaleString()} kg</span>}
        {o.price_per_kg && <span>Pays {Number(o.price_per_kg).toLocaleString()} RWF/kg</span>}
        {o.min_grade && <span>Min. grade: {labelFor(GRADES, o.min_grade)}</span>}
      </div>
      {(o.contact_name || o.contact_phone || o.contact_email || o.link) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {o.contact_name && <span className="text-slate-600">Contact: <span className="font-medium text-slate-900">{o.contact_name}</span></span>}
          {o.contact_phone && (
            <a href={`tel:${o.contact_phone}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"><Phone className="h-3.5 w-3.5" /> {o.contact_phone}</a>
          )}
          {o.contact_email && (
            <a href={`mailto:${o.contact_email}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"><Mail className="h-3.5 w-3.5" /> Email</a>
          )}
          {o.link && /^https?:\/\//i.test(o.link) && (
            <a href={o.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"><ExternalLink className="h-3.5 w-3.5" /> More information</a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Opportunities: buyer demand, export contracts, grants, loans, subsidised
 * inputs, trainings… Farmers browse the ones for their area and say they are
 * interested; admins/agents post and follow up.
 */
export default function Opportunities({ role = 'farmer' }) {
  const toast = useToast();
  const confirm = useConfirm();
  const staff = role === 'admin' || role === 'agent';

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', status: staff ? 'open' : '', search: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null); // { id?, values }
  const [interestDialog, setInterestDialog] = useState(null); // farmer: { o, quantity_kg, message }
  const [interested, setInterested] = useState(null); // staff: { o, list, loading }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOpportunities({ ...filters, page, limit: 12 });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (k, v) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v }));
  };

  // ── Staff: create / edit ────────────────────────────────────────────────
  const openForm = (o) => {
    if (!o) return setForm({ values: emptyForm() });
    setForm({
      id: o.id,
      values: {
        ...emptyForm(),
        ...Object.fromEntries(Object.entries(o).filter(([k]) => k in emptyForm()).map(([k, v]) => [k, v ?? ''])),
        deadline: o.deadline ? String(o.deadline).slice(0, 10) : '',
      },
    });
  };
  const setValue = (k, v) => setForm((f) => ({ ...f, values: { ...f.values, [k]: v } }));

  const submitForm = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { notify, ...values } = form.values;
      const payload = { ...values };
      if (payload.district) delete payload.province; // district implies province
      if (form.id) {
        // On edit, send blanks as null so fields can be cleared.
        Object.keys(payload).forEach((k) => payload[k] === '' && (payload[k] = null));
        ['title', 'type', 'description'].forEach((k) => payload[k] === null && delete payload[k]);
      } else {
        Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
        payload.notify = notify;
      }
      const saved = await saveOpportunity(form.id, payload);
      toast.success(form.id ? 'Opportunity updated' : `Opportunity posted${saved?.farmers_notified ? ` · ${saved.farmers_notified} farmers notified` : ''}`);
      setForm(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (o) => {
    try {
      await saveOpportunity(o.id, { status: o.status === 'open' ? 'closed' : 'open' });
      toast.success(o.status === 'open' ? 'Opportunity closed' : 'Opportunity reopened');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async (o) => {
    if (!(await confirm(`Delete "${o.title}"? Farmers' interest in it will be removed too.`, { confirmLabel: 'Delete' }))) return;
    try {
      await deleteOpportunity(o.id);
      toast.success('Opportunity deleted');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const showInterested = async (o) => {
    setInterested({ o, loading: true, list: [] });
    try {
      setInterested({ o, loading: false, list: await listInterests(o.id) });
    } catch (error) {
      toast.error(error.message);
      setInterested(null);
    }
  };

  // ── Farmer: interest ────────────────────────────────────────────────────
  const submitInterest = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { o, quantity_kg, message } = interestDialog;
      await expressInterest(o.id, { ...(quantity_kg && { quantity_kg }), ...(message.trim() && { message }) });
      toast.success(o.my_interest ? 'Your interest was updated' : 'Sent! The organiser will contact you.');
      setInterestDialog(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (o) => {
    if (!(await confirm(`Withdraw your interest in "${o.title}"?`, { confirmLabel: 'Withdraw' }))) return;
    try {
      await withdrawInterest(o.id);
      toast.success('Interest withdrawn');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const v = form?.values;

  return (
    <Page>
      <PageHeader
        icon={Sparkles}
        title="Opportunities"
        subtitle={staff
          ? 'Post buyer demand, export contracts, grants, loans, subsidised inputs and trainings for farmers.'
          : 'Buyers, export contracts, grants, loans, subsidised inputs and trainings available to you.'}
        actions={
          <>
            {staff && <Button icon={Plus} onClick={() => openForm(null)}>Post opportunity</Button>}
            <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          </>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search title or organisation" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <select className={inputClass} value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            {OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {staff && (
            <select className={inputClass} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">Open and closed</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>
      </Card>

      {loading && !items.length ? (
        <Card><Spinner label="Loading opportunities…" /></Card>
      ) : !items.length ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title={staff ? 'No opportunities yet' : 'No open opportunities for your area right now'}
            description={staff ? 'Post the first one: a buyer looking for avocados, a grant, a training…' : 'We will notify you as soon as a buyer, grant or training is posted for your area.'}
          />
        </Card>
      ) : staff ? (
        <Card padded={false}>
          <Table head={['Opportunity', 'Area', 'Deadline', 'Interested', 'Status', '']}>
            {items.map((o) => (
              <tr key={o.id} className="align-top">
                <Td className="whitespace-normal">
                  <p className="font-medium text-slate-900">{o.title}</p>
                  <p className="text-xs text-slate-500">{opportunityTypeLabel(o.type)}{o.organization ? ` · ${o.organization}` : ''} · by {o.creator?.full_name || '—'}</p>
                </Td>
                <Td>{area(o)}</Td>
                <Td>{o.deadline ? formatDate(o.deadline) : '—'}</Td>
                <Td>
                  <button type="button" onClick={() => showInterested(o)} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                    <Users className="h-4 w-4" /> {o.interest_count}
                  </button>
                </Td>
                <Td><Badge tone={o.status === 'open' ? 'brand' : 'slate'} className="capitalize">{o.status}</Badge></Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <button type="button" title="Edit" onClick={() => openForm(o)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                    <button type="button" title={o.status === 'open' ? 'Close' : 'Reopen'} onClick={() => toggleStatus(o)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                      {o.status === 'open' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                    <button type="button" title="Delete" onClick={() => remove(o)} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((o) => (
              <Card
                key={o.id}
                title={o.title}
                subtitle={`${opportunityTypeLabel(o.type)}${o.organization ? ` · ${o.organization}` : ''}`}
                actions={<div className="flex gap-1"><Badge tone={TYPE_TONES[o.type]}>{opportunityTypeLabel(o.type)}</Badge><DeadlineBadge deadline={o.deadline} /></div>}
              >
                <Details o={o} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  {o.my_interest ? (
                    <>
                      <Badge tone="brand">You are interested{o.my_interest.quantity_kg ? ` · ${Number(o.my_interest.quantity_kg).toLocaleString()} kg` : ''}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setInterestDialog({ o, quantity_kg: o.my_interest.quantity_kg ?? '', message: o.my_interest.message ?? '' })}>Update</Button>
                        <Button size="sm" variant="secondary" onClick={() => withdraw(o)}>Withdraw</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500">{o.interest_count ? `${o.interest_count} farmer${o.interest_count === 1 ? '' : 's'} interested` : 'Be the first to respond'}</span>
                      <Button size="sm" icon={HandHeart} onClick={() => setInterestDialog({ o, quantity_kg: '', message: '' })}>I&apos;m interested</Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {pagination.totalPages > 1 && <Card padded={false}><Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} /></Card>}
        </>
      )}

      {/* Farmer: interest dialog */}
      {interestDialog && (
        <Dialog
          title={interestDialog.o.title}
          subtitle="The organiser will see your name and phone number and contact you."
          onClose={() => setInterestDialog(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setInterestDialog(null)}>Cancel</Button>
              <Button type="submit" form="interest-form" loading={busy}>Send</Button>
            </>
          }
        >
          <form id="interest-form" onSubmit={submitInterest} className="space-y-4">
            {['buyer_demand', 'export_contract', 'tender'].includes(interestDialog.o.type) && (
              <Field label="How many kg can you supply?" hint="Optional — an estimate is fine.">
                <input type="number" min="1" step="any" className={inputClass} value={interestDialog.quantity_kg} onChange={(e) => setInterestDialog((d) => ({ ...d, quantity_kg: e.target.value }))} />
              </Field>
            )}
            <Field label="Message (optional)">
              <textarea className={textareaClass} maxLength={1000} value={interestDialog.message} onChange={(e) => setInterestDialog((d) => ({ ...d, message: e.target.value }))} placeholder="e.g. My Hass will be ready in two weeks" />
            </Field>
          </form>
        </Dialog>
      )}

      {/* Staff: interested farmers */}
      {interested && (
        <Dialog title="Interested farmers" subtitle={interested.o.title} onClose={() => setInterested(null)} size="lg">
          {interested.loading ? (
            <Spinner />
          ) : !interested.list.length ? (
            <EmptyState icon={Users} title="No farmers yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {interested.list.map((i) => {
                const p = i.farmer?.farmer_profile || {};
                return (
                  <li key={i.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-slate-900">{i.farmer?.full_name}</p>
                      <p className="text-slate-500">
                        {[p.farm_sector || p.sector, p.farm_district || p.district].filter(Boolean).join(', ') || '—'}
                        {p.tree_count ? ` · ${p.tree_count} trees` : ''}
                        {i.quantity_kg ? ` · offers ${Number(i.quantity_kg).toLocaleString()} kg` : ''}
                      </p>
                      {i.message && <p className="mt-1 text-slate-700">“{i.message}”</p>}
                      <p className="text-xs text-slate-400">{formatDate(i.created_at, true)}</p>
                    </div>
                    {i.farmer?.phone && (
                      <a href={`tel:${i.farmer.phone}`} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700"><Phone className="h-3.5 w-3.5" /> {i.farmer.phone}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Dialog>
      )}

      {/* Staff: create / edit */}
      {form && (
        <Dialog
          title={form.id ? 'Edit opportunity' : 'Post an opportunity'}
          onClose={() => setForm(null)}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" form="opp-form" loading={busy}>{form.id ? 'Save' : 'Post'}</Button>
            </>
          }
        >
          <form id="opp-form" onSubmit={submitForm} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required className="sm:col-span-2">
              <input className={inputClass} required maxLength={160} value={v.title} onChange={(e) => setValue('title', e.target.value)} placeholder="e.g. Exporter buying 5 t of Hass" />
            </Field>
            <Field label="Type" required>
              <select className={inputClass} value={v.type} onChange={(e) => setValue('type', e.target.value)}>
                {OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Organisation">
              <input className={inputClass} value={v.organization} onChange={(e) => setValue('organization', e.target.value)} />
            </Field>
            <Field label="Description" required className="sm:col-span-2">
              <textarea className={textareaClass} required value={v.description} onChange={(e) => setValue('description', e.target.value)} placeholder="What is offered, who can apply, how it works" />
            </Field>
            <Field label="Province" hint="Leave province and district empty for nationwide.">
              <select className={inputClass} value={v.province} disabled={Boolean(v.district)} onChange={(e) => setValue('province', e.target.value)}>
                <option value="">Nationwide</option>
                {RWANDA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="District">
              <select className={inputClass} value={v.district} onChange={(e) => setValue('district', e.target.value)}>
                <option value="">Any district</option>
                {ALL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            {['buyer_demand', 'export_contract', 'tender'].includes(v.type) && (
              <>
                <Field label="Quantity wanted (kg)">
                  <input type="number" min="1" step="any" className={inputClass} value={v.quantity_kg} onChange={(e) => setValue('quantity_kg', e.target.value)} />
                </Field>
                <Field label="Price offered (RWF/kg)">
                  <input type="number" min="1" step="any" className={inputClass} value={v.price_per_kg} onChange={(e) => setValue('price_per_kg', e.target.value)} />
                </Field>
                <Field label="Minimum grade">
                  <select className={inputClass} value={v.min_grade} onChange={(e) => setValue('min_grade', e.target.value)}>
                    <option value="">Any</option>
                    {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Field label="Deadline">
              <input type="date" className={inputClass} min={form.id ? undefined : isoDay()} value={v.deadline} onChange={(e) => setValue('deadline', e.target.value)} />
            </Field>
            <Field label="Contact name">
              <input className={inputClass} value={v.contact_name} onChange={(e) => setValue('contact_name', e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <input className={inputClass} value={v.contact_phone} onChange={(e) => setValue('contact_phone', e.target.value)} />
            </Field>
            <Field label="Contact email">
              <input type="email" className={inputClass} value={v.contact_email} onChange={(e) => setValue('contact_email', e.target.value)} />
            </Field>
            <Field label="Link for more information">
              <input type="url" className={inputClass} placeholder="https://…" value={v.link} onChange={(e) => setValue('link', e.target.value)} />
            </Field>
            {!form.id && (
              <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={v.notify} onChange={(e) => setValue('notify', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                Notify farmers in this area
              </label>
            )}
          </form>
        </Dialog>
      )}
    </Page>
  );
}
