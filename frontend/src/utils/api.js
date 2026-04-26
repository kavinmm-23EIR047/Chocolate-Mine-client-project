import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

/* ----------------------------------------
   REQUEST INTERCEPTOR
---------------------------------------- */
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');

    // Fallback for OAuth sessions
    if (!token) {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        try {
          const parsed = JSON.parse(authUser);
          if (parsed?.token) {
            token = parsed.token;
          }
        } catch (e) {
          console.error('Failed to parse auth_user in interceptor', e);
        }
      }
    }

    // ✅ Only inject Authorization if not already provided manually
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Preserve FormData behavior
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ----------------------------------------
   RESPONSE INTERCEPTOR
---------------------------------------- */

const PAYMENT_ROUTES = [
  '/payment/create-order',
  '/payment/verify',
  '/payment/log-failure'
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      const isPaymentRoute = PAYMENT_ROUTES.some((route) =>
        requestUrl.includes(route)
      );

      // ✅ Prevent payment flow break during Razorpay verification
      if (!isPaymentRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login';
        }
      }
    }

    if (status === 403) {
      console.error('Access forbidden:', error.response?.data?.message);
    }

    if (status === 404) {
      console.error('Route not found:', error.response?.data?.message);
    }

    if (status === 500) {
      console.error('Server error:', error.response?.data?.message);
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Unknown error occurred';

    const normalizedError = new Error(errorMessage);
    normalizedError.response = error.response;
    normalizedError.status = status;
    normalizedError.data = error.response?.data;

    return Promise.reject(normalizedError);
  }
);

/* ----------------------------------------
   FORM DATA HELPER
---------------------------------------- */
export const formDataRequest = async (
  method,
  url,
  data = {},
  options = {}
) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else if (
        typeof value === 'object' &&
        !(value instanceof File)
      ) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  return api({
    method,
    url,
    data: formData,
    ...options,
  });
};

/* ----------------------------------------
   FILE UPLOAD HELPER
---------------------------------------- */
export const uploadFile = async (
  url,
  file,
  additionalData = {}
) => {
  const formData = new FormData();

  formData.append('image', file);

  Object.keys(additionalData).forEach((key) => {
    if (
      additionalData[key] !== null &&
      additionalData[key] !== undefined
    ) {
      formData.append(key, additionalData[key]);
    }
  });

  return api.post(url, formData);
};

export default api;