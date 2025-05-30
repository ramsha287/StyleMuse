import axios from './axiosConfig';

export const fetchOrders = async () => {
  const response = await axios.get('/orders');
  return response.data;
};

export const fetchOrderById = async (id) => {
  const response = await axios.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axios.put(`/orders/${id}`, { status });
  return response.data;
};