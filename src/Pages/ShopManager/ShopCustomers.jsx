import { useCallback, useEffect, useState } from 'react';
import { Users, Plus, Search, Pencil, Eye, RefreshCw, UserX, UserCheck } from 'lucide-react';
import {
  listCustomersPage, createCustomer, updateCustomer, getCustomerOrders, getCustomerStatistics,
} from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog,
  Pagination, Badge, StatGrid, StatCard,
} from '../../components/Ui/kit';
import { useMyShop, ShopGate, rwf, num, fmtDate, humanize, errMsg, OrderStatusBadge, PaymentBadge } from './shopCommon';

const PAGE_SIZE = 15;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{9,15}$/;
const emptyForm = () => ({ first_name: '', last_name: '', email: '', phone: '', type: 'individual', company: '', address: '', notes: '', tags: '' });

const ShopCustomers = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const shopState = useMyShop();
  const { shop } = shopState;

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // 'new' | customer
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null); // { customer, stats, orders, loading, error }

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomersPage({ page, limit: PAGE_SIZE, ...(query && { search: query }), ...(status && { status }) });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(errMsg(e, 'Could not load customers'));
    } finally {
      setLoading(false);
    }
  }, [shop, page, query, status]);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(emptyForm()); setEditing('new'); };
  const openEdit = (c) => {
    const [first, ...rest] = (c.name || '').split(' ');
    setForm({
      first_name: c.first_name || first || '', last_name: c.last_name || rest.join(' '), email: c.email || '', phone: c.phone || '',
      type: c.type || 'individual', company: c.company || '', address: c.address || '', notes: c.notes || '',
      tags: Array.isArray(c.tags) ? c.tags.join(', ') : '',
    });
    setEditing(c);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim()) return toast.error('Enter the customer\'s first name');
    if (!EMAIL_RE.test(form.email.trim())) return toast.error('Enter a valid email address');
    if (!PHONE_RE.test(form.phone.trim())) return toast.error('Enter a valid phone number, e.g. +250788123456');
    if (form.type === 'business' && !form.company.trim()) return toast.error('Enter the business name');
    const payload = {
      first_name: form.first_name.trim(), last_name: form.last_name.trim(),
      name: [form.first_name.trim(), form.last_name.trim()].filter(Boolean).join(' '),
      email: form.email.trim(), phone: form.phone.trim(), type: form.type,
      company: form.type === 'business' ? form.company.trim() : null,
      address: form.address.trim() || null, notes: form.notes.trim() || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (editing === 'new') {
        await createCustomer(payload);
        toast.success('Customer added');
      } else {
        await updateCustomer(editing.id, payload);
        toast.success('Customer updated');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not save the customer'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    const deactivate = c.status !== 'inactive';
    if (deactivate) {
      const ok = await confirm(`Deactivate ${c.name}? They stay in your records but can no longer be chosen for new orders.`, { confirmLabel: 'Deactivate' });
      if (!ok) return;
    }
    try {
      await updateCustomer(c.id, { status: deactivate ? 'inactive' : 'active' });
      toast.success(deactivate ? 'Customer deactivated' : 'Customer reactivated');
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not update the customer'));
    }
  };

  const openDetail = async (customer) => {
    setDetail({ customer, loading: true });
    try {
      const [stats, orders] = await Promise.all([getCustomerStatistics(customer.id), getCustomerOrders(customer.id)]);
      setDetail({ customer, stats, orders: Array.isArray(orders) ? orders : [], loading: false });
    } catch (err) {
      setDetail({ customer, loading: false, error: errMsg(err, 'Could not load customer details') });
    }
  };

  const header = (
    <PageHeader icon={Users} title="Customers" subtitle="People and businesses who buy from your shop"
      actions={shop && (
        <>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={Plus} onClick={openNew}>Add customer</Button>
        </>
      )} />
  );
  if (!shop) return <Page>{header}<ShopGate state={shopState} /></Page>;

  return (
    <Page>
      {header}
      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <label className="relative block sm:col-span-2">
            <span className="sr-only">Search customers</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select aria-label="Status" className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading && !rows.length ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> : rows.length === 0 ? (
          <EmptyState icon={Users} title={query || status ? 'No customers match' : 'No customers yet'}
            description={query || status ? 'Try another search.' : 'Add your regular buyers so you can record sales and orders for them.'}
            action={!query && !status && <Button icon={Plus} onClick={openNew}>Add customer</Button>} />
        ) : (
          <>
            <Table head={['Customer', 'Contact', 'Tags', 'Since', 'Status', '']}>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.type === 'business' ? c.company || 'Business' : 'Individual'}</p>
                  </Td>
                  <Td><p>{c.phone}</p><p className="text-xs text-slate-500">{c.email}</p></Td>
                  <Td>{c.tags?.length ? c.tags.join(', ') : '—'}</Td>
                  <Td>{fmtDate(c.created_at)}</Td>
                  <Td><Badge tone={c.status === 'inactive' ? 'slate' : 'brand'}>{humanize(c.status)}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" aria-label={`View ${c.name}`} onClick={() => openDetail(c)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" aria-label={c.status === 'inactive' ? `Reactivate ${c.name}` : `Deactivate ${c.name}`} onClick={() => toggleActive(c)}>
                        {c.status === 'inactive' ? <UserCheck className="h-4 w-4 text-brand-700" /> : <UserX className="h-4 w-4 text-rose-600" />}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {editing && (
        <Dialog title={editing === 'new' ? 'Add customer' : `Edit ${editing.name}`} onClose={() => !saving && setEditing(null)} size="lg"
          footer={<>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="customer-form" loading={saving}>{editing === 'new' ? 'Add customer' : 'Save changes'}</Button>
          </>}>
          <form id="customer-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" required><input className={inputClass} value={form.first_name} onChange={set('first_name')} maxLength={100} /></Field>
            <Field label="Last name"><input className={inputClass} value={form.last_name} onChange={set('last_name')} maxLength={100} /></Field>
            <Field label="Email" required><input type="email" className={inputClass} value={form.email} onChange={set('email')} /></Field>
            <Field label="Phone" required><input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+250788123456" /></Field>
            <Field label="Type">
              <select className={inputClass} value={form.type} onChange={set('type')}>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </Field>
            {form.type === 'business'
              ? <Field label="Business name" required><input className={inputClass} value={form.company} onChange={set('company')} /></Field>
              : <div className="hidden sm:block" />}
            <Field label="Address" className="sm:col-span-2"><input className={inputClass} value={form.address} onChange={set('address')} placeholder="Sector, district" /></Field>
            <Field label="Tags" hint="Comma separated, e.g. wholesale, cooperative" className="sm:col-span-2"><input className={inputClass} value={form.tags} onChange={set('tags')} /></Field>
            <Field label="Notes" className="sm:col-span-2"><textarea className={textareaClass} value={form.notes} onChange={set('notes')} maxLength={1000} /></Field>
          </form>
        </Dialog>
      )}

      {detail && (
        <Dialog title={detail.customer.name} subtitle={`${detail.customer.phone} · ${detail.customer.email}`} size="lg" onClose={() => setDetail(null)}>
          {detail.loading ? <Spinner /> : detail.error ? <ErrorState message={detail.error} onRetry={() => openDetail(detail.customer)} /> : (
            <div className="space-y-5">
              <StatGrid cols={3}>
                <StatCard label="Orders" value={num(detail.stats?.total_orders)} />
                <StatCard label="Total spent" value={rwf(detail.stats?.total_spent)} tone="slate" />
                <StatCard label="Last order" value={fmtDate(detail.stats?.last_order_date)} tone="slate" />
              </StatGrid>
              {detail.stats?.favorite_products?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-900">Favourite products</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.stats.favorite_products.map((f) => <Badge key={f.product_id} tone="brand">{f.product_name} × {num(f.total_quantity)}</Badge>)}
                  </div>
                </div>
              )}
              {detail.orders.length === 0 ? <EmptyState title="No orders yet" /> : (
                <Table head={['Order', 'Date', 'Total', 'Status', 'Payment']}>
                  {detail.orders.map((o) => (
                    <tr key={o.id}>
                      <Td className="font-medium text-slate-900">{o.order_number}</Td>
                      <Td>{fmtDate(o.order_date || o.created_at)}</Td>
                      <Td>{rwf(o.total_amount)}</Td>
                      <Td><OrderStatusBadge status={o.status} /></Td>
                      <Td><PaymentBadge status={o.payment_status} /></Td>
                    </tr>
                  ))}
                </Table>
              )}
              {detail.customer.notes && <p className="text-sm text-slate-600">{detail.customer.notes}</p>}
            </div>
          )}
        </Dialog>
      )}
    </Page>
  );
};

export default ShopCustomers;
