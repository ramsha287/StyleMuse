import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
const API_URL = process.env.REACT_APP_API_URL;

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${API_URL}/api/wishlist/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch wishlist');
        }
        const items = data?.data?.wishlist?.items || [];
        // Filter out any null products and ensure we have valid data
        const validProducts = items
          .map(item => item.product)
          .filter(product => product && typeof product === 'object');
        setWishlist(validProducts);
      } catch (err) {
        setError(err.message || 'Failed to load wishlist');
        toast.error(err.message || 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token]);

  // Remove from wishlist handler
  const handleRemove = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
      setWishlist(wishlist.filter(prod => prod._id !== productId));
      toast.success('Item removed from wishlist');
    } catch (err) {
      toast.error(err.message || 'Failed to remove from wishlist');
    }
  };

  // Clear wishlist handler
  const handleClearWishlist = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }
      setWishlist([]);
      toast.success('Wishlist cleared successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-stone">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="container mx-auto py-10 flex-1">
        <h1 className="text-2xl font-bold mb-6 text-[#4B4A44] text-center">Your Wishlist</h1>
        {wishlist.length === 0 ? (
          <p className="text-gray-600 text-center">Your wishlist is empty. Save your favorite items here!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 ml-4">
            {wishlist.map((prod) => (
              <div key={prod._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition relative">
                <button
                  className="absolute top-4 right-4 text-2xl focus:outline-none"
                  onClick={() => handleRemove(prod._id)}
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <FaHeart color="red" fill="red" />
                </button>
                <img
                  src={prod.images?.[0] ? `${API_URL}/uploads/${prod.images[0]}` : "https://via.placeholder.com/400x300"}
                  alt={prod.name || 'Product image'}
                  className="w-full h-60 object-contain bg-gray-100"
                />
                <div className="p-6">
                  <h3 className="text-xl text-[#605F57] font-bold mb-2">{prod.name || 'Unnamed Product'}</h3>
                  <p className="text-gray-600 text-[#605F57] mb-4">{prod.description || 'No description available'}</p>
                  <p className="font-bold mb-2">₹{prod.price || '0.00'}</p>
                  <Link
                    to={`/product/${prod._id}`}
                    className="bg-[#b9b4a8] text-white px-4 py-2 rounded hover:bg-[#9d9d95] transition font-bold inline-block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {wishlist.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="bg-[#b9b4a8] text-white px-4 py-2 rounded hover:bg-[#9d9d95] transition font-bold inline-block mt-4 ml-4"
          >
            Clear Wishlist
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;