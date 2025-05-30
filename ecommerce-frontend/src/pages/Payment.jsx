import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import paytmIcon from "../assets/paytm-icon.png";
import gpayIcon from "../assets/google-pay-primary-logo-logo-svgrepo-com.svg";

const API_URL = process.env.REACT_APP_API_URL;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, orderTotal, currency = "INR" } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Example: handle input changes for payment details
  const handleDetailsChange = (e) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/payments/process`,
        {
          orderId,
          orderTotal,
          currency,
          paymentMethod,
          paymentDetails: { ...paymentDetails, currency },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus({ type: "success", message: "Payment successful!", data: res.data.data.payment });
      toast.success('Payment processed successfully');
      // Redirect to tracking page after short delay
      setTimeout(() => {
        navigate(`/order-tracking/${orderId}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Payment failed. Please try again.";
      setStatus({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  // Payment method icons (optional, you can use your own SVGs or images)
  const paymentIcons = {
    credit_card: "💳",
    debit_card: "💳",
    paypal: "🅿️",
    bank_transfer: "🏦",
    gpay: (
      <img
        src={gpayIcon}
        alt="GPay"
        style={{ width: 28, height: 18, objectFit: "contain", background: "#fff", borderRadius: 4 }}
      />
    ),
    paytm: (
      <img
        src={paytmIcon}
        alt="Paytm"
        style={{ width: 28, height: 18, objectFit: "contain", background: "#fff", borderRadius: 4 }}
      />
    ),
  };

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
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-xl shadow border border-beige p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-stone text-center">Payment</h2>
            {/* Order summary */}
            <div className="mb-6 bg-parchment rounded-lg p-4 border border-beige">
              <h3 className="text-lg font-semibold text-stone mb-2">Order Summary</h3>
              {/* <div className="flex justify-between text-stone mb-1">
                {/* <span>Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div> */} 
              <div className="flex justify-between text-stone">
                <span>Total:</span>
                <span className="font-semibold">{currency} {orderTotal}</span>
              </div>
            </div>
            {/* Payment form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 text-stone font-semibold">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    className={`flex items-center gap-2 border rounded p-2 w-full justify-center transition ${
                      paymentMethod === "credit_card"
                        ? "bg-[#b9b4a8] text-white border-[#b9b4a8]"
                        : "bg-parchment text-stone border-beige"
                    }`}
                    onClick={() => setPaymentMethod("credit_card")}
                  >
                    <span role="img" aria-label="Credit Card">{paymentIcons.credit_card}</span>
                    Credit Card
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 border rounded p-2 w-full justify-center transition ${
                      paymentMethod === "debit_card"
                        ? "bg-[#b9b4a8] text-white border-[#b9b4a8]"
                        : "bg-parchment text-stone border-beige"
                    }`}
                    onClick={() => setPaymentMethod("debit_card")}
                  >
                    <span role="img" aria-label="Debit Card">{paymentIcons.debit_card}</span>
                    Debit Card
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 border rounded p-2 w-full justify-center transition ${
                      paymentMethod === "paypal"
                        ? "bg-[#b9b4a8] text-white border-[#b9b4a8]"
                        : "bg-parchment text-stone border-beige"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <span role="img" aria-label="PayPal">{paymentIcons.paypal}</span>
                    PayPal
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 border rounded p-2 w-full justify-center transition ${
                      paymentMethod === "bank_transfer"
                        ? "bg-[#b9b4a8] text-white border-[#b9b4a8]"
                        : "bg-parchment text-stone border-beige"
                    }`}
                    onClick={() => setPaymentMethod("bank_transfer")}
                  >
                    <span role="img" aria-label="Bank">{paymentIcons.bank_transfer}</span>
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 border rounded p-2 w-full justify-center transition ${
                      paymentMethod === "gpay"
                        ? "bg-[#b9b4a8] text-white border-[#b9b4a8]"
                        : "bg-parchment text-stone border-beige"
                    }`}
                    onClick={() => setPaymentMethod("gpay")}
                  >
                    <span role="img" aria-label="GPay">{paymentIcons.gpay}</span>
                    GPay
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 border rounded p-2 w-full justify-center transition ${
                      paymentMethod === "paytm"
                        ? "bg-[#b9b4a8] text-white border-[#b9b4a8]"
                        : "bg-parchment text-stone border-beige"
                    }`}
                    onClick={() => setPaymentMethod("paytm")}
                  >
                    <span role="img" aria-label="Paytm">{paymentIcons.paytm}</span>
                    Paytm
                  </button>
                </div>
              </div>
              {/* Render payment details fields based on method */}
              {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    name="cardNumber"
                    placeholder="Card Number"
                    className="border border-beige p-2 rounded bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      name="expiryMonth"
                      placeholder="MM"
                      className="border border-beige p-2 rounded bg-parchment text-stone w-1/2 focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                      onChange={handleDetailsChange}
                      required
                    />
                    <input
                      name="expiryYear"
                      placeholder="YYYY"
                      className="border border-beige p-2 rounded bg-parchment text-stone w-1/2 focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                      onChange={handleDetailsChange}
                      required
                    />
                  </div>
                  <input
                    name="cvv"
                    placeholder="CVV"
                    className="border border-beige p-2 rounded bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                  <input
                    name="cardType"
                    placeholder="Card Type (Visa, MasterCard, etc)"
                    className="border border-beige p-2 rounded bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                  />
                </div>
              )}
              {paymentMethod === "paypal" && (
                <div>
                  <input
                    name="paypalEmail"
                    placeholder="PayPal Email"
                    className="border border-beige p-2 rounded bg-parchment text-stone w-full focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                </div>
              )}
              {paymentMethod === "bank_transfer" && (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    name="bankAccount"
                    placeholder="Bank Account Number"
                    className="border border-beige p-2 rounded bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                  <input
                    name="bankName"
                    placeholder="Bank Name"
                    className="border border-beige p-2 rounded bg-parchment text-stone focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                </div>
              )}
              {paymentMethod === "gpay" && (
                <div>
                  <input
                    name="gpayNumber"
                    placeholder="GPay Phone Number"
                    className="border border-beige p-2 rounded bg-parchment text-stone w-full focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                </div>
              )}
              {paymentMethod === "paytm" && (
                <div>
                  <input
                    name="paytmNumber"
                    placeholder="Paytm Phone Number"
                    className="border border-beige p-2 rounded bg-parchment text-stone w-full focus:outline-none focus:ring-2 focus:ring-[#b9b4a8]"
                    onChange={handleDetailsChange}
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#b9b4a8] text-white px-6 py-2 rounded hover:bg-[#a29e92] transition font-semibold w-full shadow"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </form>
            {/* Status message */}
            {status && (
              <div
                className={`mt-6 p-3 rounded text-center ${
                  status.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {status.message}
              </div>
            )}
            {/* Show payment details if successful */}
            {status?.type === "success" && status.data && (
              <div className="mt-4 text-sm text-stone text-center">
                <div>Transaction ID: {status.data.transactionId}</div>
                <div>Status: {status.data.status}</div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;