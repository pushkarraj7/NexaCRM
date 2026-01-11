const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Items
  ITEMS: `${API_BASE_URL}/api/items`,
  
  // Agreements
  AGREEMENTS: `${API_BASE_URL}/api/agreements`,
  
  // Customer Items
  CUSTOMER_ITEMS: `${API_BASE_URL}/api/customer-items`,
  
  // Customers
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  
  // Proforma
  PROFORMA: `${API_BASE_URL}/api/proforma`,
  
  // Invoices
  INVOICES: `${API_BASE_URL}/api/invoices`,
};

export default API_BASE_URL;