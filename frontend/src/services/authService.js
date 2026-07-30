import api from '../utils/api';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (data) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifySignup: (data) => api.post('/auth/verify-signup', data),
  resendSignupOtp: (email) => api.post('/auth/resend-signup-otp', { email }),
};

export default authService;
