import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, PackageX } from 'lucide-react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../../services/productsService';
import { getSuppliers } from '../../../services/marketStorageService';
import { useToast } from '../../../components/Ui/Toast';
import { useConfirm } from '../../../components/Ui/ConfirmDialog';
import {
  Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Pagination, Dialog,
} from '../../../components/Ui/kit';
import { errMsg, rwf, fmtDate, ALL_CATEGORIES, CREATE_CATEGORIES, categoryLabel, UNITS, PRODUCT_STATUSES, productStatusTone } from './utils';

const PAGE_SIZE = 20;
const emptyProduct = () => ({ name: '', category: 'irrigation', description: '', price: '', quantity: '', unit: 'piece', supplier_id: '', brand: '', image: '', status: 'available' });

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ProductsTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [dialog, setDialog] = useState(null); // { mode: 'create'|'edit'|'view', product? }
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts({ page, limit: PAGE_SIZE, search: debouncedSearch, category, status });
      setProducts(res.data || []);
      setPagination(res.pagination || {});
    } catch (e) {
      setError(errMsg(e, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, category, status]);
  useEffect(() => {
    getSuppliers().then((d) => setSuppliers(Array.isArray(d) ? d : [])).catch(() => setSuppliers([]));
  }, []);

  const supplierName = (id) => suppliers.find((s) => s.id === id)?.name;

  const open = (mode, product) => {
    setForm(product ? {
      name: product.name || '', category: product.category || 'irrigation', description: product.description || '',
      price: String(product.price ?? ''), quantity: String(product.quantity ?? ''), unit: product.unit || 'piece',
      supplier_id: product.supplier_id || '', brand: product.brand || '', image: product.images?.[0] || '', status: product.status || 'available',
    } : { ...emptyProduct(), supplier_id: suppliers[0]?.id || '' });
    setDialog({ mode, product });
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (form.name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    if (!Number.isFinite(price) || price < 0) { toast.error('Price must be 0 or more'); return; }
    if (!Number.isInteger(quantity) || quantity < 0) { toast.error('Quantity must be a whole number, 0 or more'); return; }
    if (!form.supplier_id) { toast.error('Choose a supplier'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), category: form.category, price, quantity, unit: form.unit, supplier_id: form.supplier_id,
        description: form.description.trim() || undefined, brand: form.brand.trim() || undefined,
        images: form.image.trim() ? [form.image.trim()] : [],
      };
      if (dialog.mode === 'create') {
        await createProduct(payload);
        toast.success('Product created');
      } else {
        await updateProduct(dialog.product.id, { ...payload, ...(quantity > 0 ? { status: form.status } : {}) });
        toast.success('Product updated');
      }
      setDialog(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to save product'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    const ok = await confirm(`Discontinue ${p.name}? It will be hidden from shops and growers.`, { confirmLabel: 'Discontinue' });
    if (!ok) return;
    try {
      await deleteProduct(p.id);
      toast.success('Product discontinued');
      load();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to discontinue product'));
    }
  };

  const readOnly = dialog?.mode === 'view';
  const categoryOptions = dialog?.mode === 'create' ? CREATE_CATEGORIES : ALL_CATEGORIES;

  return (
    <>
      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name, brand or description" aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-96">
            <select className={inputClass} aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {ALL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select className={inputClass} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Active (not discontinued)</option>
              {PRODUCT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <Button icon={Plus} onClick={() => open('create')}>Add product</Button>
        </div>

        {loading ? <Spinner label="Loading products…" /> : error ? <ErrorState message={error} onRetry={load} /> : products.length === 0 ? (
          <EmptyState icon={PackageX} title="No products found" description="Try a different search or filter." />
        ) : (
          <>
            <Table head={['Product', 'Category', 'Supplier', 'Price', 'Stock', 'Status', '']}>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.brand || p.sku || ''}</div>
                  </Td>
                  <Td>{categoryLabel(p.category)}</Td>
                  <Td>{supplierName(p.supplier_id) || <span className="text-slate-400">—</span>}</Td>
                  <Td>{rwf(p.price)}</Td>
                  <Td className={p.quantity <= (p.min_stock ?? 10) ? 'font-medium text-amber-700' : undefined}>{p.quantity} {p.unit}</Td>
                  <Td><Badge tone={productStatusTone[p.status] || 'slate'}>{p.status?.replace(/_/g, ' ')}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} aria-label={`View ${p.name}`} onClick={() => open('view', p)} />
                      <Button size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${p.name}`} onClick={() => open('edit', p)} />
                      {p.status !== 'discontinued' && (
                        <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-600 hover:bg-rose-50" aria-label={`Discontinue ${p.name}`} onClick={() => remove(p)} />
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      {dialog && (
        <Dialog
          title={dialog.mode === 'create' ? 'Add product' : readOnly ? form.name : `Edit ${dialog.product?.name}`}
          subtitle={readOnly ? `SKU ${dialog.product?.sku || '—'} · added ${fmtDate(dialog.product?.created_at)}` : undefined}
          size="lg"
          onClose={() => !saving && setDialog(null)}
          footer={readOnly
            ? <Button variant="secondary" icon={Pencil} onClick={() => setDialog({ ...dialog, mode: 'edit' })}>Edit</Button>
            : (
              <>
                <Button variant="secondary" onClick={() => setDialog(null)} disabled={saving}>Cancel</Button>
                <Button type="submit" form="product-form" loading={saving}>{dialog.mode === 'create' ? 'Create product' : 'Save changes'}</Button>
              </>
            )}
        >
          <form id="product-form" onSubmit={submit}>
            <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required className="sm:col-span-2"><input className={inputClass} value={form.name} onChange={set('name')} required minLength={2} maxLength={200} /></Field>
              <Field label="Category" required>
                <select className={inputClass} value={form.category} onChange={set('category')}>
                  {!categoryOptions.some((c) => c.value === form.category) && <option value={form.category}>{categoryLabel(form.category)}</option>}
                  {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Supplier" required>
                <select className={inputClass} value={form.supplier_id} onChange={set('supplier_id')} required>
                  <option value="">Select…</option>
                  {form.supplier_id && !suppliers.some((s) => s.id === form.supplier_id) && <option value={form.supplier_id}>Current supplier</option>}
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Price (RWF)" required><input className={inputClass} type="number" min="0" step="any" value={form.price} onChange={set('price')} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity" required><input className={inputClass} type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required /></Field>
                <Field label="Unit">
                  <select className={inputClass} value={form.unit} onChange={set('unit')}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Brand"><input className={inputClass} value={form.brand} onChange={set('brand')} /></Field>
              {dialog.mode !== 'create' && (
                <Field label="Status" hint="Set automatically to out of stock when quantity is 0.">
                  <select className={inputClass} value={form.status} onChange={set('status')}>
                    {PRODUCT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Image URL" className="sm:col-span-2"><input className={inputClass} type="url" placeholder="https://…" value={form.image} onChange={set('image')} /></Field>
              <Field label="Description" className="sm:col-span-2"><textarea className={textareaClass} value={form.description} onChange={set('description')} /></Field>
              {readOnly && form.image && <img src={form.image} alt={form.name} className="max-h-48 rounded-xl object-contain sm:col-span-2" />}
            </fieldset>
          </form>
        </Dialog>
      )}
    </>
  );
}
