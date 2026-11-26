/* eslint-disable react-refresh/only-export-components */
/**
 * Shared helpers for the shop-manager pages: resolving the manager's own shop,
 * paging through shop-scoped lists, formatting and status badges.
 */
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { getAllShops, getShopInventory, getShopOrders } from '../../services/shopService';
import { Badge, Card, EmptyState, ErrorState, Spinner } from '../../components/Ui/kit';

export const rwf = (n) => `${Math.round(Number(n) || 0).toLocaleString()} RWF`;
export const num = (n) => Number(n || 0).toLocaleString();
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const humanize = (s) => (s ? String(s).replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');
export const errMsg = (e, fallback = 'Something went wrong') => e?.response?.data?.message || e?.message || fallback;

export const PRODUCT_CATEGORIES = ['seeds', 'fertilizers', 'pest_management', 'tools', 'irrigation', 'harvesting', 'containers', 'protection', 'produce'];
export const PRODUCT_UNITS = ['kg', 'g', 'ton', 'liter', 'ml', 'piece', 'dozen', 'box', 'bag', 'bottle', 'can', 'packet'];
/** API returns pest management as either `pest_management` (inventory) or `pest-management` (products). */
export const normCategory = (c) => (c === 'pest-management' ? 'pest_management' : c);

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
export const OPEN_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const PAYMENT_METHODS = ['cash', 'mobile_money', 'bank_transfer', 'credit_card', 'debit_card', 'check'];

const ORDER_TONE = { pending: 'amber', confirmed: 'blue', processing: 'blue', shipped: 'blue', delivered: 'brand', cancelled: 'rose', returned: 'rose' };
const PAYMENT_TONE = { pending: 'amber', paid: 'brand', failed: 'rose', refunded: 'slate' };
export const OrderStatusBadge = ({ status }) => <Badge tone={ORDER_TONE[status] || 'slate'}>{humanize(status)}</Badge>;
export const PaymentBadge = ({ status }) => <Badge tone={PAYMENT_TONE[status] || 'slate'}>{humanize(status)}</Badge>;

/** Low-stock rule shared by every page: at or under the product's own minimum (default 10), but not empty. */
export const minStockOf = (p) => (p?.min_stock ?? 10);
export const isActiveProduct = (p) => p?.status !== 'discontinued';
export const isOutOfStock = (p) => isActiveProduct(p) && Number(p?.quantity || 0) <= 0;
export const isLowStock = (p) => isActiveProduct(p) && Number(p?.quantity || 0) > 0 && Number(p.quantity) <= minStockOf(p);

export const StockBadge = ({ product }) => {
  if (!isActiveProduct(product)) return <Badge tone="slate">Discontinued</Badge>;
  if (isOutOfStock(product)) return <Badge tone="rose">Out of stock</Badge>;
  if (isLowStock(product)) return <Badge tone="amber">Low stock</Badge>;
  return <Badge tone="brand">In stock</Badge>;
};

/** First image URL of a product, or null. Upload URLs are absolute (…/api/files/public/…). */
export const productImage = (p) => (Array.isArray(p?.images) && p.images.find(Boolean)) || null;

/** Shop-share of an order: sum of line totals for items that belong to this shop. */
export const shopItems = (order, productIds) =>
  (order?.items || []).filter((it) => !productIds || productIds.has(it.product_id));
export const shopOrderTotal = (order, productIds) => shopItems(order, productIds).reduce((s, it) => s + Number(it.total_price || 0), 0);

/** Walk every page of a paginated shopService list (limit 100) and return all rows. */
async function fetchAllPages(fetchPage, maxPages = 20) {
  const rows = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const res = await fetchPage({ page, limit: 100 });
    const data = Array.isArray(res?.data) ? res.data : [];
    rows.push(...data);
    if (!res?.meta?.pagination?.hasNext) break;
  }
  return rows;
}
export const fetchAllShopProducts = (shopNumber) => fetchAllPages((p) => getShopInventory(shopNumber, p));
export const fetchAllShopOrders = (shopNumber) => fetchAllPages((p) => getShopOrders(shopNumber, p));

/**
 * Resolves the shop managed by the logged-in shop manager.
 * Returns { shop, loading, error, reload }. shop is null when no shop is linked.
 */
export function useMyShop() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllShops();
      setShop(Array.isArray(res?.data) && res.data.length ? res.data[0] : null);
    } catch (e) {
      setError(errMsg(e, 'Could not load your shop'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { shop, setShop, loading, error, reload };
}

/** Renders loading / error / "no shop" states; returns null when the shop is ready. */
export const ShopGate = ({ state, bare = false }) => {
  const Wrap = bare ? Fragment : Card;
  if (state.loading) return <Wrap><Spinner label="Loading your shop…" /></Wrap>;
  if (state.error) return <Wrap><ErrorState message={state.error} onRetry={state.reload} /></Wrap>;
  if (!state.shop)
    return (
      <Wrap>
        <EmptyState
          icon={Store}
          title="No shop linked to your account"
          description="Your account is not set as the manager of any shop yet. Ask an administrator to assign you to a shop."
        />
      </Wrap>
    );
  return null;
};
