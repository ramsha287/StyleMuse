import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Checkout = () => {
  const navigate = useNavigate();

  // Cart and subtotal from backend
  const [cartData, setCartData] = useState(null);

  // Get cart items from backend cartData
  const cartItems = cartData?.items?.map(item => ({
    id: item._id,
    name: item.product?.name || "",
    price: item.price,
    qty: item.quantity,
  })) || [];

  // Use backend subtotal if available, otherwise calculate from cartItems
  const total = cartData?.subtotal !== undefined
    ? cartData.subtotal
    : cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);

  // New shipping form state
  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [error, setError] = useState(null);

  // Fetch addresses and cart on mount
  useEffect(() => {
    fetchCart();
    fetchAddresses();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartData(res.data.data.cart);
    } catch (err) {
      setCartData(null);
      toast.error('Failed to load cart data');
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/users/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data.addresses || []);
      if (res.data.addresses && res.data.addresses.length > 0) {
        setSelectedAddressId(
          res.data.addresses.find((a) => a.isDefault)?._id ||
          res.data.addresses[0]._id
        );
      }
    } catch (err) {
      setAddresses([]);
      toast.error('Failed to load addresses');
    }
  };

  const handleChange = (e) => {
    setShipping((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
    setShowAddAddress(false);
    setError(null);
  };

  const handleAddAddressClick = () => {
    setShowAddAddress(true);
    setShipping({
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      phone: "",
    });
    setError(null);
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !shipping.street ||
      !shipping.city ||
      !shipping.state ||
      !shipping.zipCode ||
      !shipping.country ||
      !shipping.phone
    ) {
      toast.warning("Please fill in all fields.");
      return;
    }
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/users/address`,
        shipping,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAddresses();
      const newAddr = res.data.address || {};
      setSelectedAddressId(newAddr._id);
      setShowAddAddress(false);
      toast.success('Address added successfully');
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Failed to add address. Please try again."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let shippingData = addresses.find((a) => a._id === selectedAddressId);
    if (!shippingData) {
      toast.warning("Please select a shipping address.");
      return;
    }
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/orders`,
        {
          shippingAddress: shippingData,
          paymentMethod: "gpay", 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const order = res.data.data.order;
      toast.success('Order created successfully');
      navigate("/payment", {
        state: {
          orderId: order._id,
          orderTotal: order.total,
          currency: "INR",
          shipping: shippingData,
        },
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        "Failed to create order. Please try again."
      );
    }
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
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow border border-beige p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-stone text-center">Checkout</h2>
            {/* Address selection */}
            {addresses.length > 0 && !showAddAddress && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-stone mb-2">Select Shipping Address</h3>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`block border rounded-lg p-3 cursor-pointer ${
                        selectedAddressId === addr._id
                          ? "border-[#b9b4a8] bg-parchment"
                          : "border-beige bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => handleAddressSelect(addr._id)}
                        className="mr-2 accent-[#b9b4a8]"
                      />
                      <span className="font-semibold">{addr.street}</span>, {addr.city}, {addr.state},{" "}
                      {addr.zipCode}, {addr.country} <br />
                      <span className="text-sm text-taupe">Phone: {addr.phone}</span>
                      {addr.isDefault && (
                        <span className="ml-2 px-2 py-0.5 bg-[#b9b4a8] text-white text-xs rounded">Default</span>
                      )}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddAddressClick}
                  className="mt-3 text-[#b9b4a8] underline"
                >
                  + Add Address
                </button>
              </div>
            )}
            {/* Add address form: show if adding or if no addresses */}
            {(showAddAddress || addresses.length === 0) && (
              <form onSubmit={handleAddAddressSubmit} className="space-y-5 mb-6">
                <h3 className="text-lg font-semibold text-stone mb-2">Add New Shipping Address</h3>
                <div>
                  <label className="block mb-1 text-stone font-semibold">Street</label>
                  <input
                    name="street"
                    value={shipping.street}
                    onChange={handleChange}
                    className="border border-beige p-2 rounded w-full bg-parchment text-stone"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block mb-1 text-stone font-semibold">City</label>
                    <input
                      name="city"
                      value={shipping.city}
                      onChange={handleChange}
                      className="border border-beige p-2 rounded w-full bg-parchment text-stone"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-stone font-semibold">State</label>
                    <input
                      name="state"
                      value={shipping.state}
                      onChange={handleChange}
                      className="border border-beige p-2 rounded w-full bg-parchment text-stone"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block mb-1 text-stone font-semibold">Zip Code</label>
                    <input
                      name="zipCode"
                      value={shipping.zipCode}
                      onChange={handleChange}
                      className="border border-beige p-2 rounded w-full bg-parchment text-stone"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-stone font-semibold">Country</label>
                    <input
                      name="country"
                      value={shipping.country}
                      onChange={handleChange}
                      className="border border-beige p-2 rounded w-full bg-parchment text-stone"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-stone font-semibold">Phone</label>
                  <input
                    name="phone"
                    value={shipping.phone}
                    onChange={handleChange}
                    className="border border-beige p-2 rounded w-full bg-parchment text-stone"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded text-center">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-[#b9b4a8] text-white px-6 py-2 rounded hover:bg-[#a29e92] transition font-semibold w-full shadow"
                  >
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="bg-gray-300 text-stone px-6 py-2 rounded hover:bg-gray-400 transition font-semibold w-full shadow"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
            {/* If using existing address, show continue button */}
            {addresses.length > 0 && !showAddAddress && (
              <button
                onClick={handleSubmit}
                className="bg-[#b9b4a8] text-white px-6 py-2 rounded hover:bg-[#a29e92] transition font-semibold w-full shadow mt-6"
              >
                Continue to Payment
              </button>
            )}
          </div>
          {/* Order summary */}
          <div className="bg-parchment rounded-lg p-4 border border-beige mb-8">
            <h3 className="text-lg font-semibold text-stone mb-2">Order Summary</h3>
            <ul className="mb-2 divide-y divide-beige">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded border border-beige"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-taupe">Qty: {item.qty}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-stone">₹{item.price * item.qty}</div>
                    <div className="text-xs text-taupe">₹{item.price} each</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-stone border-t border-beige pt-2">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer /> 
    </div>  
  ); 
};


export default Checkout;