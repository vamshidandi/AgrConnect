// API Configuration for Agri-AI Frontend
const API_BASE_URL = 'http://localhost:8001';

export const API_ENDPOINTS = {
  // Disease Detection
  PREDICT_DISEASE: `${API_BASE_URL}/predict/`,
  
  // Products
  GET_PRODUCTS: `${API_BASE_URL}/products/`,
  CREATE_PRODUCT: `${API_BASE_URL}/products/`,
  GET_PRODUCT: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Pesticides
  GET_PESTICIDES: `${API_BASE_URL}/pesticides/`,
  
  // Database seeding (for development)
  SEED_DATA: `${API_BASE_URL}/seed-data/`,
};

// API Helper Functions
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default API_BASE_URL;