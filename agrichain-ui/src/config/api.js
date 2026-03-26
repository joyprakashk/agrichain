// src/config/api.js

/**
 * Get the current hostname (where the frontend is running)
 * This could be:
 * - localhost (when running on laptop)
 * - 192.168.x.x (when accessed from phone on same network)
 */
const currentHostname = window.location.hostname;

/**
 * Dynamically determine the backend URL based on frontend location
 */
const getBackendUrl = () => {
  // If we're on localhost (development on laptop)
  if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
    // Try to use the VITE_LAN_IP from .env if available
    const lanIp = import.meta.env.VITE_LAN_IP;
    if (lanIp) {
      console.log(`🔧 Using LAN IP from .env: ${lanIp} for backend`);
      return `http://${lanIp}:8080`;
    }
    // Fallback to localhost
    console.log('🔧 Using localhost for backend API');
    return 'http://localhost:8080';
  }
  
  // If we're on network (phone accessing), use the same IP as the frontend
  // This ensures the phone can reach the backend on the same network IP
  console.log(`📱 Phone detected, using network IP: ${currentHostname} for backend`);
  return `http://${currentHostname}:8080`;
};

// Determine environment and get the dynamic backend URL
const environment = process.env.NODE_ENV || 'development';
const DYNAMIC_BASE_URL = getBackendUrl();

console.log(`🌐 Environment: ${environment}`);
console.log(`🌐 Backend API URL: ${DYNAMIC_BASE_URL}`);
console.log(`🌐 Frontend hostname: ${currentHostname}`);

// Export the base URL
export const API_BASE_URL = DYNAMIC_BASE_URL;
export const API_TIMEOUT = 10000; // 10 seconds timeout

// API endpoints with full URLs
export const ENDPOINTS = {
  // Farmer endpoints
  FARMER_REGISTER: `${DYNAMIC_BASE_URL}/api/farmers/register`,
  FARMER_LOGIN: `${DYNAMIC_BASE_URL}/api/verifyToken`,
  FARMER_DASHBOARD: `${DYNAMIC_BASE_URL}/api/farmer/dashboard`,
  REGISTER_PRODUCE: `${DYNAMIC_BASE_URL}/api/farmer/register-produce`,
  
  // Consumer endpoints
  CONSUMER_REGISTER: `${DYNAMIC_BASE_URL}/api/consumer/register`,
  
  // Order endpoints
  PLACE_ORDER: `${DYNAMIC_BASE_URL}/api/orders/place`,
  GET_QR_CODE: (orderId, consumerEmail) => `${DYNAMIC_BASE_URL}/api/orders/${orderId}/qr?consumerEmail=${consumerEmail}`,
  TRACE_ORDER: (traceId) => `${DYNAMIC_BASE_URL}/api/trace/${encodeURIComponent(traceId)}`,
  
  // QR Code endpoints
  QR_CODES: `${DYNAMIC_BASE_URL}/api/qr-codes`,
  TEST_QR: `${DYNAMIC_BASE_URL}/api/test/qr`,
  CREATE_TEST_TRACE: `${DYNAMIC_BASE_URL}/api/test/create-trace`,
  
  // Market endpoints
  ALL_PRODUCE: `${DYNAMIC_BASE_URL}/api/market/all-produce`,
  
  // Upload endpoint
  UPLOAD_IMAGE: `${DYNAMIC_BASE_URL}/api/upload`,
  
  // Admin endpoints
  ADMIN_BASE: `${DYNAMIC_BASE_URL}/api/admin`,
};

// Helper function to make API calls with error handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export default { API_BASE_URL, API_TIMEOUT, ENDPOINTS, apiCall };