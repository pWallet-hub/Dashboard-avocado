import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Package, Search, Eye, Plus } from 'lucide-react';
import { getAllProducts } from '../../services/productsService';
import { addCartItem, getCart } from '../../services/cartService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Badge, Button, inputClass, EmptyState, ErrorState, Spinner, Pagination, Tabs } from '../../components/Ui/kit';
import { rwf, errMsg, SHOP_CATEGORIES, categoryLabel } from './farmerShared';

const PAGE_SIZE = 12;

const ProductCard = ({ product, onAdd, adding }) => {
  const image = product.images?.[0];
  const inStock = product.status === 'available' && Number(product.quantity) > 0;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link to={`/dashboard/farmer/product?id=${product.id}`} className="block aspect-[4/3] bg-slate-100" aria-label={`View ${product.name}`}>
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Package className="h-10 w-10" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{categoryLabel(product.category)}</Badge>
          {inStock ? <Badge tone="brand">{product.quantity} in stock</Badge> : <Badge tone="rose">Out of stock</Badge>}
        </div>
        <h3 className="font-semibold text-slate-900">{product.name}</h3>
        {product.description && <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>}
        <p className="mt-auto text-lg font-semibold text-slate-900">
          {rwf(product.price)} <span className="text-sm font-normal text-slate-500">/ {product.unit || 'unit'}</span>
        </p>
        <div className="flex gap-2">
          <Button size="sm" icon={Plus} onClick={() => onAdd(product)} loading={adding} disabled={!inStock} className="flex-1">
            Add to cart
          </Button>
          <Link
            to={`/dashboard/farmer/product?id=${product.id}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" /> Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Market({ category: initialCategory = '' }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // The category routes can reuse this instance, so follow the prop.
  useEffect(() => {
    setCategory(initialCategory);
    setPage(1);
  }, [initialCategory]);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts({ page, limit: PAGE_SIZE, category: category || undefined, search: query || undefined, status: 'available' });
      setProducts(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.pagination || { totalPages: 1, total: 0 });
    } catch (e) {
      setError(errMsg(e, 'Failed to load products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, query]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCart()
      .then((c) => setCartCount(c?.item_count || 0))
      .catch(() => setCartCount(0));
  }, []);

  const changeCategory = (id) => {
    const target = SHOP_CATEGORIES.find((c) => c.id === id);
    // Keep the URL in sync for categories that have their own route.
    if (target?.path) navigate(target.path);
    setCategory(id);
    setPage(1);
  };

  const handleAdd = async (product) => {
    setAddingId(product.id);
    try {
      const res = await addCartItem(product.id, 1);
      setCartCount(res?.item_count ?? cartCount + 1);
      toast.success(`${product.name} added to your cart`);
    } catch (e) {
      toast.error(errMsg(e, 'Could not add to cart'));
    } finally {
      setAddingId(null);
    }
  };

  const title = category ? categoryLabel(category) : 'Farm Market';

  return (
    <Page>
      <PageHeader
        icon={ShoppingBag}
        title={title}
        subtitle="Buy farm inputs and equipment from registered shops. Add items to your cart and check out in one order."
        actions={
          <Link
            to="/dashboard/farmer/cart"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            <ShoppingCart className="h-4 w-4" /> My cart
            {cartCount > 0 && <span className="rounded-full bg-white/20 px-2 text-xs">{cartCount}</span>}
          </Link>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={SHOP_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))} value={category} onChange={changeCategory} />
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search products"
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Card><Spinner label="Loading products…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No products found"
            description={query ? `Nothing matches “${query}”.` : 'There are no products in this category right now. Check back soon.'}
            action={category || query ? <Button variant="secondary" onClick={() => { setSearch(''); changeCategory(''); }}>Show all products</Button> : null}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} adding={addingId === p.id} />
            ))}
          </div>
          {(pagination.totalPages || 1) > 1 && (
            <Card padded={false}>
              <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
            </Card>
          )}
        </>
      )}
    </Page>
  );
}
