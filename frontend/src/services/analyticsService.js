import api from '../utils/api';

const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard').catch(err => ({
    data: {
      success: false,
      data: {
        revenue: { totalRevenue: 0, monthlyRevenue: 0, avgOrderValue: 0 },
        payments: { successful: 0, pending: 0, failed: 0, refunded: 0 },
        salesChart: [],
        ordersCount: 0,
        usersCount: 0,
        topProducts: [],
        categorySplit: []
      }
    }
  })),
  getSalesReport: (params) => api.get('/analytics/sales', { params }),
};

export default analyticsService;
