import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaBars, FaTimes, FaUser } from "react-icons/fa";
import logo from "../assets/logo1.png";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Cache for storing categories
const categoryCache = {
  categories: null,
  lastFetched: null,
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const Navbar = () => {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch categories with retry logic
  useEffect(() => {
    const fetchCategories = async (retryCount = 0) => {
      try {
        // Check if we have a valid cached response
        const now = Date.now();
        if (categoryCache.categories && categoryCache.lastFetched && 
            (now - categoryCache.lastFetched < categoryCache.CACHE_DURATION)) {
          setCategories(categoryCache.categories);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/categories`);
        const data = response.data;
        const categoriesData = data.categories || [];
        
        // Update cache
        categoryCache.categories = categoriesData;
        categoryCache.lastFetched = now;
        
        setCategories(categoriesData);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Implement retry logic for rate limiting errors
        if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => fetchCategories(retryCount + 1), delay);
          return;
        }

        setError('Failed to load categories');
        // If we have cached data, use it as fallback
        if (categoryCache.categories) {
          setCategories(categoryCache.categories);
        }
      } finally {
        if (retryCount === 0) {
          setLoading(false);
        }
      }
    };

    fetchCategories();
  }, []);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser({ isAdmin: parsedUser.role === "admin" });
    } else {
      setUser(null);
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setProfileDropdownOpen(false);
    navigate("/auth");
  };

  return (
    <header className="bg-gray-100 sticky top-0 z-50">
      <div className="relative container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="w-1/3">
          <Link to="/">
            <img src={logo} alt="E-Shop Logo" className="h-10 w-auto" />
          </Link>
        </div>
        {/* Center: Nav */}
        <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex space-x-5 text-[#4B4A44] text-lg font-medium font-serif">
          <Link to="/">Home</Link>
          <div
            className="relative group"
            onMouseEnter={() => setCategoryDropdownOpen(true)}
            onMouseLeave={() => setCategoryDropdownOpen(false)}
          >
            <div className="cursor-pointer">Shop by Category</div>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 bg-white rounded-md w-40 shadow-lg z-30">
                <ul className="max-h-60 overflow-y-auto">
                  {loading ? (
                    <li className="px-4 py-2 text-gray-500">Loading...</li>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category._id} className="px-4 py-2 hover:bg-[#f0eee2]">
                        <Link to={`/category/${category.name.toLowerCase()}`}>
                          {category.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500">No categories found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <Link to="/contact">Contact</Link>
        </nav>
        {/* Right: Icons and Login */}
        <div className="w-1/3 flex justify-end items-center space-x-4 text-xl text-[#605F57]">
          <Link to="/wishlist"><FaHeart /></Link>
          <Link to="/cart"><FaShoppingCart /></Link>
          {/* Profile Dropdown */}
          <div className="relative">
            <div onClick={() => setProfileDropdownOpen((v) => !v)} className="cursor-pointer" title="Profile">
              <FaUser size={22} />
            </div>
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg z-50 w-48 text-sm text-[#4B4A44]">
                {user ? (
                  <>
                    <Link
                      to={user.isAdmin ? "/admin/dashboard" : "/dashboard"}
                      className="block px-4 py-2 hover:bg-[#f0eee2]"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-[#f0eee2]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block px-4 py-2 hover:bg-[#f0eee2]"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            )}
          </div>
          <div
            className="md:hidden cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white p-4">
          <nav className="space-y-4 text-lg">
            <Link to="/" className="block text-[#4B4A44]">Home</Link>
            <div className="relative group">
              <div
                className="cursor-pointer text-[#4B4A44]"
                onClick={() => setCategoryDropdownOpen((v) => !v)}
              >
                Shop by Category
              </div>
              {categoryDropdownOpen && (
                <div className="absolute left-0 bg-white rounded-md w-40 shadow-lg z-30">
                  <ul className="max-h-60 overflow-y-auto text-[#4B4A44]">
                    {loading ? (
                      <li className="px-4 py-2 text-gray-500">Loading...</li>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <li key={category._id} className="px-4 py-2 hover:bg-[#f0eee2]">
                          <Link to={`/category/${category.name.toLowerCase()}`}>
                            {category.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">No categories found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {user && (
              <div className="space-y-2">
                <Link
                  to={user.isAdmin ? "/admin/dashboard" : "/dashboard"}
                  onClick={() => setMenuOpen(false)}
                  className="block text-[#4B4A44]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-left text-[#4B4A44]"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
