import api from '../utils/api';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (data) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export default authService;
