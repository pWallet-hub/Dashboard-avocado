import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { getCart, updateCartItem, removeCartItem, clearCart, checkout } from '../../services/cartService';
import { getProductById } from '../../services/productsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const Cart = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notes, setNotes] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const cart = await getCart();
      const rawItems = Array.isArray(cart?.items) ? cart.items : [];

      // Cart items only carry product_id/unit_price — enrich with product details for display
      const enriched = await Promise.all(
        rawItems.map(async (item) => {
          try {
            const product = await getProductById(item.product_id);
            return {
              ...item,
              product_name: product?.name || item.product_id,
              product_image: product?.images?.[0] || product?.image || null,
            };
          } catch (err) {
            console.error('Error loading product for cart item:', err);
            return { ...item, product_name: item.product_id, product_image: null };
          }
        })
      );

      setItems(enriched);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setUpdatingId(productId);
    try {
      await updateCartItem(productId, quantity);
      await loadCart();
    } catch (err) {
      console.error('Error updating cart item:', err);
      toast.error(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    const ok = await confirm(`Remove "${item.product_name}" from your cart?`, {
      title: 'Remove Item',
      confirmLabel: 'Remove',
    });
    if (!ok) return;

    setUpdatingId(item.product_id);
    try {
      await removeCartItem(item.product_id);
      toast.success('Item removed from cart');
      await loadCart();
    } catch (err) {
      console.error('Error removing cart item:', err);
      toast.error(err.message || 'Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    const ok = await confirm('Clear all items from your cart?', {
      title: 'Clear Cart',
      confirmLabel: 'Clear',
    });
    if (!ok) return;

    try {
      await clearCart();
      toast.success('Cart cleared');
      await loadCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error(err.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const order = await checkout(notes);
      setCompletedOrder(order);
      toast.success('Checkout successful! Your order has been placed.');
      setItems([]);
      setNotes('');
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error(err.message || 'Failed to checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <ShoppingCart className="h-7 w-7 mr-3 text-green-600" />
              My Cart
            </h2>
            <p className="text-green-600 mt-1">Review your items before checking out</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <Link
            to="/dashboard/farmer/market"
            className="flex items-center px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Market
          </Link>
        </div>
      </div>

      {/* Checkout success banner */}
      {completedOrder && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-6 flex items-start gap-4">
          <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">Order placed successfully!</h3>
            <p className="text-sm text-green-700 mt-1">
              Order Number: <span className="font-mono font-semibold">{completedOrder.order_number || completedOrder.id}</span>
            </p>
            {completedOrder.total_amount !== undefined && (
              <p className="text-sm text-green-700">
                Total: <span className="font-semibold">{Number(completedOrder.total_amount).toLocaleString()} RWF</span>
              </p>
            )}
            <button
              onClick={() => setCompletedOrder(null)}
              className="mt-3 text-sm underline text-green-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Cart Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">Your cart is empty</p>
            <Link
              to="/dashboard/farmer/market"
              className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {items.map((item) => (
                    <tr key={item.id || item.product_id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg" />
                          )}
                          <span className="text-sm font-medium text-green-900">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                        {Number(item.unit_price || 0).toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={updatingId === item.product_id || item.quantity <= 1}
                            className="p-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={updatingId === item.product_id}
                            className="p-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">
                        {(Number(item.unit_price || 0) * Number(item.quantity || 0)).toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={updatingId === item.product_id}
                          className="text-red-600 hover:text-red-800 transform hover:scale-110 transition disabled:opacity-50"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-green-50 px-6 py-4 border-t border-green-100 space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear Cart
                </button>
                <div className="text-lg font-bold text-green-800">
                  Total: {total.toLocaleString()} RWF
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Order Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Add any notes for this order..."
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut || items.length === 0}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-[1.01] shadow-lg disabled:opacity-50"
              >
                {checkingOut ? 'Processing Checkout...' : 'Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
