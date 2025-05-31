import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Cache configuration
const cache = {
  data: new Map(),
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
};

// Rate limiting configuration
const rateLimitConfig = {
  maxRetries: 3,
  initialDelay: 2000, // 2 seconds
  maxDelay: 10000, // 10 seconds
};

// Helper function to get cache key
const getCacheKey = (url, params) => {
  return `${url}${params ? JSON.stringify(params) : ''}`;
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp) => {
  return timestamp && Date.now() - timestamp < cache.CACHE_DURATION;
};

// Helper function to calculate delay with exponential backoff
const calculateDelay = (retryCount) => {
  const delay = Math.min(
    rateLimitConfig.initialDelay * Math.pow(2, retryCount),
    rateLimitConfig.maxDelay
  );
  return delay;
};

// Main request function with caching and retry logic
export const makeRequest = async (config, retryCount = 0) => {
  const { url, method = 'GET', params, data, useCache = true } = config;
  const cacheKey = getCacheKey(url, params);

  // Check cache for GET requests
  if (useCache && method === 'GET') {
    const cachedData = cache.data.get(cacheKey);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
  }

  try {
    const response = await apiClient({
      url,
      method,
      params,
      data,
    });

    // Cache successful GET responses
    if (useCache && method === 'GET') {
      cache.data.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response.data;
  } catch (error) {
    // Handle rate limiting
    if (error.response?.status === 429 && retryCount < rateLimitConfig.maxRetries) {
      const delay = calculateDelay(retryCount);
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${rateLimitConfig.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeRequest(config, retryCount + 1);
    }

    // If we have cached data and the request failed, return cached data
    if (useCache && method === 'GET') {
      const cachedData = cache.data.get(cacheKey);
      if (cachedData) {
        console.log('Using cached data due to request failure');
        return cachedData.data;
      }
    }

    throw error;
  }
};

// Convenience methods
export const get = (url, params, useCache = true) => {
  return makeRequest({ url, method: 'GET', params, useCache });
};

export const post = (url, data) => {
  return makeRequest({ url, method: 'POST', data, useCache: false });
};

export const put = (url, data) => {
  return makeRequest({ url, method: 'PUT', data, useCache: false });
};

export const del = (url) => {
  return makeRequest({ url, method: 'DELETE', useCache: false });
}; 