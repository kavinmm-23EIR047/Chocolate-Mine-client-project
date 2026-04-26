const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Razorpay webhook (public route)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(protect);

// User Routes
router.post('/create-order', paymentController.createRazorpayOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/log-failure', paymentController.handlePaymentFailure);

// Admin Only
router.get(
  '/status/:orderId',
  restrictTo('admin'),
  paymentController.getPaymentStatus
);

module.exports = router;