// api/summary.js
import axios from './axiosConfig';

export const fetchSummary = async () => {
  const response = await axios.get('/summary');
  return response.data;
};
