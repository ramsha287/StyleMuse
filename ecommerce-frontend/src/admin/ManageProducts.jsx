import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const API_URL = process.env.REACT_APP_API_URL;

export default function AdminManageProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    description: '',
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productArray = Array.isArray(res.data) ? res.data : res.data.products || [];
      setProducts(productArray);
      setFilteredProducts(productArray);
    } catch (e) {
      console.error('Fetch products error:', e);
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      // Use data.categories if it exists, otherwise fallback to an empty array
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get('/api/brands');
      setBrands(Array.isArray(data.brands) ? data.brands : []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewImagesChange = (e) => {
    setSelectedImages([...e.target.files]);
  };

  const handleNewVideoChange = (e) => {
    setSelectedVideo(e.target.files[0]);
  };

  const addProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.stock ||
      !newProduct.category ||
      !newProduct.brand ||
      !newProduct.description ||
      selectedImages.length === 0
    ) {
      toast.warning('Fill all fields and upload at least one image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('stock', newProduct.stock);
      formData.append('category', newProduct.category);
      formData.append('brand', newProduct.brand);
      formData.append('description', newProduct.description);

      // Add images with size check
      for (const file of selectedImages) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit for images
          toast.error(`Image ${file.name} is too large. Maximum size is 5MB.`);
          return;
        }
        formData.append('images', file);
      }

      // Add video with size check
      if (selectedVideo) {
        if (selectedVideo.size > 50 * 1024 * 1024) { // 50MB limit for videos
          toast.error(`Video ${selectedVideo.name} is too large. Maximum size is 50MB.`);
          return;
        }
        formData.append('video', selectedVideo);
      }

      const response = await axios.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        maxContentLength: 100 * 1024 * 1024, // 100MB
        maxBodyLength: 100 * 1024 * 1024, // 100MB
        timeout: 30000, // 30 seconds timeout
      });

      if (response.data.success) {
        toast.success('Product added successfully');
        setNewProduct({
          name: '',
          price: '',
          stock: '',
          category: '',
          brand: '',
          description: '',
        });
        setSelectedImages([]);
        setSelectedVideo(null);
        fetchProducts();
      } else {
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (e) {
      console.error('Add product error:', e);
      if (e.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(e.response.data.message || 'Failed to add product');
      } else if (e.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(e.message || 'Failed to add product');
      }
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast.warning('Enter a category name');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/categories',
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Category added successfully');
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      console.error('Add category error:', err);
      toast.error('Failed to add category');
    }
  };

  const addBrand = async () => {
    if (!newBrand.trim()) {
      toast.warning('Enter a brand name');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/brands',
        { name: newBrand },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Brand added successfully');
      setNewBrand('');
      fetchBrands();
    } catch (err) {
      console.error('Add brand error:', err);
      toast.error('Failed to add brand');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (e) {
      console.error('Delete error:', e);
      toast.error('Failed to delete product');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      toast.error('Failed to delete category');
    }
  };
  const confirmDelete = () => {
    return new Promise((resolve) => {
      const ToastContent = ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this brand?</p>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              No
            </button>
          </div>
        </div>
      );
  
      toast(<ToastContent />, {
        closeOnClick: false,
        closeButton: false,
        autoClose: false,
        draggable: false,
      });
    });
  };

  const deleteBrand = async (id) => {
    const confirm = await confirmDelete();
    if (!confirm) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (err) {
      console.error('Delete brand error:', err);
      toast.error('Failed to delete brand');
    }
  };

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
      <h2 className="text-3xl font-bold mb-8 text-stone text-center mt-8">Manage Products</h2>

      {/* Categories Section */}
      <section className="mb-8 px-4">
        <h3 className="text-2xl font-semibold text-stone mb-4">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Category */}
          <div className="bg-beige p-4 rounded border">
            <h4 className="font-semibold mb-2">Add Category</h4>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name"
              className="p-2 border rounded w-full mb-2"
            />
            <button onClick={addCategory} className="p-2 bg-stone text-white rounded w-full">
              Add Category
            </button>
          </div>

          {/* Existing Categories */}
          <div className="bg-beige p-4 rounded border">
            <h4 className="font-semibold mb-2">Existing Categories</h4>
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories found</p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <span className="text-stone">{category.name}</span>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      className="p-1 text-stone"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="mb-8 px-4">
        <h3 className="text-2xl font-semibold text-stone mb-4">Brands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Brand */}
          <div className="bg-beige p-4 rounded border">
            <h4 className="font-semibold mb-2">Add Brand</h4>
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="Brand name"
              className="p-2 border rounded w-full mb-2"
            />
            <button onClick={addBrand} className="p-2 bg-stone text-white rounded w-full">
              Add Brand
            </button>
          </div>

          {/* Existing Brands */}
          <div className="bg-beige p-4 rounded border">
            <h4 className="font-semibold mb-2">Existing Brands</h4>
            {brands.length === 0 ? (
              <p className="text-gray-500">No brands found</p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {brands.map((brand) => (
                  <div key={brand._id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <span className="text-stone">{brand.name}</span>
                    <button
                      onClick={() => deleteBrand(brand._id)}
                      className="p-1 text-stone"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add Product */}
      <section className="bg-beige p-6 rounded-lg border border-stone mb-12 ml-4">
        <h3 className="text-stone text-xl mb-4">Add New Product</h3>

        <input
          type="text"
          id="product-name"
          name="name"
          autoComplete="off"
          value={newProduct.name}
          onChange={handleNewProductChange}
          placeholder="Product Name"
          className="p-2 rounded border border-gray-300 w-full mb-3"
        />
        <input
          type="number"
          id="product-price"
          name="price"
          autoComplete="off"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleNewProductChange}
          className="p-2 rounded border border-gray-300 w-full mb-3"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={handleNewProductChange}
          className="p-2 rounded border border-gray-300 w-full mb-3"
        />

        <select
          name="category"
          value={newProduct.category}
          onChange={handleNewProductChange}
          className="p-2 rounded border border-gray-300 w-full mb-3"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="brand"
          value={newProduct.brand}
          onChange={handleNewProductChange}
          className="p-2 rounded border border-gray-300 w-full mb-3"
        >
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleNewProductChange}
          rows={3}
          className="p-2 rounded border border-gray-300 w-full mb-4"
        />

        <div className="mb-4">
          <label>
            Upload Images:
            <input type="file" multiple accept="image/*" onChange={handleNewImagesChange} className="block mt-2" />
          </label>
        </div>
        <div className="mb-4">
          <label>
            Upload Video:
            <input type="file" accept="video/*" onChange={handleNewVideoChange} className="block mt-2" />
          </label>
        </div>

        <button onClick={addProduct} className="p-3 bg-stone text-white rounded">
          Add Product
        </button>
      </section>

      {/* Search */}
      <section className="mb-6 ml-4">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded border border-gray-300 w-full max-w-md"
        />
      </section>

      {/* Products List */}
      <section>
        <h3 className="text-stone text-xl mb-4 ml-4">Existing Products</h3>
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid gap-6 ml-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {currentProducts.map((prod) => (
              
              <div key={prod._id} className="bg-beige p-4 rounded-lg border border-stone flex flex-col">
                {prod.images && prod.images.length > 0 ? (
                  <img
                    src={`${API_URL}/uploads/${prod.images[0]}`}
                    alt={prod.name}
                    className="mb-2"
                  />
                ) : (
                  <div className="mb-2 bg-gray-200 text-center text-gray-500 py-8 rounded">
                    No image
                  </div>
                )}
    
                <h4 className="text-stone font-semibold mb-2 truncate">{prod.name}</h4>
                <p className="mb-1">Price: ${prod.price}</p>
                <p className="mb-1">Stock: {prod.stock}</p>
                <p className="mb-1">Category: {prod.category?.name || prod.category}</p>
                <p className="mb-1">Brand: {prod.brand?.name || prod.brand}</p>
                <p className="mb-2 text-sm line-clamp-3">{prod.description}</p>
                <button onClick={() => deleteProduct(prod._id)} className="mt-auto p-2 bg-stone text-white rounded">
                  Delete Product
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? 'bg-stone text-white' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
