export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  CRYPTO: {
    PRICES: `${API_BASE_URL}/api/crypto/prices`,
  },
  ALERTS: {
    CREATE: `${API_BASE_URL}/api/alerts/create`,
    GET_MY_ALERTS: `${API_BASE_URL}/api/alerts/me`,
    DELETE: (id: number) => `${API_BASE_URL}/api/alerts/${id}`,
  },
};
