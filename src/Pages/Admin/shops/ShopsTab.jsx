import { useCallback, useEffect, useMemo, useState } from 'react';
import { Store, Plus, Search, Download, Eye, Pencil, Trash2, Wallet, Ban } from 'lucide-react';
import AddShopForm from '../../../components/AddShopForm/AddShopForm';
import { getAllShops, deleteShop, exportShopsToExcel } from '../../../services/shopService';
import { RWANDA_PROVINCES } from '../../../utils/rwanda';
import { useToast } from '../../../components/Ui/Toast';
import { useConfirm } from '../../../components/Ui/ConfirmDialog';
import { Card, StatGrid, StatCard, Badge, Button, inputClass, EmptyState, ErrorState, Spinner, Table, Td, Pagination } from '../../../components/Ui/kit';
import ShopDetailDialog from './ShopDetailDialog';
import { errMsg, rwf } from './utils';

const PAGE_SIZE = 15;

export default function ShopsTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [selling, setSelling] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // { shop? }
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllShops();
      setShops(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setError(errMsg(e, 'Failed to load shops'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, province, selling]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shops.filter((s) => (
      (!q || [s.shopName, s.ownerName, s.ownerEmail, s.district].some((v) => v?.toLowerCase().includes(q)))
      && (!province || s.province === province)
      && (!selling || String(Boolean(s.can_sell)) === selling)
    ));
  }, [shops, search, province, selling]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const provinces = [...new Set([...RWANDA_PROVINCES, ...shops.map((s) => s.province).filter(Boolean)])];

  const remove = async (shop) => {
    const ok = await confirm(`Delete ${shop.shopName}? This cannot be undone.`, { confirmLabel: 'Delete shop' });
    if (!ok) return;
    try {
      await deleteShop(shop.shop_number);
      toast.success('Shop deleted');
      setDetail(null);
      load();
    } catch (e) {
      toast.error(errMsg(e, 'Failed to delete shop. It may still have customers linked to it.'));
    }
  };

  const exportCsv = () => {
    if (!filtered.length) { toast.info('Nothing to export'); return; }
    exportShopsToExcel(filtered.map((s) => ({ ...s, createdAt: s.created_at })));
  };

  return (
    <>
      <StatGrid>
        <StatCard label="Shops" value={loading ? '—' : shops.length} icon={Store} />
        <StatCard label="Allowed to sell" value={loading ? '—' : shops.filter((s) => s.can_sell).length} icon={Store} tone="blue" />
        <StatCard label="Blocked from selling" value={loading ? '—' : shops.filter((s) => !s.can_sell).length} icon={Ban} tone="rose" />
        <StatCard label="Total wallet balance" value={loading ? '—' : rwf(shops.reduce((t, s) => t + (s.balance || 0), 0))} icon={Wallet} tone="amber" />
      </StatGrid>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search shop, owner or district" aria-label="Search shops" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-96">
            <select className={inputClass} aria-label="Province" value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">All provinces</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className={inputClass} aria-label="Selling permission" value={selling} onChange={(e) => setSelling(e.target.value)}>
              <option value="">Any permission</option>
              <option value="true">Can sell</option>
              <option value="false">Blocked</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Download} onClick={exportCsv}>Export</Button>
            <Button icon={Plus} onClick={() => setForm({})}>Add shop</Button>
          </div>
        </div>

        {loading ? <Spinner label="Loading shops…" /> : error ? <ErrorState message={error} onRetry={load} /> : visible.length === 0 ? (
          <EmptyState
            icon={Store}
            title={shops.length ? 'No shops match these filters' : 'No shops yet'}
            action={shops.length ? null : <Button icon={Plus} onClick={() => setForm({})}>Add shop</Button>}
          />
        ) : (
          <>
            <Table head={['#', 'Shop', 'Owner', 'Location', 'Balance', 'Selling', '']}>
              {visible.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <Td className="text-slate-500">{s.shop_number}</Td>
                  <Td>
                    <div className="font-medium text-slate-900">{s.shopName}</div>
                    <div className="max-w-xs truncate text-xs text-slate-500">{s.description}</div>
                  </Td>
                  <Td>
                    <div>{s.ownerName}</div>
                    <div className="text-xs text-slate-500">{s.ownerPhone}</div>
                  </Td>
                  <Td>{[s.district, s.province].filter(Boolean).join(', ')}</Td>
                  <Td>{rwf(s.balance)}</Td>
                  <Td><Badge tone={s.can_sell ? 'brand' : 'rose'}>{s.can_sell ? 'Can sell' : 'Blocked'}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} aria-label={`Open ${s.shopName}`} onClick={() => setDetail(s)} />
                      <Button size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${s.shopName}`} onClick={() => setForm({ shop: s })} />
                      <Button size="sm" variant="ghost" icon={Trash2} className="text-rose-600 hover:bg-rose-50" aria-label={`Delete ${s.shopName}`} onClick={() => remove(s)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={setPage} />
          </>
        )}
      </Card>

      {form && (
        <AddShopForm
          shop={form.shop}
          onClose={() => setForm(null)}
          onSuccess={() => { setForm(null); setDetail(null); load(); }}
        />
      )}
      {detail && !form && (
        <ShopDetailDialog
          key={detail.id}
          shop={detail}
          onClose={() => setDetail(null)}
          onChanged={load}
          onEdit={(s) => setForm({ shop: s })}
          onDelete={remove}
        />
      )}
    </>
  );
}
