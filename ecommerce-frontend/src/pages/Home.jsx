import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import bgImage from "../assets/wallpaperwebsite.png";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL:', API_URL);

const Home = () => {
  const [products, setProducts] = useState([]);

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then((res) => {
        const data = res.data;
        setProducts(
          Array.isArray(data.products)
            ? data.products.slice(0, 3)
            : (Array.isArray(data) ? data.slice(0, 3) : [])
        );
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="text-center text-white rounded-lg">
          <h1
            className="text-5xl font-tangerine font-bold mb-6 text-[#4B4A44]"
            style={{ textShadow: '2px 2px 5px white' }}
          >
            Fashion That Finds You, Perfectly.
          </h1>

          <Link to="/products" className="bg-[#dbd5c5] text-[#605F57] px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#e2dfd1] transition shadow-lg">
            Browse Now
          </Link>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#4B4A44]">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <p className="col-span-3 text-center">No products found.</p>
          ) : (
            products.map((prod) => (
              <div key={prod._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">
                <div className="h-64 w-full flex items-center justify-center bg-gray-50">
                  <img
                    src={prod.images && prod.images.length > 0
                      ? `${API_URL}/uploads/${prod.images[0]}`
                      : "https://via.placeholder.com/400x300"}
                    alt={prod.name}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl text-[#605F57] font-bold mb-2">{prod.name}</h3>
                  <p className="text-gray-600 text-[#605F57] mb-4 line-clamp-3">
                    {truncateText(prod.description)}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-lg font-semibold text-[#b9b4a8]">₹{prod.price}</span>
                    <Link
                      to={`/product/${prod._id}`}
                      className="bg-[#b9b4a8] text-white px-3 py-1 rounded hover:bg-[#9d9d95] transition font-bold inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
