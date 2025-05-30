import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;

const Products = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = `${API_URL}/api/products`;
        
        if (categoryName) {
          // Format category name: capitalize first letter and replace hyphens with spaces
          const formattedCategoryName = categoryName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          url = `${API_URL}/api/products/category/${formattedCategoryName}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            toast.error('Category not found');
            navigate('/products');
            return;
          }
          throw new Error(data.message || 'Failed to fetch products');
        }

        // Handle both response formats
        if (data.products) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8 text-[#4B4A44] text-center capitalize">
          {categoryName ? categoryName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : "All Products"}
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-[#4B4A44]">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.length === 0 ? (
              <p className="col-span-3 text-center text-[#4B4A44]">No products found.</p>
            ) : (
              products.map((prod) => (
                <div key={prod._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">
                  <div className="h-64 w-full flex items-center justify-center bg-gray-50">
                    <img
                      src={prod.images && prod.images.length > 0 ? `${API_URL}/uploads/${prod.images[0]}` : "https://via.placeholder.com/400x300"}
                      alt={prod.name}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl text-[#605F57] font-bold mb-2">{prod.name}</h3>
                    <p className="text-gray-600 text-[#605F57] mb-4 line-clamp-3">
                      {prod.description}
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
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;