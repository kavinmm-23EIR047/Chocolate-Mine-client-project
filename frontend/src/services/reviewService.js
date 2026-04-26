import api from '../utils/api';

const reviewService = {
  /* ----------------------------------------
     Public Routes
  ---------------------------------------- */
  getLatest: () => api.get('/reviews/latest'),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  
  /* ----------------------------------------
     Protected Routes
  ---------------------------------------- */
  // Get my reviews
  getMyReviews: () => api.get('/reviews/my'),
  
  // Create a new review
  createReview: (data) => api.post('/reviews', data),
  
  // Check if order can be reviewed (delivered and not yet reviewed)
  checkOrderReviewable: (orderId) => api.get(`/reviews/check-order/${orderId}`),
  
  /* ----------------------------------------
     Admin Routes
  ---------------------------------------- */
  // Approve review (Admin only)
  approveReview: (reviewId) => api.patch(`/admin/reviews/${reviewId}/approve`),
  
  // Delete review (Admin only)
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
};

export default reviewService;