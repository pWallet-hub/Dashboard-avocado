import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingBag, ShoppingCart, Search, Package, Plus, Minus, Trash2, User, Users, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAllProducts } from '../../services/productsService';
import { listFarmers } from '../../services/usersService';
import { getProfile } from '../../services/authService';
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart, checkout } from '../../services/cartService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass,
  EmptyState, ErrorState, Spinner, Dialog, Pagination, Tabs,
} from '../../components/Ui/kit';

const CATEGORIES = [
  { id: '', label: 'All categories' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'fertilizers', label: 'Fertilizers' },
  { id: 'pest-management', label: 'Pest management' },
  { id: 'protection', label: 'Protection' },
  { id: 'tools', label: 'Tools' },
  { id: 'irrigation', label: 'Irrigation' },
  { id: 'harvesting', label: 'Harvesting' },
  { id: 'containers', label: 'Containers' },
];
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash on delivery' },
  { id: 'mobile_money', label: 'Mobile money' },
  { id: 'bank_transfer', label: 'Bank transfer' },
];
const PAGE_SIZE = 12;

const rwf = (n) => `${Math.round(Number(n) || 0).toLocaleString()} RWF`;
const labelOf = (cat) => CATEGORIES.find((c) => c.id === cat)?.label || cat || 'Other';
const emptyCart = { items: [], total: 0, item_count: 0 };
const normaliseCart = (data) => ({
  items: data?.cart?.items || [],
  total: data?.total || 0,
  item_count: data?.item_count || 0,
});

const addressFrom = (person) => ({
  full_name: person?.full_name || '',
  phone: person?.phone || '',
  street_address: [person?.village || person?.profile?.village, person?.cell || person?.profile?.cell].filter(Boolean).join(', '),
  city: person?.sector || person?.profile?.sector || person?.district || person?.profile?.district || '',
  district: person?.district || person?.profile?.district || '',
  province: person?.province || person?.profile?.province || '',
  country: 'Rwanda',
});

export default function Shop() {
  const toast = useToast();
  const confirm = useConfirm();

  // Who the order is for
  const [mode, setMode] = useState('self'); // 'self' | 'farmer'
  const [me, setMe] = useState(null);
  const [farmerQuery, setFarmerQuery] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [farmer, setFarmer] = useState(null);

  // Catalogue
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Server cart
  const [cart, setCart] = useState(emptyCart);
  const [cartBusy, setCartBusy] = useState(null); // product id being changed
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState(addressFrom(null));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    getProfile().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, category]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllProducts({ page, limit: PAGE_SIZE, category, search: debouncedSearch, in_stock: 'true' });
      setProducts(res.data || []);
      setPagination(res.pagination || { page, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadCart = useCallback(async () => {
    try {
      setCart(normaliseCart(await getCart()));
    } catch (err) {
      toast.error(err.message || 'Failed to load cart');
    }
  }, [toast]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Farmer search (only in "on behalf" mode)
  useEffect(() => {
    if (mode !== 'farmer') return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      setFarmersLoading(true);
      try {
        const res = await listFarmers({ limit: 20, search: farmerQuery.trim() || undefined });
        if (!cancelled) setFarmers(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || err.message || 'Failed to load farmers');
      } finally {
        if (!cancelled) setFarmersLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [mode, farmerQuery, toast]);

  const cartQty = useMemo(() => Object.fromEntries(cart.items.map((i) => [i.product_id, i.quantity])), [cart.items]);

  const changeCart = async (productId, fn, successMsg) => {
    setCartBusy(productId);
    try {
      setCart(normaliseCart(await fn()));
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCartBusy(null);
    }
  };

  const addToCart = (p) => {
    if ((cartQty[p.id] || 0) + 1 > (p.quantity || 0)) {
      toast.error(`Only ${p.quantity} ${p.unit || 'units'} of ${p.name} in stock`);
      return;
    }
    changeCart(p.id, () => addCartItem(p.id, 1), `${p.name} added to cart`);
  };

  const setQty = (item, qty) => {
    if (qty > (item.product?.quantity || 0)) {
      toast.error(`Only ${item.product?.quantity} in stock`);
      return;
    }
    changeCart(item.product_id, () => (qty <= 0 ? removeCartItem(item.product_id) : updateCartItem(item.product_id, qty)));
  };

  const emptyTheCart = async () => {
    const ok = await confirm('Remove all items from the cart?', { confirmLabel: 'Empty cart' });
    if (!ok) return;
    setCartBusy('all');
    try {
      await clearCart();
      setCart(emptyCart);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCartBusy(null);
    }
  };

  const openCheckout = () => {
    if (mode === 'farmer' && !farmer) {
      toast.error('Choose the farmer you are ordering for first');
      return;
    }
    setAddress(addressFrom(mode === 'farmer' ? farmer : me));
    setNotes('');
    setCheckoutError('');
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    const missing = ['full_name', 'phone', 'street_address', 'city', 'province'].filter((k) => !address[k]?.trim());
    if (missing.length) {
      setCheckoutError('Please fill in the recipient name, phone, address, city/sector and province.');
      return;
    }
    const who = mode === 'farmer'
      ? `Ordered by agent ${me?.full_name || ''} on behalf of farmer ${farmer.full_name}${farmer.phone ? ` (${farmer.phone})` : ''}`
      : `Ordered by agent ${me?.full_name || ''} for own use`;
    setPlacing(true);
    setCheckoutError('');
    try {
      const res = await checkout([who.trim(), notes.trim()].filter(Boolean).join(' — '), {
        shipping_address: address,
        payment_method: paymentMethod,
      });
      setPlacedOrder(res?.order || res);
      setCheckoutOpen(false);
      toast.success('Order placed');
      loadCart();
      loadProducts();
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  const setAddr = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  return (
    <Page>
      <PageHeader
        icon={ShoppingBag}
        title="Agent Shop"
        subtitle="Order farm inputs for yourself or on behalf of a farmer."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { loadProducts(); loadCart(); }}>Refresh</Button>
            <Button icon={ShoppingCart} onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cart.item_count} items`}>
              Cart{cart.item_count ? ` (${cart.item_count})` : ''}
            </Button>
          </>
        }
      />

      {placedOrder && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            Order <span className="font-semibold">{placedOrder.order_number || placedOrder.id}</span> placed — {rwf(placedOrder.total_amount)}, status {placedOrder.status || 'pending'}.
          </div>
          <button type="button" className="text-brand-700 hover:underline" onClick={() => setPlacedOrder(null)}>Dismiss</button>
        </div>
      )}

      <Card title="Ordering for">
        <div className="space-y-4">
          <Tabs
            tabs={[{ id: 'self', label: 'Myself', icon: User }, { id: 'farmer', label: 'On behalf of a farmer', icon: Users }]}
            value={mode}
            onChange={(v) => { setMode(v); if (v === 'self') setFarmer(null); }}
          />
          {mode === 'self' ? (
            <p className="text-sm text-slate-600">Items will be ordered for {me?.full_name || 'your own account'}.</p>
          ) : farmer ? (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{farmer.full_name}</p>
                <p className="truncate text-sm text-slate-500">
                  {[farmer.phone, farmer.sector || farmer.profile?.sector, farmer.district || farmer.profile?.district].filter(Boolean).join(' · ') || farmer.email}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setFarmer(null)}>Change farmer</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search farmers by name, phone or email…"
                  aria-label="Search farmers"
                  value={farmerQuery}
                  onChange={(e) => setFarmerQuery(e.target.value)}
                />
              </div>
              {farmersLoading ? (
                <Spinner label="Loading farmers…" />
              ) : farmers.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No farmers match your search.</p>
              ) : (
                <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                  {farmers.map((f) => (
                    <li key={f.id}>
                      <button type="button" onClick={() => setFarmer(f)} className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-slate-900">{f.full_name || f.email}</span>
                        <span className="text-xs text-slate-500">{[f.phone, f.district || f.profile?.district].filter(Boolean).join(' · ')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search products…" aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} sm:w-56`} aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading products…" />
        ) : error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description="Nothing in stock matches these filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => {
                const inCart = cartQty[p.id] || 0;
                return (
                  <div key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <Badge tone="slate" className="self-start">{labelOf(p.category)}</Badge>
                    <h3 className="mt-2 font-medium text-slate-900">{p.name}</h3>
                    {p.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description}</p>}
                    <div className="mt-auto pt-3">
                      <p className="text-lg font-semibold text-slate-900">{rwf(p.price)}<span className="text-sm font-normal text-slate-500"> / {p.unit || 'unit'}</span></p>
                      <p className="text-xs text-slate-500">{p.quantity} in stock{inCart ? ` · ${inCart} in cart` : ''}</p>
                      <Button
                        className="mt-3 w-full"
                        size="sm"
                        icon={Plus}
                        loading={cartBusy === p.id}
                        disabled={inCart >= p.quantity}
                        onClick={() => addToCart(p)}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={pagination.page || page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>

      <Dialog
        open={cartOpen}
        title="Cart"
        subtitle={mode === 'farmer' ? (farmer ? `For ${farmer.full_name}` : 'Choose a farmer before checkout') : 'For yourself'}
        onClose={() => setCartOpen(false)}
        size="lg"
        footer={
          cart.items.length > 0 && (
            <>
              <Button variant="ghost" icon={Trash2} loading={cartBusy === 'all'} onClick={emptyTheCart}>Empty cart</Button>
              <Button onClick={openCheckout}>Checkout · {rwf(cart.total)}</Button>
            </>
          )
        }
      >
        {cart.items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Your cart is empty" description="Add products from the catalogue." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {cart.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{item.product?.name}</p>
                  <p className="text-sm text-slate-500">{rwf(item.product?.price)} × {item.quantity} = {rwf((item.product?.price || 0) * item.quantity)}</p>
                  {item.product?.status !== 'available' && <Badge tone="rose" className="mt-1">No longer available</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" icon={Minus} aria-label={`Decrease ${item.product?.name}`} disabled={cartBusy === item.product_id} onClick={() => setQty(item, item.quantity - 1)} />
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button variant="secondary" size="sm" icon={Plus} aria-label={`Increase ${item.product?.name}`} disabled={cartBusy === item.product_id} onClick={() => setQty(item, item.quantity + 1)} />
                  <Button variant="ghost" size="sm" icon={Trash2} aria-label={`Remove ${item.product?.name}`} disabled={cartBusy === item.product_id} onClick={() => setQty(item, 0)} />
                </div>
              </li>
            ))}
            <li className="flex justify-between pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{rwf(cart.total)}</span>
            </li>
          </ul>
        )}
      </Dialog>

      <Dialog
        open={checkoutOpen}
        title="Checkout"
        subtitle={mode === 'farmer' && farmer ? `Ordering on behalf of ${farmer.full_name}` : 'Ordering for yourself'}
        onClose={() => !placing && setCheckoutOpen(false)}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckoutOpen(false)} disabled={placing}>Cancel</Button>
            <Button type="submit" form="agent-checkout" loading={placing}>Place order · {rwf(cart.total)}</Button>
          </>
        }
      >
        <form id="agent-checkout" onSubmit={placeOrder} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {checkoutError && (
            <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:col-span-2" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">{checkoutError}</p>
                {/customer/i.test(checkoutError) && (
                  <p className="mt-1">The server only accepts orders linked to a shop customer record, and agent accounts can’t create one yet. Your cart has been kept — please contact an administrator.</p>
                )}
              </div>
            </div>
          )}
          <Field label="Recipient name" required>
            <input className={inputClass} value={address.full_name} onChange={setAddr('full_name')} />
          </Field>
          <Field label="Phone" required>
            <input className={inputClass} value={address.phone} onChange={setAddr('phone')} placeholder="07XXXXXXXX" />
          </Field>
          <Field label="Address (village / cell)" required className="sm:col-span-2">
            <input className={inputClass} value={address.street_address} onChange={setAddr('street_address')} />
          </Field>
          <Field label="City / sector" required>
            <input className={inputClass} value={address.city} onChange={setAddr('city')} />
          </Field>
          <Field label="District">
            <input className={inputClass} value={address.district} onChange={setAddr('district')} />
          </Field>
          <Field label="Province" required>
            <input className={inputClass} value={address.province} onChange={setAddr('province')} />
          </Field>
          <Field label="Payment method">
            <select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Notes" className="sm:col-span-2" hint={mode === 'farmer' && farmer ? `The order is tagged as placed on behalf of ${farmer.full_name}.` : undefined}>
            <textarea className={textareaClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions…" />
          </Field>
        </form>
      </Dialog>
    </Page>
  );
}
