const express = require('express');
const {
  createCoupon,
  getCouponsDashboard,
  applyCouponAtCheckout,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
} = require('../controllers/couponsController');

const router = express.Router();

router.post('/', createCoupon);
router.get('/dashboard', getCouponsDashboard);
router.post('/apply', applyCouponAtCheckout);
router.put('/:coupon_id', updateCoupon);
router.patch('/:coupon_id/status', updateCouponStatus);
router.delete('/:coupon_id', deleteCoupon);

module.exports = router;
