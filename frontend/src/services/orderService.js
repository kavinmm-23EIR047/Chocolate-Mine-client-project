import api from '../utils/api';

const orderService = {
  /* ----------------------------------------
     Order Placement
  ---------------------------------------- */
  place: (data) => api.post('/orders/place', data),

  /* ----------------------------------------
     User Orders
  ---------------------------------------- */
  getMyOrders: () => api.get('/orders/my'),

  getOrder: (id) => api.get(`/orders/${id}`),

  /* ----------------------------------------
     Staff Orders
  ---------------------------------------- */
  getAllOrders: () => api.get('/orders'),

  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),

  /* ----------------------------------------
     Tracking (orderId based)
  ---------------------------------------- */
  track: (orderId) =>
    api.get(`/orders/track/${orderId}`),

  /* ----------------------------------------
     Invoice Download
  ---------------------------------------- */
  downloadInvoice: (id) =>
    api.get(`/orders/${id}/invoice`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf'
      }
    })
};

export default orderService;