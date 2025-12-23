// In your frontend, create a helper file: src/api/config.js
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api'; // When deployed, use relative path

export const fetchApi = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};