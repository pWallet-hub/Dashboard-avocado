import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Plus, Search, Pencil, Trash2, Eye, ImagePlus, X, RefreshCw, ImageOff } from 'lucide-react';
import { addToShopInventory, updateShopInventory, deleteInventoryItem } from '../../services/marketStorageService';
import { uploadMultiple } from '../../services/uploadService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner,
  Table, Td, Dialog, Pagination,
} from '../../components/Ui/kit';
import {
  useMyShop, ShopGate, fetchAllShopProducts, rwf, num, fmtDate, humanize, errMsg, PRODUCT_CATEGORIES, PRODUCT_UNITS,
  normCategory, StockBadge, productImage, isActiveProduct, isLowStock, isOutOfStock,
} from './shopCommon';

const PAGE_SIZE = 12;
const MAX_IMAGES = 5;
const emptyForm = () => ({
  name: '', category: 'seeds', unit: 'piece', price: '', cost: '', quantity: '0', min_stock: '10',
  brand: '', variety: '', description: '', expiry_date: '', images: [],
});

const Thumb = ({ product, size = 'h-10 w-10' }) => {
  const src = productImage(product);
  const [broken, setBroken] = useState(false);
  if (!src || broken)
    return <div className={`${size} flex shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400`}><ImageOff className="h-4 w-4" /></div>;
  return <img src={src} alt={product.name} onError={() => setBroken(true)} className={`${size} shrink-0 rounded-lg object-cover ring-1 ring-slate-200`} />;
};

const ShopProducts = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const shopState = useMyShop();
  const { shop } = shopState;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', status: 'active' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchAllShopProducts(shop.shop_number));
    } catch (e) {
      setError(errMsg(e, 'Could not load products'));
    } finally {
      setLoading(false);
    }
  }, [shop]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    return products.filter((p) => {
      if (filters.status === 'active' && !isActiveProduct(p)) return false;
      if (filters.status === 'discontinued' && isActiveProduct(p)) return false;
      if (filters.category && normCategory(p.category) !== filters.category) return false;
      if (s && ![p.name, p.brand, p.sku, p.variety].some((v) => v && String(v).toLowerCase().includes(s))) return false;
      return true;
    });
  }, [products, filters]);
  useEffect(() => { setPage(1); }, [filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const active = products.filter(isActiveProduct);
  const stats = {
    total: active.length,
    value: active.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0),
    low: active.filter(isLowStock).length,
    out: active.filter(isOutOfStock).length,
  };

  const openNew = () => { setForm(emptyForm()); setEditing('new'); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '', category: normCategory(p.category) || 'seeds', unit: p.unit || 'piece',
      price: String(p.price ?? ''), cost: p.cost != null ? String(p.cost) : '', quantity: String(p.quantity ?? 0),
      min_stock: String(p.min_stock ?? 10), brand: p.brand || '', variety: p.variety || '', description: p.description || '',
      expiry_date: p.expiry_date ? String(p.expiry_date).slice(0, 10) : '', images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
    });
    setEditing(p);
  };
  const closeForm = () => { if (!saving) setEditing(null); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) { toast.error(`A product can have at most ${MAX_IMAGES} images`); return; }
    const bad = files.find((f) => !f.type.startsWith('image/') || f.size > 5 * 1024 * 1024);
    if (bad) { toast.error('Images must be image files of 5 MB or less'); return; }
    setUploading(true);
    try {
      const res = await uploadMultiple(files.slice(0, room));
      const list = Array.isArray(res?.data) ? res.data : res?.data?.files || [];
      const urls = list.map((f) => f.url).filter(Boolean);
      if (!urls.length) throw new Error('Upload returned no file URL');
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      toast.error(errMsg(err, 'Image upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const qty = Number(form.quantity);
    const minStock = Number(form.min_stock);
    if (form.name.trim().length < 2) return toast.error('Enter a product name (at least 2 characters)');
    if (!(price > 0)) return toast.error('Enter a selling price greater than 0');
    if (form.cost !== '' && !(Number(form.cost) >= 0)) return toast.error('Cost must be 0 or more');
    if (editing === 'new' && (!Number.isInteger(qty) || qty < 0)) return toast.error('Opening stock must be a whole number, 0 or more');
    if (!Number.isInteger(minStock) || minStock < 0) return toast.error('Minimum stock must be a whole number, 0 or more');

    const payload = {
      name: form.name.trim(), category: form.category, unit: form.unit, price,
      cost: form.cost === '' ? null : Number(form.cost), min_stock: minStock,
      brand: form.brand.trim() || null, variety: form.variety.trim() || null, description: form.description.trim() || null,
      images: form.images,
      ...(form.expiry_date ? { expiry_date: form.expiry_date } : {}),
    };
    setSaving(true);
    try {
      if (editing === 'new') {
        await addToShopInventory({ ...payload, quantity: qty, supplier_id: shop.id });
        toast.success('Product added');
      } else {
        await updateShopInventory(editing.id, payload);
        toast.success('Product updated');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not save the product'));
    } finally {
      setSaving(false);
    }
  };

  const discontinue = async (p) => {
    const ok = await confirm(`Remove "${p.name}" from your catalogue? It will be marked as discontinued and can no longer be ordered.`, { confirmLabel: 'Remove product' });
    if (!ok) return;
    try {
      await deleteInventoryItem(p.id);
      toast.success('Product removed');
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not remove the product'));
    }
  };

  const header = (
    <PageHeader
      icon={ShoppingBag}
      title="Products"
      subtitle="Your shop's catalogue: prices, details and photos"
      actions={shop && (
        <>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button icon={Plus} onClick={openNew}>Add product</Button>
        </>
      )}
    />
  );
  if (!shop) return <Page>{header}<ShopGate state={shopState} /></Page>;

  return (
    <Page>
      {header}
      <StatGrid>
        <StatCard label="Active products" value={num(stats.total)} icon={ShoppingBag} />
        <StatCard label="Stock value (retail)" value={rwf(stats.value)} tone="slate" />
        <StatCard label="Low stock" value={num(stats.low)} tone="amber" />
        <StatCard label="Out of stock" value={num(stats.out)} tone="rose" />
      </StatGrid>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name, brand, SKU…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </label>
          <select aria-label="Category" className={inputClass} value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
          </select>
          <select aria-label="Status" className={inputClass} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active products</option>
            <option value="discontinued">Discontinued</option>
            <option value="">All</option>
          </select>
        </div>

        {loading && !products.length ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title={products.length ? 'No products match your filters' : 'No products yet'}
            description={products.length ? 'Try a different search or category.' : 'Add the first product your shop sells.'}
            action={!products.length && <Button icon={Plus} onClick={openNew}>Add product</Button>} />
        ) : (
          <>
            <Table head={['Product', 'Category', 'Price', 'Stock', 'Status', '']}>
              {pageRows.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Thumb product={p} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{[p.brand, p.sku].filter(Boolean).join(' · ') || '—'}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{humanize(normCategory(p.category))}</Td>
                  <Td>{rwf(p.price)} <span className="text-xs text-slate-500">/ {p.unit}</span></Td>
                  <Td>{num(p.quantity)} {p.unit}</Td>
                  <Td><StockBadge product={p} /></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" aria-label={`View ${p.name}`} onClick={() => setViewing(p)}><Eye className="h-4 w-4" /></Button>
                      {isActiveProduct(p) && <>
                        <Button variant="ghost" size="sm" aria-label={`Edit ${p.name}`} onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={`Remove ${p.name}`} onClick={() => discontinue(p)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
                      </>}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={setPage} />
          </>
        )}
      </Card>

      {editing && (
        <Dialog
          title={editing === 'new' ? 'Add product' : `Edit ${editing.name}`}
          onClose={closeForm}
          size="lg"
          footer={<>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>Cancel</Button>
            <Button type="submit" form="product-form" loading={saving} disabled={uploading}>{editing === 'new' ? 'Add product' : 'Save changes'}</Button>
          </>}
        >
          <form id="product-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required className="sm:col-span-2"><input className={inputClass} value={form.name} onChange={set('name')} maxLength={200} /></Field>
            <Field label="Category" required>
              <select className={inputClass} value={form.category} onChange={set('category')}>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
              </select>
            </Field>
            <Field label="Unit" required>
              <select className={inputClass} value={form.unit} onChange={set('unit')}>
                {PRODUCT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Selling price (RWF)" required><input type="number" min="0" step="any" className={inputClass} value={form.price} onChange={set('price')} /></Field>
            <Field label="Cost price (RWF)" hint="Optional, used for margins"><input type="number" min="0" step="any" className={inputClass} value={form.cost} onChange={set('cost')} /></Field>
            {editing === 'new' ? (
              <Field label="Opening stock" required><input type="number" min="0" step="1" className={inputClass} value={form.quantity} onChange={set('quantity')} /></Field>
            ) : (
              <Field label="Stock" hint="Change stock from the Inventory page"><input className={inputClass} value={`${form.quantity} ${form.unit}`} disabled /></Field>
            )}
            <Field label="Minimum stock" hint="Low-stock alert level"><input type="number" min="0" step="1" className={inputClass} value={form.min_stock} onChange={set('min_stock')} /></Field>
            <Field label="Brand"><input className={inputClass} value={form.brand} onChange={set('brand')} /></Field>
            <Field label="Variety"><input className={inputClass} value={form.variety} onChange={set('variety')} /></Field>
            <Field label="Expiry date"><input type="date" className={inputClass} value={form.expiry_date} onChange={set('expiry_date')} /></Field>
            <Field label="Description" className="sm:col-span-2"><textarea className={textareaClass} value={form.description} onChange={set('description')} maxLength={2000} /></Field>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Photos <span className="font-normal text-slate-500">({form.images.length}/{MAX_IMAGES})</span></p>
              <div className="flex flex-wrap gap-3">
                {form.images.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="Product" className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200" />
                    <button type="button" aria-label="Remove photo" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }))}
                      className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-600 shadow ring-1 ring-slate-200 hover:text-rose-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {form.images.length < MAX_IMAGES && (
                  <label className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-700 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                    <ImagePlus className="h-5 w-5" />
                    {uploading ? 'Uploading…' : 'Add photo'}
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </form>
        </Dialog>
      )}

      {viewing && (
        <Dialog title={viewing.name} subtitle={humanize(normCategory(viewing.category))} onClose={() => setViewing(null)} size="lg"
          footer={isActiveProduct(viewing) && <Button icon={Pencil} onClick={() => { const p = viewing; setViewing(null); openEdit(p); }}>Edit</Button>}>
          <div className="space-y-4">
            {Array.isArray(viewing.images) && viewing.images.filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-3">
                {viewing.images.filter(Boolean).map((url) => <img key={url} src={url} alt={viewing.name} className="h-28 w-28 rounded-lg object-cover ring-1 ring-slate-200" />)}
              </div>
            )}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Price', `${rwf(viewing.price)} / ${viewing.unit}`],
                ['Cost', viewing.cost != null ? rwf(viewing.cost) : '—'],
                ['In stock', `${num(viewing.quantity)} ${viewing.unit}`],
                ['Minimum stock', num(viewing.min_stock ?? 10)],
                ['Brand', viewing.brand || '—'],
                ['Variety', viewing.variety || '—'],
                ['SKU', viewing.sku || '—'],
                ['Expiry', fmtDate(viewing.expiry_date)],
                ['Added', fmtDate(viewing.created_at)],
                ['Status', <StockBadge key="s" product={viewing} />],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v}</dd></div>
              ))}
            </dl>
            {viewing.description && <p className="text-sm text-slate-600">{viewing.description}</p>}
          </div>
        </Dialog>
      )}
    </Page>
  );
};

export default ShopProducts;
