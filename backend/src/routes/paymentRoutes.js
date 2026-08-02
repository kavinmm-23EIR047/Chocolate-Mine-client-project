const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Razorpay webhook (public route)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(protect);

// User Routes
const paymentLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many payment requests. Please try again later.' });
router.post('/create-order', paymentLimiter, paymentController.createRazorpayOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/log-failure', paymentController.handlePaymentFailure);

// Customer-owned status lookup (admins may also query orders)
router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
