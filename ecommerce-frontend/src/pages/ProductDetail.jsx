import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = process.env.REACT_APP_API_URL;

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product data
        const productRes = await fetch(`${API_URL}/api/products/${id}`);
        if (!productRes.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await productRes.json();
        setProduct(productData.product);

        // Only fetch wishlist if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const wishlistRes = await fetch(`${API_URL}/api/wishlist`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (wishlistRes.ok) {
              const wishlistData = await wishlistRes.json();
              setInWishlist(wishlistData.wishlist?.items?.some(item => item.product._id === id) || false);
            }
          } catch (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError);
            toast.error('Failed to fetch wishlist status');
          }
        }
      } catch (err) {
        console.error('Failed to load product or wishlist:', err);
        setError(err.message);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleWishlist = async () => {
    const nextWishlistState = !inWishlist;
    setInWishlist(nextWishlistState);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please login to add items to wishlist');
      return;
    }

    try {
      if (nextWishlistState) {
        // Add to wishlist
        await fetch(`${API_URL}/api/wishlist/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: id }),
        });
        toast.success('Added to wishlist');
      } else {
        // Remove from wishlist
        await fetch(`${API_URL}/api/wishlist/items/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      console.error('Wishlist update failed:', err);
      setInWishlist(!nextWishlistState);
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Please select a size before adding to cart');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please login to add items to cart');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          quantity,
          size: selectedSize,
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMsg = 'Failed to add to cart';
        if (contentType && contentType.includes('application/json')) {
          const errData = await res.json();
          errorMsg = errData.message || errorMsg;
        } else {
          errorMsg = await res.text();
        }
        toast.error(errorMsg);
        return;
      }

      toast.success('Added to cart successfully');
      setShowCartModal(true);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prevIndex) => {
      const totalMedia = product.images.length + (product.video ? 1 : 0);
      return prevIndex === totalMedia - 1 ? 0 : prevIndex + 1;
    });
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prevIndex) => {
      const totalMedia = product.images.length + (product.video ? 1 : 0);
      return prevIndex === 0 ? totalMedia - 1 : prevIndex - 1;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b9b4a8] mx-auto mb-4"></div>
            <p className="text-xl text-stone">Loading product details...</p>
          </div>
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
          <div className="text-center">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <Link
              to="/products"
              className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition"
            >
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-stone mb-4">Product not found</p>
            <Link
              to="/products"
              className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition"
            >
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
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
      <div className="flex-1 flex items-center justify-center py-10 px-2">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden">
          {/* Media Carousel */}
          <div className="md:w-1/2 flex flex-col items-center justify-center bg-gray-50 p-6 min-h-[320px] relative">
            {/* Main Media */}
            <div className="relative w-full h-80 flex items-center justify-center">
              {currentMediaIndex < product.images.length ? (
                <img
                  src={`${API_URL}/uploads/${product.images[currentMediaIndex]}`}
                  alt={product.name}
                  className="rounded-xl max-h-80 w-auto object-contain mx-auto"
                  style={{ maxWidth: '100%' }}
                />
              ) : product.video && (
                <video
                  src={`${API_URL}/uploads/${product.video}`}
                  controls
                  className="rounded-xl max-h-80 w-auto object-contain mx-auto"
                  style={{ maxWidth: '100%' }}
                />
              )}
              
              {/* Navigation Buttons */}
              {(product.images.length > 1 || product.video) && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition"
                    aria-label="Previous media"
                  >
                    <FaChevronLeft className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition"
                    aria-label="Next media"
                  >
                    <FaChevronRight className="text-gray-600" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {(product.images.length > 1 || product.video) && (
              <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      currentMediaIndex === index ? 'border-[#b9b4a8]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={`${API_URL}/uploads/${image}`}
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {product.video && (
                  <button
                    onClick={() => setCurrentMediaIndex(product.images.length)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      currentMediaIndex === product.images.length ? 'border-[#b9b4a8]' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-3">
                <h1 className="text-3xl font-bold text-[#4B4A44] mr-3">{product.name}</h1>
                <button
                  onClick={handleWishlist}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className="text-2xl focus:outline-none transition"
                >
                  <FaHeart className={`${inWishlist ? 'text-red-500' : 'text-[#b9b4a8]'} transition-colors duration-300`} />
                </button>
              </div>
              <p className="text-base text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-[#b9b4a8] mr-3">₹{product.price}</span>
                {product.discount > 0 && (
                  <span className="text-lg text-red-500 line-through">₹{product.price + product.discount}</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-[#605F57]">Brand:</span> {product.brand?.name || product.brand}
              </div>
              {/* Size Selector */}
              <div className="mb-4 mt-6">
                <span className="font-semibold text-[#605F57] mr-2">Size:</span>
                <div className="inline-flex gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      className={`px-3 py-1 rounded-full border font-semibold transition ${
                        selectedSize === size
                          ? 'bg-[#b9b4a8] text-white border-[#b9b4a8]'
                          : 'bg-white text-[#605F57] border-[#b9b4a8] hover:bg-[#dbd5c5]'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <span className="font-semibold text-[#605F57] mr-2">Quantity:</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2 py-1 border border-[#b9b4a8] rounded-md text-center"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                to="/products"
                className="bg-[#dbd5c5] text-[#605F57] px-5 py-2 rounded-full font-semibold shadow hover:bg-[#e2dfd1] transition"
              >
                Back to Products
              </Link>
              <button
                onClick={handleAddToCart}
                className="bg-[#b9b4a8] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#a29e92] transition disabled:opacity-60"
                disabled={!selectedSize}
                title={!selectedSize ? "Select a size" : ""}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-[#4B4A44]">Product added to cart!</h2>
            <div className="flex flex-col gap-3">
              <Link
                to="/cart"
                className="bg-[#b9b4a8] text-white px-4 py-2 rounded font-semibold hover:bg-[#a29e92] transition"
              >
                Go to Cart
              </Link>
              <button
                onClick={() => setShowCartModal(false)}
                className="bg-[#dbd5c5] text-[#605F57] px-4 py-2 rounded font-semibold hover:bg-[#e2dfd1] transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetail;
