import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { getProductById } from '../../services/productsService';
import { addCartItem } from '../../services/cartService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Badge, Button, EmptyState, ErrorState, Spinner } from '../../components/Ui/kit';
import { rwf, errMsg, categoryLabel, SHOP_CATEGORIES } from './farmerShared';

/** Product detail: /dashboard/farmer/product?id=<productId> */
export default function Product() {
  const toast = useToast();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setProduct(await getProductById(id));
      setActiveImage(0);
    } catch (e) {
      setError(errMsg(e, 'Failed to load product'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const stock = Number(product?.quantity) || 0;
  const inStock = product?.status === 'available' && stock > 0;
  const backPath = SHOP_CATEGORIES.find((c) => c.id === product?.category)?.path || '/dashboard/farmer/market';

  const addToCart = async () => {
    if (!Number.isInteger(qty) || qty < 1 || qty > stock) {
      toast.error(`Choose a quantity between 1 and ${stock}`);
      return;
    }
    setAdding(true);
    try {
      await addCartItem(product.id, qty);
      toast.success(`${qty} × ${product.name} added to your cart`);
    } catch (e) {
      toast.error(errMsg(e, 'Could not add to cart'));
    } finally {
      setAdding(false);
    }
  };

  const back = (
    <Link to={backPath} className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
      <ArrowLeft className="h-4 w-4" /> Back to market
    </Link>
  );

  if (!id) {
    return (
      <Page>
        <PageHeader icon={Package} title="Product" actions={back} />
        <Card><EmptyState icon={Package} title="No product selected" description="Pick a product in the market to see its details." /></Card>
      </Page>
    );
  }

  const images = product?.images?.filter(Boolean) || [];
  const specs = product?.specifications && typeof product.specifications === 'object' ? Object.entries(product.specifications) : [];

  return (
    <Page>
      <PageHeader icon={Package} title={product?.name || 'Product'} subtitle={product ? categoryLabel(product.category) : undefined} actions={back} />
      {loading ? (
        <Card><Spinner label="Loading product…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : !product ? (
        <Card><EmptyState icon={Package} title="Product not found" /></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400"><Package className="h-16 w-16" /></div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 ${i === activeImage ? 'ring-brand-500' : 'ring-transparent'}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{categoryLabel(product.category)}</Badge>
                {inStock ? <Badge tone="brand">{stock} in stock</Badge> : <Badge tone="rose">Out of stock</Badge>}
                {product.brand && <Badge tone="blue">{product.brand}</Badge>}
              </div>
              <p className="text-2xl font-semibold text-slate-900">
                {rwf(product.price)} <span className="text-base font-normal text-slate-500">/ {product.unit || 'unit'}</span>
              </p>
              {product.description && <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>}
              {(specs.length > 0 || product.sku || product.variety) && (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  {product.sku && (<div><dt className="text-slate-500">SKU</dt><dd className="font-medium text-slate-900">{product.sku}</dd></div>)}
                  {product.variety && (<div><dt className="text-slate-500">Variety</dt><dd className="font-medium text-slate-900">{product.variety}</dd></div>)}
                  {specs.map(([k, v]) => (
                    <div key={k}><dt className="capitalize text-slate-500">{k.replace(/_/g, ' ')}</dt><dd className="font-medium text-slate-900">{String(v)}</dd></div>
                  ))}
                </dl>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-lg ring-1 ring-inset ring-slate-300">
                  <button type="button" aria-label="Decrease quantity" className="p-2 text-slate-600 disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={stock || 1}
                    aria-label="Quantity"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-14 border-0 text-center text-sm focus:outline-none"
                  />
                  <button type="button" aria-label="Increase quantity" className="p-2 text-slate-600 disabled:opacity-40" disabled={qty >= stock} onClick={() => setQty((q) => Math.min(stock, q + 1))}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button icon={ShoppingCart} onClick={addToCart} loading={adding} disabled={!inStock}>Add to cart</Button>
                <Link to="/dashboard/farmer/cart" className="text-sm font-medium text-brand-700 hover:underline">Go to cart</Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}
