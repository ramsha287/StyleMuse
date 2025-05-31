import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const API_URL = process.env.REACT_APP_API_URL;

const AdminManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [trackingInput, setTrackingInput] = useState({});
  const [editingTracking, setEditingTracking] = useState({});
  // Modal state
  const [refundModal, setRefundModal] = useState({ open: false, order: null });
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('credit_card');
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(
        res.data.orders ||
        res.data.data?.orders ||
        res.data.data ||
        []
      );
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleTrackingChange = (orderId, value) => {
    setTrackingInput((prev) => ({ ...prev, [orderId]: value }));
  };

  const saveTrackingNumber = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/orders/add-tracking/${orderId}`,
        { trackingNumber: trackingInput[orderId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTracking((prev) => ({ ...prev, [orderId]: false }));
      fetchOrders();
    } catch (err) {
      alert("Failed to update tracking number");
    }
  };

  const handleReturn = async (orderId) => {
    if (!window.confirm("Mark this order as returned?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/orders/${orderId}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      alert("Failed to mark as returned");
    }
  };

  const openRefundModal = async (order) => {
    const transactionId = order.paymentDetails?.transactionId;
    if (!transactionId) {
      setRefundError("No transaction ID found for this order.");
      return;
    }
    try {
      
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_URL}/api/payments/${transactionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payment = res.data.data.payment;
      const refunded = (payment.refunds || []).reduce((sum, r) => sum + (r.amount || 0), 0);
      const maxRefund = (payment.amount ?? 0) - refunded;

      setRefundModal({ open: true, order, maxRefund });
      setRefundAmount(maxRefund);
      setRefundMethod('credit_card');
      setRefundReason('Customer requested refund');
      setRefundError('');
    } catch (err) {
      setRefundError("Failed to fetch payment details.");
    }
  };

  const closeRefundModal = () => {
    setRefundModal({ open: false, order: null });
    setRefundError('');
  };

  const submitRefund = async () => {
    const order = refundModal.order;
    const transactionId = order?.paymentDetails?.transactionId;
    if (!transactionId) {
      setRefundError("No transaction ID found for this order.");
      return;
    }
    if (!refundAmount || isNaN(refundAmount) || Number(refundAmount) <= 0) {
      setRefundError("Invalid amount.");
      return;
    }
    if (Number(refundAmount) > refundModal.maxRefund) {
      setRefundError(`Amount cannot exceed ${refundModal.maxRefund}`);
      return;
    }
    if (!refundMethod) {
      setRefundError("Refund method is required.");
      return;
    }
    if (!refundReason || refundReason.length < 3) {
      setRefundError("Reason must be at least 3 characters.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/payments/${transactionId}/refund`,
        { amount: Number(refundAmount), reason: refundReason, refundMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Automatically set status to "refunded"
      await updateStatus(order._id, "refunded");
      closeRefundModal();
      fetchOrders();
    } catch (err) {
      setRefundError("Failed to refund order");
    }
  };

  const handleRefund = async (orderId) => {
    if (!window.confirm("Refund this order?")) return;
    try {
      const order = orders.find(o => o._id === orderId);
      const transactionId = order?.paymentDetails?.transactionId;
      if (!transactionId) {
        alert("No transaction ID found for this order.");
        return;
      }
      // Prompt for amount, refund method, and reason
      const defaultAmount = order.totalAmount ?? order.total ?? 0;
      const amountInput = window.prompt("Enter refund amount:", defaultAmount);
      if (!amountInput) return;
      const amount = parseFloat(amountInput);
      if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
      }
      const refundMethod = window.prompt(
        "Enter refund method (credit_card, debit_card, paypal, bank_transfer, gpay, paytm, store_credit):",
        "store_credit"
      );
      if (!refundMethod) return;
      const reason = window.prompt("Enter refund reason (min 10 chars):", "Customer requested refund");
      if (!reason || reason.length < 10) {
        alert("Reason must be at least 10 characters.");
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/payments/${transactionId}/refund`,
        { amount, reason, refundMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      alert("Failed to refund order");
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  const statusOrder = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'returned',
    'cancelled',
    'refunded'
  ];


  const statusIcons = {
    pending: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
    ),
    processing: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    ),
    shipped: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" />
      </svg>
    ),
    delivered: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    ),
    returned: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116-16" />
      </svg>
    ),
    cancelled: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" />
        <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    ),
    refunded: (
      <svg className="inline w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" />
      </svg>
    ),
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.orderStatus || 'pending';
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {});

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-2 py-10">
        <h2 className="text-2xl font-bold mb-6 text-stone text-center">Manage Orders</h2>
        <div className="w-full max-w-5xl">
          {orders.length === 0 ? (
            <div className="bg-linen border border-beige rounded-xl p-8 text-center text-taupe shadow">
              <p className="text-lg font-semibold">No orders available</p>
            </div>
          ) : (
            <div className="space-y-10">
              {statusOrder.map((status) =>
                groupedOrders[status] && groupedOrders[status].length > 0 ? (
                  <div key={status}>
                    <h3 className="text-xl font-bold mb-4 capitalize border-b border-beige pb-2 flex items-center">
                      {statusIcons[status]}
                      {status.replace('_', ' ')} Orders ({groupedOrders[status].length})
                    </h3>
                    <div className="grid gap-6">
                      {groupedOrders[status].map((order) => (
                        <div
                          key={order._id}
                          className="rounded-xl bg-white shadow-lg border border-beige p-6 hover:shadow-xl transition"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                            <div>
                              <p className="text-sm text-taupe">
                                <span className="font-semibold text-stone">Order ID:</span> <span className="font-mono">{order._id}</span>
                              </p>
                              <p className="text-sm text-taupe">
                                <span className="font-semibold text-stone">User:</span> {order.user?.email || <span className="italic text-beige">Guest</span>}
                              </p>
                              <p className="text-sm text-taupe">
                                <span className="font-semibold text-stone">Total:</span> $
                                <span className="font-mono">{(order.totalAmount ?? order.total ?? 0).toFixed(2)}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-stone font-semibold text-sm">Status:</label>
                              <select
                                className="rounded-lg p-1 text-sm bg-beige text-stone border border-taupe focus:ring-2 focus:ring-taupe"
                                value={order.orderStatus}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option> {/* <-- Add this line */}
                                <option value="refunded">Refunded</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <div className="text-sm text-taupe">
                              <span className="font-semibold text-stone">Tracking:</span>
                              {editingTracking[order._id] ? (
                                <>
                                  <input
                                    type="text"
                                    value={trackingInput[order._id] ?? order.trackingNumber ?? ""}
                                    onChange={e => handleTrackingChange(order._id, e.target.value)}
                                    className="border border-beige rounded px-2 py-1 text-xs ml-2 bg-parchment focus:outline-none focus:ring-2 focus:ring-taupe"
                                    style={{ width: 140 }}
                                  />
                                  <button
                                    className="ml-2 text-xs bg-taupe text-white px-2 py-1 rounded hover:bg-stone transition"
                                    onClick={() => saveTrackingNumber(order._id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="ml-1 text-xs text-stone underline"
                                    onClick={() => setEditingTracking((prev) => ({ ...prev, [order._id]: false }))}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="ml-2 font-mono text-stone">#{order.trackingNumber || 'N/A'}</span>
                                  <button
                                    className="ml-2 text-xs text-taupe underline hover:text-stone"
                                    onClick={() => setEditingTracking((prev) => ({ ...prev, [order._id]: true }))}
                                  >
                                    {order.trackingNumber ? "Edit" : "Add"}
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-beige mt-2 md:mt-0">
                              <span className="font-semibold text-stone">Items:</span>{" "}
                              {(order.items || []).map((item, idx) => (
                                <span key={idx}>
                                  {item.product?.name || "Product"} x {item.quantity}
                                  {idx < order.items.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              className="bg-[#b9b4a8] text-white px-4 py-1 rounded hover:bg-[#a29e92] transition text-xs font-semibold shadow"
                              onClick={() => handleReturn(order._id)}
                              disabled={order.orderStatus !== "delivered"}
                              title="Allow return only if delivered"
                            >
                              Mark as Returned
                            </button>
                            <button
                              className="bg-[#b9b4a8] text-white px-4 py-1 rounded hover:bg-[#a29e92] transition text-xs font-semibold shadow"
                              onClick={() => openRefundModal(order)}
                              disabled={order.orderStatus !== "returned" && order.orderStatus !== "cancelled"}
                              title="Allow refund only if returned or cancelled"
                            >
                              Refund
                            </button>
                            <button
                              className="bg-[#b9b4a8] text-white px-4 py-1 rounded hover:bg-[#a29e92] transition text-xs font-semibold shadow"
                              onClick={() => handleCancel(order._id)}
                              disabled={["cancelled", "delivered"].includes(order.orderStatus)}
                              title="Can't cancel if already delivered or cancelled"
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {refundModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Refund Order</h3>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Amount</label>
              <input
                type="number"
                min="0"
                max={refundModal.maxRefund}
                className="w-full border rounded px-2 py-1"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
              />
              <small className="text-xs text-taupe">
                Maximum refundable: {refundModal.maxRefund}
              </small>
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Refund Method</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={refundMethod}
                onChange={e => setRefundMethod(e.target.value)}
              >
                <option value="store_credit">Store Credit</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gpay">GPay</option>
                <option value="paytm">Paytm</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Reason</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
              >
                <option value="">Select reason</option>
                <option value="customer_request">Customer Request</option>
                <option value="product_return">Product Return</option>
                <option value="fraud">Fraud</option>
                <option value="other">Other</option>
              </select>
            </div>
            {refundError && (
              <div className="mb-2 text-red-600 text-sm">{refundError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={closeRefundModal}
              >
                Cancel
              </button>
              <button
                className="bg-[#b9b4a8] text-white px-4 py-1 rounded"
                onClick={submitRefund}
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageOrders;

