const express = require('express');
const {
  placeOrder,
  listOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/ordersController');

const router = express.Router();

router.post('/', placeOrder);
router.get('/', listOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
