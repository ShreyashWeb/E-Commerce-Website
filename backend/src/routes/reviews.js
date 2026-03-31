const express = require('express');
const {
  addReview,
  getProductReviews,
  getCustomerReviews,
  getAdminReviewsDashboard,
  moderateReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');

const router = express.Router();

// Customer routes
router.post('/', addReview);
router.get('/product/:product_id', getProductReviews);
router.get('/customer/:customer_id', getCustomerReviews);
router.put('/:review_id', updateReview);
router.delete('/:review_id', deleteReview);

// Admin routes
router.get('/admin/dashboard', getAdminReviewsDashboard);
router.patch('/:review_id/moderate', moderateReview);

module.exports = router;
