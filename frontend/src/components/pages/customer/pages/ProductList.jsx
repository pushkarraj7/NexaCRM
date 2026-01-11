import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../../../../config/api";


// Main Product List Component
const CustomerProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState(null);

  // Get customer ID from localStorage
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    // Check if customerId exists, if not redirect to login
    if (!customerId) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    fetchCustomerProducts();
  }, [customerId, navigate]);

  const fetchCustomerProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.CUSTOMER_ITEMS}/customer/${customerId}/items`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error("Error fetching customer products:", error);
      setError('Unable to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart({ ...cart, [productId]: quantity });
    }
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const product = products.find(p => p._id === productId);
      return sum + (product?.finalPrice || 0) * qty;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (Object.keys(cart).length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderItems = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p._id === productId);
      return {
        itemId: productId,
        quantity,
        price: product.finalPrice,
        discount: product.discount
      };
    });

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customerId,
          items: orderItems,
          totalAmount: getTotalPrice()
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Order placed successfully!');
        setCart({});
        setShowCart(false);
        navigate("/customer/orders");
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your approved products...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Approved Products</h2>
                <p className="text-gray-500 mt-1">Items available as per your agreement</p>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-gradient-to-r from-gray-800 to-black text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-medium">Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">{error}</p>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Available</h3>
                <p className="text-gray-500">No items found in your agreement. Please contact your administrator.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image */}
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <span className="text-xs text-gray-500">{product.itemCode}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{product.category}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{product.unit}</span>
                        {product.tax && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{product.tax}% Tax</span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">₹{product.finalPrice.toFixed(2)}</span>
                          {product.discount > 0 && (
                            <>
                              <span className="text-sm text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                {product.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">per {product.unit}</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(product._id, (cart[product._id] || 0) - 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!cart[product._id]}
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                            {cart[product._id] || 0}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, (cart[product._id] || 0) + 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => updateQuantity(product._id, (cart[product._id] || 0) + 1)}
                          className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>

          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Shopping Cart</h3>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find(p => p._id === productId);
                    if (!product) return null;

                    return (
                      <div key={productId} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">₹{product.finalPrice.toFixed(2)} each</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(productId, quantity - 1)}
                                className="px-2 py-1 hover:bg-gray-200 transition-colors"
                              >
                                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-3 py-1 text-sm font-medium text-gray-900">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(productId, quantity + 1)}
                                className="px-2 py-1 hover:bg-gray-200 transition-colors"
                              >
                                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>

                            <span className="font-semibold text-gray-900">
                              ₹{(product.finalPrice * quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {Object.keys(cart).length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Items ({getTotalItems()})</span>
                    <span className="text-gray-900">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t">
                    <span className="text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-gray-900">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProductList;