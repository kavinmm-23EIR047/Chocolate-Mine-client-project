import api from '../utils/api';

const staffService = {
  /* ----------------------------------------
     Dashboard & Stats
  ---------------------------------------- */
  getDashboard: () => api.get('/staff/dashboard'),
  
  /* ----------------------------------------
     Orders Management
  ---------------------------------------- */
  getNewOrders: () => api.get('/staff/orders/new'),
  getOutForDeliveryOrders: () => api.get('/staff/orders/out-for-delivery'),
  getDeliveredOrders: () => api.get('/staff/orders/delivered'),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  
  /* ----------------------------------------
     Order Details - Get Single Order (FIX for eye icon)
  ---------------------------------------- */
  getOrderDetails: (orderId) => api.get(`/staff/orders/${orderId}`),
  
  /* ----------------------------------------
     Delivery Status Update
     When status is 'out_for_delivery' - OTP is auto-generated
     When status is 'delivered' - OTP must be verified first
  ---------------------------------------- */
  updateKitchenStatus: (id, status) =>
    api.patch(`/staff/orders/${id}/kitchen-status`, { status }),
  
  /* ----------------------------------------
     OTP Management for Delivery
  ---------------------------------------- */
  // Generate new OTP for delivery (if customer didn't receive or OTP expired)
  generateDeliveryOtp: (orderId) =>
    api.post(`/staff/orders/${orderId}/generate-otp`),
  
  // Verify OTP to complete delivery
  verifyDeliveryOtp: (orderId, otp) =>
    api.post(`/staff/orders/${orderId}/verify-otp`, { otp }),
  
  /* ----------------------------------------
     KOT (Kitchen Order Ticket)
  ---------------------------------------- */
  getKOTData: (id) => api.get(`/staff/orders/${id}/kot`),
  printKOT: (id) => {
    const url = `${import.meta.env.VITE_API_URL}/staff/orders/${id}/kot/print`;
    window.open(url, '_blank', 'width=400,height=600');
  },
  markKOTPrinted: (id) => api.patch(`/staff/orders/${id}/print-kot`),
};

export default staffService;