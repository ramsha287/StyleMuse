import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setError('Not authenticated');
      try {
        const res = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setError('Failed to fetch orders');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setOrders(data.data.orders || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-10 px-4 ">
        <h1 className="text-3xl font-bold text-stone mb-8 text-center">My Orders</h1>
        {loading ? (
          <div className="text-center text-taupe">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-taupe">You have no orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr className="bg-beige text-stone">
                  <th className="py-2 px-4">Order #</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Total</th>
                  <th className="py-2 px-4">Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b last:border-none">
                    <td className="py-2 px-4 font-mono">{order.orderNumber || order._id.slice(-6)}</td>
                    <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 capitalize">{order.orderStatus}</td>
                    <td className="py-2 px-4">₹{order.total?.toFixed(2) || 'N/A'}</td>
                    <td className="py-2 px-4">
                      {order.items.map(item => (
                        <div key={item._id} className="flex items-center gap-2 mb-1">
                          
                          <span className="text-sm">{item.product && item.product.name ? item.product.name : "Product deleted"}</span>
                          <span className="text-xs text-taupe">x{item.quantity}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;