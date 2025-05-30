import axios from './axiosConfig';

export const fetchCart = async () => {
  const response = await axios.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const response = await axios.post('/cart', { productId, quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await axios.delete(`/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete('/cart');
  return response.data;
};