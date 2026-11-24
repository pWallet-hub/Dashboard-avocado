import { useCallback, useEffect, useState } from 'react';
import { Wallet, Pencil, Trash2 } from 'lucide-react';
import { getShopWallet, getShopAnalytics, topUpShopWallet, updateShopSellingPermission } from '../../../services/shopService';
import { useToast } from '../../../components/Ui/Toast';
import { useConfirm } from '../../../components/Ui/ConfirmDialog';
import { Dialog, Badge, Button, Field, inputClass, Spinner, Table, Td, EmptyState, ErrorState } from '../../../components/Ui/kit';
import { errMsg, rwf, fmtDate, PAYMENT_METHODS } from './utils';

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900">{value === null || value === undefined || value === '' ? '—' : value}</dd>
  </div>
);

/** Shop details: profile, selling permission, sales analytics, wallet + top-up. */
export default function ShopDetailDialog({ shop, onClose, onChanged, onEdit, onDelete }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [canSell, setCanSell] = useState(shop.can_sell);
  const [balance, setBalance] = useState(shop.balance ?? 0);
  const [wallet, setWallet] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topup, setTopup] = useState({ amount: '', payment_method: 'cash', description: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, a] = await Promise.all([getShopWallet(shop.shop_number, { limit: 10 }), getShopAnalytics(shop.shop_number)]);
      setWallet(Array.isArray(w?.data) ? w.data : []);
      if (typeof w?.meta?.balance === 'number') setBalance(w.meta.balance);
      setAnalytics(a?.data || null);
    } catch (e) {
      setError(errMsg(e, 'Failed to load shop details'));
    } finally {
      setLoading(false);
    }
  }, [shop.shop_number]);

  useEffect(() => { load(); }, [load]);

  const toggleSelling = async () => {
    const next = !canSell;
    const ok = await confirm(`${next ? 'Allow' : 'Stop'} ${shop.shopName} ${next ? 'to sell' : 'from selling'} products?`, {
      confirmLabel: next ? 'Allow selling' : 'Stop selling', danger: !next,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await updateShopSellingPermission(shop.shop_number, next);
      setCanSell(next);
      toast.success(`Selling ${next ? 'enabled' : 'disabled'}`);
      onChanged?.();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to change selling permission'));
    } finally {
      setBusy(false);
    }
  };

  const submitTopup = async (e) => {
    e.preventDefault();
    const amount = Number(topup.amount);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Enter an amount greater than 0'); return; }
    const ok = await confirm(`Add ${rwf(amount)} to ${shop.shopName}'s wallet?`, { confirmLabel: 'Top up', danger: false });
    if (!ok) return;
    setBusy(true);
    try {
      const payload = { amount, payment_method: topup.payment_method };
      if (topup.description.trim()) payload.description = topup.description.trim();
      await topUpShopWallet(shop.shop_number, payload);
      toast.success('Wallet topped up');
      setTopup({ amount: '', payment_method: 'cash', description: '' });
      onChanged?.();
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Top-up failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      title={shop.shopName}
      subtitle={`Shop #${shop.shop_number} · ${[shop.district, shop.province].filter(Boolean).join(', ')}`}
      size="xl"
      onClose={onClose}
      footer={(
        <>
          <Button variant="danger" icon={Trash2} onClick={() => onDelete(shop)}>Delete</Button>
          <Button variant="secondary" icon={Pencil} onClick={() => onEdit(shop)}>Edit</Button>
        </>
      )}
    >
      <div className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Owner" value={shop.ownerName} />
          <Detail label="Owner phone" value={shop.ownerPhone} />
          <Detail label="Owner email" value={shop.ownerEmail} />
          <Detail label="Manager account" value={shop.manager_id ? 'Linked' : 'None'} />
          <Detail label="Created" value={fmtDate(shop.created_at)} />
          <Detail label="Created by" value={shop.creator?.full_name} />
          <div className="sm:col-span-3"><Detail label="Description" value={shop.description} /></div>
        </dl>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Selling permission</p>
            <p className="text-sm text-slate-500">When off, the shop can&apos;t sell products to growers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={canSell ? 'brand' : 'rose'}>{canSell ? 'Can sell' : 'Blocked'}</Badge>
            <Button variant="secondary" size="sm" disabled={busy} onClick={toggleSelling}>{canSell ? 'Stop selling' : 'Allow selling'}</Button>
          </div>
        </div>

        {loading ? <Spinner label="Loading wallet and sales…" /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Wallet balance', rwf(balance)],
                ['Revenue', rwf(analytics?.totalRevenue)],
                ['Orders', analytics?.totalOrders ?? 0],
                ['Products', `${analytics?.totalProducts ?? 0}${analytics?.outOfStockProducts ? ` (${analytics.outOfStockProducts} out)` : ''}`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{l}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{v}</p>
                </div>
              ))}
            </div>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Wallet className="h-4 w-4" />Top up wallet</h3>
              {shop.manager_id ? (
                <form onSubmit={submitTopup} className="grid gap-3 sm:grid-cols-[140px_170px_1fr_auto] sm:items-end">
                  <Field label="Amount (RWF)" required>
                    <input className={inputClass} type="number" min="1" step="1" value={topup.amount} onChange={(e) => setTopup((t) => ({ ...t, amount: e.target.value }))} />
                  </Field>
                  <Field label="Method">
                    <select className={inputClass} value={topup.payment_method} onChange={(e) => setTopup((t) => ({ ...t, payment_method: e.target.value }))}>
                      {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Note">
                    <input className={inputClass} placeholder="Optional" value={topup.description} onChange={(e) => setTopup((t) => ({ ...t, description: e.target.value }))} />
                  </Field>
                  <Button type="submit" loading={busy}>Top up</Button>
                </form>
              ) : (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Top-ups are credited to the shop&apos;s manager account, and this shop has none linked yet. A manager is linked when they register their own shop.
                </p>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Wallet history</h3>
              {wallet?.length ? (
                <div className="rounded-xl border border-slate-200">
                  <Table head={['Date', 'Reference', 'Method', 'Amount', 'Status']}>
                    {wallet.map((t) => (
                      <tr key={t.id}>
                        <Td>{fmtDate(t.created_at, true)}</Td>
                        <Td className="font-mono text-xs">{t.transaction_number}</Td>
                        <Td>{t.payment_method?.replace('_', ' ')}</Td>
                        <Td className="font-medium text-slate-900">{rwf(t.amount)}</Td>
                        <Td><Badge tone={t.status === 'completed' ? 'brand' : 'amber'}>{t.status}</Badge></Td>
                      </tr>
                    ))}
                  </Table>
                </div>
              ) : <EmptyState icon={Wallet} title="No wallet activity yet" />}
            </section>
          </>
        )}
      </div>
    </Dialog>
  );
}
