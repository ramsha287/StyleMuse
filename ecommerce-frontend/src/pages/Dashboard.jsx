import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/auth');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    
    if (!deletePassword) {
      return setDeleteError('Please enter your password to confirm account deletion');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          password: deletePassword
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      // Clear local storage and redirect to auth page
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/auth');
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError("New passwords don't match.");
    }

    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentPassword: oldPassword,
          newPassword: newPassword 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      // Update token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Also update user data if available
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      }

      setSuccess('Password successfully updated! Please log in again with your new password.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Log out after successful password change
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderPasswordInput = (label, value, setValue, show, toggle) => (
    <div className="relative mb-3">
      <input
        type={show ? 'text' : 'password'}
        placeholder={label}
        className="w-full p-2 border rounded pr-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        onClick={toggle}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-2xl text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        <h1 className="text-4xl font-bold text-stone mb-8 text-center">
          Welcome, {user?.name || "User"}!
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mb-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-beige flex items-center justify-center mb-4 text-4xl text-stone font-bold shadow">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <h2 className="text-2xl font-semibold text-taupe mb-4">Your Profile</h2>
          <div className="mb-2 w-full text-center">
            <span className="font-semibold text-stone">Name:</span> {user?.name || "N/A"}
          </div>
          <div className="mb-4 w-full text-center">
            <span className="font-semibold text-stone">Email:</span> {user?.email || "N/A"}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowResetModal(true)}
              className="p-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
            >
              Reset Password
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
            >
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
          <Link to="/myorders" className="bg-[#b9b4a8] text-white px-6 py-4 rounded-xl text-center font-semibold shadow hover:bg-[#a29e92] transition">
            My Orders
          </Link>
          <Link to="/wishlist" className="bg-[#dbd5c5] text-[#605F57] px-6 py-4 rounded-xl text-center font-semibold shadow hover:bg-[#e2dfd1] transition">
            My Wishlist
          </Link>
          <Link to="/cart" className="bg-[#b9b4a8] text-white px-6 py-4 rounded-xl text-center font-semibold shadow hover:bg-[#a29e92] transition">
            My Cart
          </Link>
        </div>
      </main>
      <Footer />

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-stone">Reset Password</h2>

            {renderPasswordInput("Current Password", oldPassword, setOldPassword, showOld, () => setShowOld(!showOld))}
            {renderPasswordInput("New Password", newPassword, setNewPassword, showNew, () => setShowNew(!showNew))}
            {renderPasswordInput("Confirm New Password", confirmPassword, setConfirmPassword, showConfirm, () => setShowConfirm(!showConfirm))}

            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Delete Account</h2>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. Please enter your password to confirm account deletion.
            </p>

            {renderPasswordInput("Enter Password", deletePassword, setDeletePassword, showDelete, () => setShowDelete(!showDelete))}

            {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="p-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-[#b9b4a8] text-white rounded hover:bg-[#a29e92] transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
