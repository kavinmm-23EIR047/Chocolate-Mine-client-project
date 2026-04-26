import api from '../utils/api';

const paymentService = {
  createOrder: async (data) => {
    const res = await api.post('/payment/create-order', data);
    return res.data;
  },

  verify: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },

  logFailure: async (data) => {
    const res = await api.post('/payment/log-failure', data);
    return res.data;
  },
};

export default paymentService;