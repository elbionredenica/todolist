import api from './api';

describe('API Module', () => {
  test('should create an axios instance with the correct configuration', () => {
    // Check if the base URL is configured correctly
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
    // Check if the Content-Type header is set correctly
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    // Check if the Accept header is set correctly
    expect(api.defaults.headers.Accept).toBe('application/json');
    // Check if withCredentials is enabled (for cross-origin requests and sessions)
    expect(api.defaults.withCredentials).toBe(true);
  });
});