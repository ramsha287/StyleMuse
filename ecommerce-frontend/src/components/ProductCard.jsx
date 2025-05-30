import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-bold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
      <Link
        to={`/product/${product.id}`}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;