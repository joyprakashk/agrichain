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
  // ============================
  // FARMER ENDPOINTS
  // ============================
  FARMER_REGISTER: `${DYNAMIC_BASE_URL}/api/farmers/register`,
  FARMER_LOGIN: `${DYNAMIC_BASE_URL}/api/verifyToken`,
  FARMER_DASHBOARD: `${DYNAMIC_BASE_URL}/api/farmer/dashboard`,
  REGISTER_PRODUCE: `${DYNAMIC_BASE_URL}/api/farmer/register-produce`,
  UPDATE_PACKAGED: `${DYNAMIC_BASE_URL}/api/farmer/update-packaged`,
  TRANSFER_TO_RETAILER: `${DYNAMIC_BASE_URL}/api/farmer/transfer-to-retailer`,
  
  // ============================
  // RETAILER ENDPOINTS
  // ============================
  RETAILER_REGISTER: `${DYNAMIC_BASE_URL}/api/retailer/register`,
  RETAILER_LOGIN: `${DYNAMIC_BASE_URL}/api/retailer/login`,
  RETAILER_DETAILS: (email) => `${DYNAMIC_BASE_URL}/api/retailer/${email}`,
  RETAILERS_ALL: `${DYNAMIC_BASE_URL}/api/retailers/all`,
  RETAILER_PRODUCE: (email) => `${DYNAMIC_BASE_URL}/api/retailer/${email}/produce`,
  RETAILER_RECEIVE_PRODUCE: `${DYNAMIC_BASE_URL}/api/retailer/receive-produce`,
  RETAILER_STORE_PRODUCE: `${DYNAMIC_BASE_URL}/api/retailer/store-produce`,
  RETAILER_LIST_PRODUCE: `${DYNAMIC_BASE_URL}/api/retailer/list-produce`,
  
  // ============================
  // CONSUMER ENDPOINTS
  // ============================
  CONSUMER_REGISTER: `${DYNAMIC_BASE_URL}/api/consumer/register`,
  CONSUMER_LOGIN: `${DYNAMIC_BASE_URL}/api/consumer/login`,
  
  // ============================
  // ORDER ENDPOINTS
  // ============================
  PLACE_ORDER: `${DYNAMIC_BASE_URL}/api/orders/place`,
  GET_QR_CODE: (orderId, consumerEmail) => `${DYNAMIC_BASE_URL}/api/orders/${orderId}/qr?consumerEmail=${consumerEmail}`,
  
  // ============================
  // QR CODE ENDPOINTS
  // ============================
  QR_CODES: `${DYNAMIC_BASE_URL}/api/qr-codes`,
  TEST_QR: `${DYNAMIC_BASE_URL}/api/test/qr`,
  CREATE_TEST_TRACE: `${DYNAMIC_BASE_URL}/api/test/create-trace`,
  
  // ============================
  // MARKET ENDPOINTS
  // ============================
  ALL_PRODUCE: `${DYNAMIC_BASE_URL}/api/market/all-produce`,
  AVAILABLE_PRODUCE: `${DYNAMIC_BASE_URL}/api/market/available-produce`,
  
  // ============================
  // TRACE/VERIFICATION ENDPOINTS
  // ============================
  TRACE_ORDER: (traceId) => `${DYNAMIC_BASE_URL}/api/trace/${encodeURIComponent(traceId)}`,
  
  // ============================
  // UPLOAD ENDPOINT
  // ============================
  UPLOAD_IMAGE: `${DYNAMIC_BASE_URL}/api/upload`,
  
  // ============================
  // ADMIN ENDPOINTS
  // ============================
  ADMIN_BASE: `${DYNAMIC_BASE_URL}/api/admin`,
  
  // ============================
  // SUPPLY CHAIN ENDPOINTS
  // ============================
  UPDATE_PRODUCE_STATUS: `${DYNAMIC_BASE_URL}/api/produce/update-status`,
  GET_SUPPLY_CHAIN_EVENTS: (traceId) => `${DYNAMIC_BASE_URL}/api/supply-chain/${traceId}/events`,
  
  // ============================
  // AUTH HELPER ENDPOINTS
  // ============================
  VERIFY_TOKEN: `${DYNAMIC_BASE_URL}/api/verifyToken`,
  REFRESH_TOKEN: `${DYNAMIC_BASE_URL}/api/refresh-token`,
  LOGOUT: `${DYNAMIC_BASE_URL}/api/logout`,
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

// Helper function for authenticated API calls
export const authApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const authOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  };
  
  return apiCall(endpoint, authOptions);
};

// Helper function for file uploads
export const uploadFile = async (file, endpoint = ENDPOINTS.UPLOAD_IMAGE) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Helper function to get supply chain stage name
export const getStageName = (stageCode) => {
  const stages = {
    'harvested': 'Harvested',
    'packaged': 'Packaged',
    'inTransitToRetailer': 'In Transit to Retailer',
    'receivedByRetailer': 'Received by Retailer',
    'storedInRetail': 'Stored in Retail',
    'listedForSale': 'Listed for Sale',
    'purchased': 'Purchased',
    'delivered': 'Delivered',
    'completed': 'Completed'
  };
  return stages[stageCode] || stageCode;
};

// Helper function to get stage color for UI
export const getStageColor = (stageCode) => {
  const colors = {
    'harvested': 'bg-purple-100 text-purple-800',
    'packaged': 'bg-blue-100 text-blue-800',
    'inTransitToRetailer': 'bg-yellow-100 text-yellow-800',
    'receivedByRetailer': 'bg-orange-100 text-orange-800',
    'storedInRetail': 'bg-cyan-100 text-cyan-800',
    'listedForSale': 'bg-indigo-100 text-indigo-800',
    'purchased': 'bg-green-100 text-green-800',
    'delivered': 'bg-emerald-100 text-emerald-800',
    'completed': 'bg-gray-100 text-gray-800'
  };
  return colors[stageCode] || 'bg-gray-100 text-gray-800';
};

// Helper function to get stage icon
export const getStageIcon = (stageCode) => {
  const icons = {
    'harvested': '🌾',
    'packaged': '📦',
    'inTransitToRetailer': '🚚',
    'receivedByRetailer': '🏪',
    'storedInRetail': '❄️',
    'listedForSale': '🏷️',
    'purchased': '🛒',
    'delivered': '✅',
    'completed': '🎉'
  };
  return icons[stageCode] || '📍';
};

// Helper function to get actor for each stage
export const getStageActor = (stageCode) => {
  const actors = {
    'harvested': 'Farmer',
    'packaged': 'Farmer',
    'inTransitToRetailer': 'Logistics',
    'receivedByRetailer': 'Retailer',
    'storedInRetail': 'Retailer',
    'listedForSale': 'Retailer',
    'purchased': 'Consumer',
    'delivered': 'Consumer',
    'completed': 'System'
  };
  return actors[stageCode] || 'System';
};

// Store user session data
export const setUserSession = (userType, userData, token) => {
  localStorage.setItem('userType', userType);
  localStorage.setItem('userData', JSON.stringify(userData));
  if (token) localStorage.setItem('authToken', token);
  
  // Store specific user email for easy access
  if (userData.email) {
    localStorage.setItem(`${userType}Email`, userData.email);
  }
};

// Clear user session
export const clearUserSession = () => {
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  localStorage.removeItem('farmerEmail');
  localStorage.removeItem('retailerEmail');
  localStorage.removeItem('consumerEmail');
};

// Get current user session
export const getCurrentUser = () => {
  const userType = localStorage.getItem('userType');
  const userData = localStorage.getItem('userData');
  
  if (userType && userData) {
    return {
      userType,
      userData: JSON.parse(userData)
    };
  }
  return null;
};

export default { 
  API_BASE_URL, 
  API_TIMEOUT, 
  ENDPOINTS, 
  apiCall, 
  authApiCall, 
  uploadFile,
  getStageName,
  getStageColor,
  getStageIcon,
  getStageActor,
  setUserSession,
  clearUserSession,
  getCurrentUser
};