const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

const router = express.Router();

// All analytics routes require admin or staff access
router.use(protect);
router.use(restrictTo('admin', 'staff'));

// Dashboard and reporting endpoints
router.get('/dashboard', analyticsController.getDashboard);
router.get('/sales-report', analyticsController.getSalesReport);
router.get('/order-status', analyticsController.getOrderStatusDistribution);
router.get('/recent-orders', analyticsController.getRecentOrders);
router.get('/sales', analyticsController.getSalesReport); // Alias for backward compatibility

module.exports = router;