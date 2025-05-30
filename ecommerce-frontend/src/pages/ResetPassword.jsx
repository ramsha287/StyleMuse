import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one number');
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      setIsLoading(false);
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      setIsLoading(false);
      return;
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      setError('Password must contain at least one special character (!@#$%^&*)');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`/api/auth/reset-password/${token}`, {
        newPassword
      });

      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.response?.data?.message || 'An error occurred while resetting the password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-stone">Reset Your Password</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taupe"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taupe"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-taupe text-white py-3 rounded-lg font-semibold hover:bg-parchment transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
