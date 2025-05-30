import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/auth-slider.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post("${API_URL}/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      toast.success('Login successful!');
      navigate("/");
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.warning('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }

    try {
      await axios.post("${API_URL}/api/auth/register", formData);
      toast.success("Registered successfully! Please login.");
      setIsLogin(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
        const response = await axios.post("${API_URL}/api/auth/forgot-password", { email: forgotEmail });
        toast.success(response.data.message || 'Password reset instructions have been sent to your email.');
        setShowForgot(false);
    } catch (err) {
        console.error('Forgot password error:', err);
        toast.error(err.response?.data?.message || 'Failed to send reset email. Please try again later.');
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!resetToken) {
        toast.warning('Reset token is required.');
        return;
    }

    if (newPassword !== confirmPassword) {
        toast.warning("New passwords don't match.");
        return;
    }

    if (newPassword.length < 6) {
        toast.warning("Password must be at least 6 characters long.");
        return;
    }

    try {
        const response = await axios.patch(`${API_URL}/api/auth/reset-password/${resetToken}`, {
            newPassword
        });

        toast.success(response.data.message || 'Password has been reset successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        
        // Close modal after 2 seconds and redirect to login
        setTimeout(() => {
            setShowReset(false);
            navigate('/login');
        }, 2000);
    } catch (err) {
        console.error('Reset password error:', err);
        toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
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

  const handleForgotChange = (e) => {
    setForgotEmail(e.target.value);
  };

  return (
    <div className="relative">
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
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center font-sans">
        <div className="relative w-auto max-w-[900px] md:w-[800px] h-auto max-h-[500px] shadow-2xl rounded-3xl overflow-hidden bg-white flex flex-col md:flex-row">
          <div className="w-full h-full flex flex-col md:flex-row z-20">
            {/* Login Form */}
            <div
              className={`
                w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10
                ${isLogin ? "block" : "hidden"} md:block
              `}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-stone mb-6 text-center">Login</h2>
              <form onSubmit={handleLogin} className="flex flex-col space-y-5 w-full max-w-sm">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-taupe"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="p-3 w-full border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-taupe pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <button type="submit" className="bg-taupe text-stone py-2 rounded-xl shadow-md hover:bg-parchment transition">
                  Login
                </button>
                <button
                  type="button"
                  className="text-taupe text-center text-sm mt-2 text-left"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot password
                </button>
              </form>
            </div>

            {/* Register Form */}
            <div
              className={`
                w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10
                ${!isLogin ? "block" : "hidden"} md:block
              `}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-stone mb-6 text-center">Register</h2>
              <form onSubmit={handleRegister} className="flex flex-col space-y-5 w-full max-w-sm">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-taupe"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-taupe"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="p-3 w-full border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-taupe pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <button type="submit" className="bg-taupe text-stone py-2 rounded-xl shadow-md hover:bg-parchment transition">
                  Register
                </button>
              </form>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgot && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-linen p-8 rounded-lg shadow-md w-full max-w-md relative">
                <button
                  className="absolute top-3 right-4 text-stone hover:text-taupe"
                  onClick={() => {
                    setShowForgot(false);
                    setError('');
                    setSuccess('');
                  }}
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-center mb-6 text-stone">Forgot Password</h2>
                <form onSubmit={handleForgotPassword} className="flex flex-col space-y-4">
                  <input
                    type="email"
                    name="email"
                    value={forgotEmail}
                    onChange={handleForgotChange}
                    placeholder="Enter your email"
                    required
                    className="p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-taupe"
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {success && <p className="text-green-500 text-sm">{success}</p>}
                  <button
                    type="submit"
                    className="bg-taupe text-stone py-2 rounded-xl shadow-md hover:bg-parchment transition"
                  >
                    Send Reset Link
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {showReset && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-linen p-8 rounded-lg shadow-md w-full max-w-md relative">
                <button
                  className="absolute top-3 right-4 text-stone hover:text-taupe"
                  onClick={() => {
                    setShowReset(false);
                    setError('');
                    setSuccess('');
                  }}
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-center mb-4 text-stone">Reset Password</h2>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Enter reset token from email"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="p-3 border rounded-xl"
                  />
                  {renderPasswordInput("New Password", newPassword, setNewPassword, showNew, () => setShowNew(!showNew))}
                  {renderPasswordInput("Confirm Password", confirmPassword, setConfirmPassword, showConfirm, () => setShowConfirm(!showConfirm))}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {success && <p className="text-green-500 text-sm">{success}</p>}
                  <button
                    className="bg-taupe text-stone py-2 rounded-xl shadow-md hover:bg-parchment transition"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sliding Panel (desktop only) */}
          <div
            className={`
              hidden md:block
              absolute top-0 h-full w-1/2 bg-cover bg-center transition-all duration-700 ease-in-out z-30 rounded-3xl shadow-lg
              ${isLogin ? "left-0" : "left-1/2"}
            `}
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${loginImage})`,
            }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center text-white p-6 text-center">
              <h2 className="text-3xl font-bold mb-4">{isLogin ? "Welcome back!" : "New here?"}</h2>
              <p className="mb-6 text-sm md:text-base max-w-xs">
                {isLogin
                  ? "Already registered? Login to access your dashboard."
                  : "Don't have an account? Let's get you started on your journey."}
              </p>
              <button
                onClick={toggleForm}
                className="bg-transparent border border-white py-2 px-6 rounded-full hover:bg-white hover:text-[#4B4A44] transition font-medium"
              >
                {isLogin ? "Login" : "Register"}
              </button>
            </div>
          </div>

          {/* Mobile Toggle Panel */}
          <div
            className="block md:hidden w-full bg-gray-200 py-4 px-4 text-center"
            style={{
              backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${loginImage})`,
            }}
          >
            <p className="mb-2 text-white">
              {isLogin ? "Don't have an account? Register now!" : "Already have an account? Login here!"}
            </p>
            <button
              onClick={toggleForm}
              className="bg-taupe text-stone py-2 px-8 rounded-full shadow hover:bg-parchment transition font-medium"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;
