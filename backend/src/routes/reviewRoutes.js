const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* Public Routes (No authentication required) */
router.get('/latest', reviewController.getLatestReviews);
router.get('/product/:productId', reviewController.getProductReviews);

/* Protected Routes (Authentication required) */
router.use(protect);

// Get my reviews
router.get('/my', reviewController.getMyReviews);

// Check if order can be reviewed
router.get('/check-order/:orderId', reviewController.checkOrderReviewable);

// Create review
router.post('/', reviewController.createReview);

/* Admin Routes (Admin only - place in adminRoutes.js instead) */
// router.patch('/:id/approve', reviewController.approveReview);
// router.delete('/:id', reviewController.deleteReview);

module.exports = router;