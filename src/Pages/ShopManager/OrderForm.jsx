import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createOrder, updateOrder, updateOrderStatus } from '../../services/orderService';
import { useToast } from '../../components/Ui/Toast';
import { Button, Dialog, Field, inputClass } from '../../components/Ui/kit';
import { rwf, humanize, errMsg, PAYMENT_METHODS } from './shopCommon';

const VAT = 0.18; // backend adds 18% VAT to every order
const emptyLine = () => ({ product_id: '', quantity: '1' });

/**
 * Create an order for one of the shop's customers.
 * mode="sale": counter sale — order is marked paid and delivered straight away.
 * mode="order": delivery order — stays pending for normal processing.
 */
export default function OrderForm({ mode = 'order', shop, products, customers, onClose, onDone }) {
  const toast = useToast();
  const isSale = mode === 'sale';
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState({ street_address: '', city: shop?.district || '', province: shop?.province || '' });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const sellable = useMemo(() => products.filter((p) => p.status === 'available' && Number(p.quantity) > 0), [products]);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const customer = customers.find((c) => c.id === customerId);
  const subtotal = lines.reduce((s, l) => s + Number(byId.get(l.product_id)?.price || 0) * Number(l.quantity || 0), 0);

  const setLine = (i, k, v) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));

  const submit = async (e) => {
    e.preventDefault();
    if (!customer) return toast.error('Choose a customer');
    const chosen = lines.filter((l) => l.product_id);
    if (!chosen.length) return toast.error('Add at least one product');
    const ids = new Set();
    for (const l of chosen) {
      const p = byId.get(l.product_id);
      const q = Number(l.quantity);
      if (ids.has(l.product_id)) return toast.error(`${p?.name} is listed twice — combine the quantities`);
      ids.add(l.product_id);
      if (!Number.isInteger(q) || q < 1) return toast.error(`Enter a whole quantity for ${p?.name}`);
      if (q > Number(p?.quantity || 0)) return toast.error(`Only ${p?.quantity} ${p?.unit} of ${p?.name} in stock`);
    }
    if (!isSale && (!address.street_address.trim() || !address.city.trim() || !address.province.trim()))
      return toast.error('Enter the delivery street, city and province');

    const shipping_address = {
      full_name: customer.name,
      phone: customer.phone,
      street_address: isSale ? `Counter sale at ${shop?.shopName || 'shop'}` : address.street_address.trim(),
      city: isSale ? shop?.district || 'N/A' : address.city.trim(),
      province: isSale ? shop?.province || 'N/A' : address.province.trim(),
      country: 'Rwanda',
    };
    setSaving(true);
    try {
      const order = await createOrder({
        customer_id: customer.id,
        items: chosen.map((l) => ({ product_id: l.product_id, quantity: Number(l.quantity) })),
        shipping_address,
        payment_method: paymentMethod,
        notes: notes.trim() || (isSale ? 'Counter sale' : undefined),
      });
      if (isSale && order?.id) {
        await updateOrder(order.id, { payment_status: 'paid' });
        await updateOrderStatus(order.id, 'delivered');
      }
      toast.success(isSale ? `Sale ${order?.order_number || ''} recorded` : `Order ${order?.order_number || ''} created`);
      onDone?.(order);
    } catch (err) {
      toast.error(errMsg(err, isSale ? 'Could not record the sale' : 'Could not create the order'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={isSale ? 'Record a sale' : 'New order'}
      subtitle={isSale ? 'Counter sale: stock is deducted and the sale is marked paid and delivered.' : 'Creates a pending delivery order.'}
      onClose={() => !saving && onClose()}
      size="lg"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" form="order-form" loading={saving}>{isSale ? 'Record sale' : 'Create order'}</Button>
      </>}
    >
      <form id="order-form" onSubmit={submit} className="space-y-4">
        <Field label="Customer" required hint={customers.length ? undefined : 'Add a customer on the Customers page first.'}>
          <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.filter((c) => c.status !== 'inactive').map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </select>
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Products <span className="text-rose-600">*</span></p>
          {sellable.length === 0 && <p className="text-sm text-slate-500">No products in stock to sell.</p>}
          {lines.map((l, i) => {
            const p = byId.get(l.product_id);
            return (
              <div key={i} className="grid grid-cols-[1fr_5.5rem_auto] items-center gap-2">
                <select aria-label={`Product ${i + 1}`} className={inputClass} value={l.product_id} onChange={(e) => setLine(i, 'product_id', e.target.value)}>
                  <option value="">Choose product…</option>
                  {sellable.map((sp) => <option key={sp.id} value={sp.id}>{sp.name} — {rwf(sp.price)} ({sp.quantity} {sp.unit} left)</option>)}
                </select>
                <input aria-label={`Quantity ${i + 1}`} type="number" min="1" step="1" max={p?.quantity} className={inputClass} value={l.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} />
                <Button variant="ghost" size="sm" aria-label={`Remove line ${i + 1}`} disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setLines((ls) => [...ls, emptyLine()])}>Add line</Button>
        </div>

        {!isSale && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Street / village" required className="sm:col-span-3"><input className={inputClass} value={address.street_address} onChange={(e) => setAddress((a) => ({ ...a, street_address: e.target.value }))} /></Field>
            <Field label="City / district" required><input className={inputClass} value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} /></Field>
            <Field label="Province" required className="sm:col-span-2"><input className={inputClass} value={address.province} onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))} /></Field>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Payment method">
            <select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{humanize(m)}</option>)}
            </select>
          </Field>
          <Field label="Notes"><input className={inputClass} value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} /></Field>
        </div>

        <dl className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{rwf(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">VAT (18%)</dt><dd>{rwf(subtotal * VAT)}</dd></div>
          <div className="flex justify-between font-semibold text-slate-900"><dt>Total</dt><dd>{rwf(subtotal * (1 + VAT))}</dd></div>
        </dl>
      </form>
    </Dialog>
  );
}
