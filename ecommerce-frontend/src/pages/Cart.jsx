import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL;

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch cart data on page load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cart/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const items = response.data?.data?.cart?.items || [];
        // Filter out any invalid items and ensure we have valid data
        const validItems = items.filter(item => 
          item && 
          item.product && 
          typeof item.product === 'object' &&
          item.quantity > 0
        );
        setCart(validItems);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to load cart';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // Update item quantity in cart
  const updateCartItem = async (productId, quantity, size) => {
    try {
      const response = await axios.patch(`${API_URL}/api/cart/items`, 
        { productId, quantity, size }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const items = response.data?.data?.cart?.items || [];
      const validItems = items.filter(item => 
        item && 
        item.product && 
        typeof item.product === 'object' &&
        item.quantity > 0
      );
      setCart(validItems);
      toast.success('Cart updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update cart item';
      toast.error(errorMessage);
    }
  };

  // Remove item from cart
  const removeCartItem = async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/cart/items/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const items = response.data?.cart?.items || [];
      const validItems = items.filter(item => 
        item && 
        item.product && 
        typeof item.product === 'object' &&
        item.quantity > 0
      );
      setCart(validItems);
      toast.success('Item removed from cart');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item';
      toast.error(errorMessage);
    }
  };

  // Clear the cart
  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCart([]);
      toast.success('Cart cleared successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      toast.error(errorMessage);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0).toFixed(2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-stone">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-stone mb-8 text-center">Your Cart</h1>
        
        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="text-center text-taupe text-lg">Your cart is empty.</div>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.product?._id}
                className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md p-4 border border-beige hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-6 w-full md:w-2/3">
                  <img
                    src={
                      item.product?.images?.[0] 
                        ? `${process.env.REACT_APP_API_URL}/uploads/${item.product.images[0]}`
                        : "https://via.placeholder.com/80x80"
                    }
                    alt={item.product?.name || 'Product image'}
                    className="w-20 h-20 object-contain rounded-lg bg-parchment"
                  />
                  <div>
                    <h2 className="font-semibold text-stone text-xl">{item.product?.name || 'Unnamed Product'}</h2>
                    <p className="text-taupe text-sm">{item.product?.description || 'No description available'}</p>
                    {item.size && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-beige text-xs rounded-full text-stone">
                        Size: {item.size}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={e => {
                      const newQty = Math.max(1, Number(e.target.value));
                      updateCartItem(item.product?._id, newQty, item.size);
                    }}
                    className="w-16 px-2 py-1 border border-taupe rounded-md text-center text-stone"
                  />
                  <span className="text-lg font-semibold text-taupe">
                    ₹{((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeCartItem(item.product?._id)}
                    className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition disabled:opacity-60"
                    title="Remove from cart"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="mt-10 flex flex-col md:flex-row justify-between items-center bg-beige rounded-xl p-6 shadow-inner">
            <button
              onClick={clearCart}
              className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition disabled:opacity-60"
            >
              Clear Cart
            </button>
            <div className="text-center md:text-right mt-4 md:mt-0">
              <h2 className="text-2xl font-bold text-stone mb-2">Total: ₹{calculateTotal()}</h2>
              <Link
                to="/checkout"
                className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition disabled:opacity-60"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
