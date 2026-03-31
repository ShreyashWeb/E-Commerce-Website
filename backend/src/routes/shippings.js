const express = require('express');
const {
  listShippingDashboard,
  createShipping,
  getShippingByTrackingNumber,
  updateShippingInformation,
  getShippingByOrderId,
  getShippingCost,
} = require('../controllers/shippingsController');

const router = express.Router();

// Admin routes
router.get('/dashboard', listShippingDashboard);
router.get('/calculate-cost', getShippingCost);
router.post('/', createShipping);
router.patch('/:shipping_id', updateShippingInformation);

// Customer routes
router.get('/track/:tracking_number', getShippingByTrackingNumber);
router.get('/order/:order_id', getShippingByOrderId);

module.exports = router;
