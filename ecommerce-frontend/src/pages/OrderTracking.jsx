import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL;

const statusSteps = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundStatus, setRefundStatus] = useState(null);
  const [refundMethod, setRefundMethod] = useState("store_credit");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.data.order || res.data.order);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || "Failed to load order. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const handleReturn = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/orders/${order._id}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Return request submitted successfully!");
      window.location.reload();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to submit return request.";
      toast.error(errorMessage);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/orders/${order._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order cancelled successfully!");
      window.location.reload();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to cancel order.";
      toast.error(errorMessage);
    }
  };

  const handleRefund = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/payments/${order.paymentDetails?.transactionId}/refund`,
        { amount: order.total, reason: "customer_request", refundMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefundStatus("Refund requested!");
      toast.success("Refund requested successfully!");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to process refund request.";
      setRefundStatus("Refund failed.");
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b9b4a8] mx-auto mb-4"></div>
            <p className="text-xl text-stone">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Progress bar logic
  let currentStep = statusSteps.indexOf(order.orderStatus || order.status);
  if (currentStep === -1) currentStep = 0;


  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow border border-beige p-8">
          <h2 className="text-2xl font-bold mb-6 text-stone text-center">Order Tracking</h2>
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-8">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${idx <= currentStep ? "bg-[#b9b4a8] text-white" : "bg-beige text-stone"}`}
                >
                  {idx + 1}
                </div>
                <span className="text-xs mt-2 capitalize">{step}</span>


              </div>
            ))}
          </div>
          <div className="mb-4">
            <strong>Total:</strong> ₹{order.total}
          </div>
          <div className="mb-4 text-capitalize">
            <strong>Status:</strong> {order.orderStatus || order.status}
          </div>

          <div className="mb-4">
            <strong>Items:</strong>
            <ul className="list-disc ml-6">
              {(order.items || []).map((item, idx) => (
                <li key={idx}>
                  {item.product?.name || "Product"} x {item.quantity}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <label className="font-semibold mr-2">Refund Method:</label>
            <select
              value={refundMethod}
              onChange={e => setRefundMethod(e.target.value)}
              className="border border-beige rounded p-1"
            >
              <option value="store_credit">Store Credit</option>
              <option value="original_payment">Original Payment</option>
            </select>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              className="bg-[#b9b4a8] text-white px-6 py-2 rounded hover:bg-[#a29e92] transition font-semibold shadow"
              onClick={handleReturn}
            >
              Request Return
            </button>
            <button
              className="bg-[#b9b4a8]  text-white px-6 py-2 rounded hover:bg-[#a29e92]
               transition font-semibold shadow"
              onClick={handleRefund}
            >
              Request Refund
            </button>
            <button
              className="bg-[#b9b4a8] text-white px-6 py-2 rounded hover:bg-[#a29e92] transition font-semibold shadow"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </button>
          </div>
          {refundStatus && (
            <div className="mt-4 text-center text-stone">{refundStatus}</div>
          )}
          {order.orderStatus === "returned" && (
            <div className="mb-4 p-2 rounded bg-yellow-100 text-yellow-800 font-semibold text-center">
              Return Requested / Order Returned
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTracking;