// src/config/api.js
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8080',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://api.agrichain.com', // Replace with your production API URL
    timeout: 15000,
  }
};

const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;

// API endpoints
export const ENDPOINTS = {
  // Farmer endpoints
  FARMER_REGISTER: '/api/farmers/register',
  FARMER_LOGIN: '/api/verifyToken',
  FARMER_DASHBOARD: '/api/farmer/dashboard',
  REGISTER_PRODUCE: '/api/farmer/register-produce',
  
  // Consumer endpoints
  CONSUMER_REGISTER: '/api/consumer/register',
  
  // Order endpoints
  PLACE_ORDER: '/api/orders/place',
  GET_QR_CODE: '/api/orders',
  TRACE_ORDER: '/api/trace',
  
  // Market endpoints
  ALL_PRODUCE: '/api/market/all-produce',
  
  // Upload endpoint
  UPLOAD_IMAGE: '/api/upload'
};

export default config;