// Centralized API and WebSocket configuration for MedVault
// Automatically picks up environment variables in production (Vercel, Netlify, Render)
// and gracefully falls back to localhost:5000 in local development.

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE_URL).replace(/\/+$/, '');

export default {
  API_BASE_URL,
  SOCKET_URL,
};
