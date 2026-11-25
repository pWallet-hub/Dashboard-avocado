import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, Package, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getCart, updateCartItem, removeCartItem, clearCart, checkout } from '../../services/cartService';
import { getFarmerInformation } from '../../services/farmer-information';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog } from '../../components/Ui/kit';
import { rwf, errMsg, farmLocationFromProfile } from './farmerShared';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash on delivery' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'bank_transfer', label: 'Bank transfer' },
];

export default function Cart() {
  const toast = useToast();
  const confirm = useConfirm();

  const [cart, setCart] = useState(null); // { cart: { items }, total, item_count }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ shipping_address: '', payment_method: 'cash', notes: '' });
  const [formError, setFormError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCart(await getCart());
    } catch (e) {
      setError(errMsg(e, 'Failed to load cart'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pre-fill the delivery address with the farm location.
  useEffect(() => {
    getFarmerInformation()
      .then((res) => {
        const loc = farmLocationFromProfile((res?.data || res)?.farmer_profile);
        const address = [loc.village, loc.cell, loc.sector, loc.district, loc.province].filter(Boolean).join(', ');
        if (address) setForm((f) => (f.shipping_address ? f : { ...f, shipping_address: address }));
      })
      .catch(() => {});
  }, []);

  const items = cart?.cart?.items || [];
  const total = cart?.total ?? items.reduce((s, i) => s + i.quantity * (i.product?.price || 0), 0);

  const applyResult = (res) => {
    if (res?.cart) setCart(res);
    else load();
  };

  const changeQty = async (item, quantity) => {
    if (quantity < 1) return;
    const stock = item.product?.quantity;
    if (stock !== undefined && quantity > stock) {
      toast.error(`Only ${stock} in stock`);
      return;
    }
    setBusyId(item.product_id);
    try {
      applyResult(await updateCartItem(item.product_id, quantity));
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update quantity'));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    const ok = await confirm(`Remove “${item.product?.name || 'this item'}” from your cart?`, { title: 'Remove item', confirmLabel: 'Remove' });
    if (!ok) return;
    setBusyId(item.product_id);
    try {
      await removeCartItem(item.product_id);
      toast.success('Item removed');
      await load();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to remove item'));
    } finally {
      setBusyId(null);
    }
  };

  const empty = async () => {
    const ok = await confirm('Remove all items from your cart?', { title: 'Clear cart', confirmLabel: 'Clear cart' });
    if (!ok) return;
    try {
      await clearCart();
      toast.success('Cart cleared');
      await load();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to clear cart'));
    }
  };

  const submitCheckout = async () => {
    if (!form.shipping_address.trim()) {
      setFormError('Delivery address is required');
      return;
    }
    setFormError('');
    setCheckingOut(true);
    try {
      const res = await checkout(form.notes.trim(), { shipping_address: form.shipping_address.trim(), payment_method: form.payment_method });
      setCompletedOrder(res?.order || res);
      setShowCheckout(false);
      setForm((f) => ({ ...f, notes: '' }));
      toast.success('Order placed');
      await load();
    } catch (e) {
      const msg = errMsg(e, 'Checkout failed');
      setFormError(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Page>
      <PageHeader
        icon={ShoppingCart}
        title="My Cart"
        subtitle="Review your items, then check out to place one order."
        actions={
          <Link to="/dashboard/farmer/market" className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        }
      />

      {completedOrder && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900" role="status">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Order placed successfully</p>
            <p>
              Order number <span className="font-mono">{completedOrder.order_number || completedOrder.id}</span>
              {completedOrder.total_amount !== undefined && <> · Total {rwf(completedOrder.total_amount)}</>}. The shop will contact you about delivery.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCompletedOrder(null)}>Dismiss</Button>
        </div>
      )}

      <Card padded={false}>
        {loading ? (
          <Spinner label="Loading cart…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Your cart is empty"
            description="Browse the market and add the inputs you need."
            action={<Link to="/dashboard/farmer/market" className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">Browse products</Link>}
          />
        ) : (
          <>
            <Table head={['Product', 'Price', 'Quantity', 'Subtotal', '']}>
              {items.map((item) => {
                const p = item.product || {};
                const busy = busyId === item.product_id;
                return (
                  <tr key={item.id || item.product_id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5" />}
                        </div>
                        <Link to={`/dashboard/farmer/product?id=${item.product_id}`} className="font-medium text-slate-900 hover:underline">{p.name || 'Product'}</Link>
                      </div>
                    </Td>
                    <Td>{rwf(p.price)}</Td>
                    <Td>
                      <div className="inline-flex items-center rounded-lg ring-1 ring-inset ring-slate-300">
                        <button type="button" className="p-1.5 text-slate-600 disabled:opacity-40" aria-label={`Decrease quantity of ${p.name}`} disabled={busy || item.quantity <= 1} onClick={() => changeQty(item, item.quantity - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button type="button" className="p-1.5 text-slate-600 disabled:opacity-40" aria-label={`Increase quantity of ${p.name}`} disabled={busy} onClick={() => changeQty(item, item.quantity + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Td>
                    <Td className="font-medium text-slate-900">{rwf(item.quantity * (p.price || 0))}</Td>
                    <Td>
                      <button type="button" onClick={() => remove(item)} disabled={busy} aria-label={`Remove ${p.name}`} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </Table>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" icon={Trash2} onClick={empty}>Clear cart</Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-lg font-semibold text-slate-900">Total: {rwf(total)}</p>
                <Button icon={ShoppingCart} onClick={() => { setFormError(''); setShowCheckout(true); }}>Checkout</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog
        open={showCheckout}
        title="Checkout"
        subtitle={`${cart?.item_count || 0} item(s) · ${rwf(total)}`}
        onClose={() => !checkingOut && setShowCheckout(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCheckout(false)} disabled={checkingOut}>Cancel</Button>
            <Button onClick={submitCheckout} loading={checkingOut}>Place order</Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{formError}</p>}
          <Field label="Delivery address" required>
            <textarea className={textareaClass} value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} placeholder="Village, cell, sector, district" />
          </Field>
          <Field label="Payment method" required>
            <select className={inputClass} value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Notes for the shop">
            <textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" maxLength={500} />
          </Field>
        </div>
      </Dialog>
    </Page>
  );
}
