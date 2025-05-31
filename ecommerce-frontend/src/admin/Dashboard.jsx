import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const fetchSummary = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard summary', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-parchment text-stone flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-1">
        <h1 className="text-4xl font-bold mb-12 text-center text-stone tracking-tight drop-shadow">
          Admin Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {[
            { label: 'Total Users', value: summary.totalUsers, color: 'bg-[#b9b4a8]' },
            { label: 'Total Products', value: summary.totalProducts, color: 'bg-[#dbd5c5]' },
            { label: 'Total Orders', value: summary.totalOrders, color: 'bg-[#a29e92]' },
            { label: 'Total Revenue', value: `$${summary.totalRevenue.toFixed(2)}`, color: 'bg-[#e2dfd1]' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 shadow-md hover:shadow-xl transition-all border border-beige flex flex-col items-center ${item.color}`}
            >
              <h2 className="text-lg font-semibold text-stone mb-2">{item.label}</h2>
              <p className="text-4xl font-extrabold text-stone">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              path: '/admin/manage-users',
              title: 'Manage Users',
              desc: 'View and control user accounts',
              icon: '👤',
            },
            {
              path: '/admin/manage-products',
              title: 'Manage Products',
              desc: 'Add, edit, or remove products',
              icon: '🛒',
            },
            {
              path: '/admin/manage-orders',
              title: 'Manage Orders',
              desc: 'Track and update order status',
              icon: '📦',
            },
            {
              path: '/admin/manage-shipping',
              title: 'Manage Shipping',
              desc: 'Add, edit, or remove shipping methods',
              icon: '🚚',
            },
          ].map((item, idx) => (
            <Link
              to={item.path}
              key={idx}
              className="block bg-white border border-beige rounded-2xl p-7 shadow-md hover:shadow-xl hover:bg-beige/60 transition-all text-center group"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-[#605F57] transition">{item.title}</h3>
              <p className="text-base text-taupe">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
