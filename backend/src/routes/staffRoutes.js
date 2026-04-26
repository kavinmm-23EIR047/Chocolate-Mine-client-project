const express = require('express');
const staffController = require('../controllers/staffController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

const router = express.Router();

// Staff only access (admin should not access staff routes)
router.use(protect, restrictTo('staff'));

// Staff Dashboard - shows delivery stats
router.get('/dashboard', staffController.getStaffDashboard);

// Get confirmed orders ready for delivery
router.get('/orders/new', staffController.getNewOrders);

// Get out for delivery orders (for OTP verification)
router.get('/orders/out-for-delivery', staffController.getOutForDeliveryOrders);

// Get delivered orders
router.get('/orders/delivered', staffController.getDeliveredOrders);

// ✅ Get single order details (FIX for 404 error)
router.get('/orders/:id', staffController.getOrderDetails);

// KOT routes (kitchen order ticket - legacy, kept for compatibility)
router.get('/orders/:id/kot', staffController.getKOTData);
router.get('/orders/:id/kot/print', staffController.printKOT);
router.patch('/orders/:id/print-kot', staffController.markKOTPrinted);

// Delivery status update (confirmed → out_for_delivery → delivered)
// When moving to out_for_delivery, OTP is automatically generated
router.patch('/orders/:id/kitchen-status', staffController.updateKitchenStatus);

// OTP Management for Delivery
// @route   POST /api/staff/orders/:id/generate-otp
// @desc    Generate and send OTP to customer for delivery verification
router.post('/orders/:id/generate-otp', staffController.generateDeliveryOtp);

// @route   POST /api/staff/orders/:id/verify-otp
// @desc    Verify OTP and mark order as delivered
router.post('/orders/:id/verify-otp', staffController.verifyDeliveryOtp);

module.exports = router;