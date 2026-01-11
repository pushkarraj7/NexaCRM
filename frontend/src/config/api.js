// src/config/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: API_BASE_URL,
  
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  CUSTOMER_LOGIN: `${API_BASE_URL}/api/auth/customer-login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  REGISTER_CUSTOMER: `${API_BASE_URL}/api/auth/register-customer`,
  
  // Customer management (auth routes)
  CUSTOMERS: `${API_BASE_URL}/api/auth/customers`, // ✅ Correct endpoint for your backend

  // Items
  ITEMS: `${API_BASE_URL}/api/items`,

  // Agreements
  AGREEMENTS: `${API_BASE_URL}/api/agreements`,

  // Customer Items
  CUSTOMER_ITEMS: `${API_BASE_URL}/api/customer-items`,

  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,

  // Proforma
  PROFORMA: `${API_BASE_URL}/api/proforma`,

  // Invoices
  INVOICES: `${API_BASE_URL}/api/invoices`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export default API_BASE_URL;