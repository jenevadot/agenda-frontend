import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

/**
 * Axios client configured for the Agenda Salon API
 * - BaseURL from environment variable VITE_API_URL
 * - 10 second timeout
 * - Auto-injects JWT token in Authorization header
 * - Auto-handles 401 errors by clearing session
 */
const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
clienteApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session on unauthorized
      useAuthStore.getState().cerrarSesion();
    }
    return Promise.reject(error);
  }
);

export default clienteApi;
