import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, PackagePlus, SlidersHorizontal, History, RefreshCw, AlertTriangle, ShoppingBag } from 'lucide-react';
import { getInventoryItemHistory, restockInventoryItem } from '../../services/marketStorageService';
import { updateProductStock } from '../../services/productsService';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, StatGrid, StatCard, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Table, Td,
  Dialog, Pagination, Tabs, Badge,
} from '../../components/Ui/kit';
import {
  useMyShop, ShopGate, fetchAllShopProducts, rwf, num, fmtDateTime, humanize, errMsg, StockBadge, isActiveProduct,
  isLowStock, isOutOfStock, minStockOf,
} from './shopCommon';

const PAGE_SIZE = 15;
const ADJUST_REASONS = ['adjustment', 'damage', 'return', 'sale', 'other'];

const ShopInventory = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const shopState = useMyShop();
  const { shop } = shopState;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null); // { type: 'restock'|'adjust', product }
  const [form, setForm] = useState({ quantity: '', reason: 'adjustment', notes: '' });
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState(null); // { product, rows, loading, error }

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    setError(null);
    try {
      setProducts((await fetchAllShopProducts(shop.shop_number)).filter(isActiveProduct));
    } catch (e) {
      setError(errMsg(e, 'Could not load inventory'));
    } finally {
      setLoading(false);
    }
  }, [shop]);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => ({
    all: products.length,
    low: products.filter(isLowStock).length,
    out: products.filter(isOutOfStock).length,
  }), [products]);
  const value = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products
      .filter((p) => (tab === 'low' ? isLowStock(p) : tab === 'out' ? isOutOfStock(p) : true))
      .filter((p) => !s || [p.name, p.sku, p.brand].some((v) => v && String(v).toLowerCase().includes(s)));
  }, [products, tab, search]);
  useEffect(() => { setPage(1); }, [tab, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAction = (type, product) => {
    setForm({ quantity: type === 'adjust' ? String(product.quantity ?? 0) : '', reason: 'adjustment', notes: '' });
    setAction({ type, product });
  };

  const submit = async (e) => {
    e.preventDefault();
    const q = Number(form.quantity);
    const { type, product } = action;
    if (type === 'restock' && (!Number.isInteger(q) || q < 1)) return toast.error('Enter a whole number of units to add (1 or more)');
    if (type === 'adjust' && (!Number.isInteger(q) || q < 0)) return toast.error('Enter the counted stock as a whole number (0 or more)');
    if (type === 'adjust' && q === Number(product.quantity)) return toast.error('The new quantity is the same as the current stock');
    setSaving(true);
    try {
      if (type === 'restock') {
        await restockInventoryItem(product.id, q, form.notes.trim() || undefined);
        toast.success(`Added ${q} ${product.unit} to ${product.name}`);
      } else {
        await updateProductStock(product.id, q, { reason: form.reason, notes: form.notes.trim() || undefined });
        toast.success(`${product.name} stock set to ${q} ${product.unit}`);
      }
      setAction(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not update stock'));
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (product) => {
    setHistory({ product, rows: [], loading: true, error: null });
    try {
      const rowsData = await getInventoryItemHistory(product.id, { limit: 50 });
      setHistory({ product, rows: Array.isArray(rowsData) ? rowsData : [], loading: false, error: null });
    } catch (err) {
      setHistory({ product, rows: [], loading: false, error: errMsg(err, 'Could not load stock history') });
    }
  };

  const header = (
    <PageHeader
      icon={Package}
      title="Inventory"
      subtitle="Stock levels, restocking and adjustments"
      actions={shop && (
        <>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button variant="secondary" icon={ShoppingBag} onClick={() => navigate('/dashboard/shop-manager/products')}>Manage products</Button>
        </>
      )}
    />
  );
  if (!shop) return <Page>{header}<ShopGate state={shopState} /></Page>;

  return (
    <Page>
      {header}
      <StatGrid>
        <StatCard label="Products in stock list" value={num(counts.all)} icon={Package} />
        <StatCard label="Stock value (retail)" value={rwf(value)} tone="slate" />
        <StatCard label="Low stock" value={num(counts.low)} icon={AlertTriangle} tone="amber" />
        <StatCard label="Out of stock" value={num(counts.out)} tone="rose" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'low', label: 'Low stock', count: counts.low },
            { id: 'out', label: 'Out of stock', count: counts.out },
          ]} />
          <label className="relative block md:w-72">
            <span className="sr-only">Search inventory</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search name, SKU, brand…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        {loading && !products.length ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? (
          <EmptyState icon={Package}
            title={products.length ? 'Nothing here' : 'No products in your inventory'}
            description={products.length ? (tab === 'all' ? 'No product matches your search.' : 'No product is in this state right now.') : 'Add products from the Products page, then manage their stock here.'} />
        ) : (
          <>
            <Table head={['Product', 'In stock', 'Minimum', 'Unit price', 'Value', 'Status', '']}>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sku || humanize(p.category)}</p>
                  </Td>
                  <Td className="font-medium text-slate-900">{num(p.quantity)} {p.unit}</Td>
                  <Td>{num(minStockOf(p))}</Td>
                  <Td>{rwf(p.price)}</Td>
                  <Td>{rwf(Number(p.price || 0) * Number(p.quantity || 0))}</Td>
                  <Td><StockBadge product={p} /></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="secondary" size="sm" icon={PackagePlus} onClick={() => openAction('restock', p)}>Restock</Button>
                      <Button variant="ghost" size="sm" aria-label={`Adjust stock of ${p.name}`} onClick={() => openAction('adjust', p)}><SlidersHorizontal className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" aria-label={`Stock history of ${p.name}`} onClick={() => openHistory(p)}><History className="h-4 w-4" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={setPage} />
          </>
        )}
      </Card>

      {action && (
        <Dialog
          title={action.type === 'restock' ? `Restock ${action.product.name}` : `Adjust ${action.product.name}`}
          subtitle={`Current stock: ${num(action.product.quantity)} ${action.product.unit}`}
          onClose={() => !saving && setAction(null)}
          footer={<>
            <Button variant="secondary" onClick={() => setAction(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="stock-form" loading={saving}>{action.type === 'restock' ? 'Add stock' : 'Save count'}</Button>
          </>}
        >
          <form id="stock-form" onSubmit={submit} className="space-y-4">
            {action.type === 'restock' ? (
              <Field label={`Units to add (${action.product.unit})`} required>
                <input type="number" min="1" step="1" autoFocus className={inputClass} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
              </Field>
            ) : (
              <>
                <Field label={`Counted stock (${action.product.unit})`} required hint="The quantity actually on the shelf">
                  <input type="number" min="0" step="1" autoFocus className={inputClass} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
                </Field>
                <Field label="Reason" required>
                  <select className={inputClass} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}>
                    {ADJUST_REASONS.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Field label="Notes"><input className={inputClass} value={form.notes} maxLength={300} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. delivery note number" /></Field>
          </form>
        </Dialog>
      )}

      {history && (
        <Dialog title={`Stock history — ${history.product.name}`} onClose={() => setHistory(null)} size="lg">
          {history.loading ? <Spinner /> : history.error ? <ErrorState message={history.error} onRetry={() => openHistory(history.product)} /> : history.rows.length === 0 ? (
            <EmptyState icon={History} title="No stock movements yet" />
          ) : (
            <Table head={['Date', 'Reason', 'Change', 'Before → after', 'Notes']}>
              {history.rows.map((h) => (
                <tr key={h.id}>
                  <Td>{fmtDateTime(h.created_at)}</Td>
                  <Td><Badge>{humanize(h.reason)}</Badge></Td>
                  <Td className={h.change_amount < 0 ? 'font-medium text-rose-700' : 'font-medium text-brand-700'}>{h.change_amount > 0 ? '+' : ''}{num(h.change_amount)}</Td>
                  <Td>{num(h.previous_quantity)} → {num(h.new_quantity)}</Td>
                  <Td className="max-w-xs truncate">{h.notes || '—'}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Dialog>
      )}
    </Page>
  );
};

export default ShopInventory;
