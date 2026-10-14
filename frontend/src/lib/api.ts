import axios from 'axios';

const resolveBaseUrl = () => {
  let raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  raw = raw.trim();
  if (raw.endsWith('/')) raw = raw.slice(0, -1);
  if (!raw.endsWith('/api')) raw = `${raw}/api`;
  return raw;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {}
    }
  }
  return config;
});

// Handle 401 globally — redirect to login only when token/session is truly invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || '';
      const msg = (error.response?.data?.message || '').toLowerCase();
      const pathname = window.location.pathname;

      // Do NOT log out user if the error is from payment or non-auth endpoints
      const isPaymentCall = url.includes('/payments/');
      const isAuthError =
        msg.includes('token') ||
        msg.includes('not authorized') ||
        msg.includes('deactivated') ||
        url.includes('/users/me') ||
        url.includes('/auth/');

      if (!isPaymentCall && isAuthError && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        localStorage.removeItem('auth-storage');
        const redirect = encodeURIComponent(pathname + window.location.search);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;