import axios from 'axios';

// Create an Axios instance with default configurations
const api = axios.create({
  baseURL: 'http://localhost:8080', // Base URL for the API
  headers: {
    'Content-Type': 'application/json', // Set default content type
    Accept: 'application/json', // Set default accept header
  },
  withCredentials: true, // Enable credentials for cross-origin requests (important for sessions)
});

// Response interceptor to handle API errors
api.interceptors.response.use(
  (response) => response, // Return successful responses as they are
  (error) => {
    // Log the error details to the console
    console.error('API Error:', error.response?.data || error.message);
    // Reject the promise to propagate the error up the call stack
    return Promise.reject(error);
  },
);

export default api;