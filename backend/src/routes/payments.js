const express = require('express');
const {
  processPayment,
  listPayments,
  refundPayment,
} = require('../controllers/paymentsController');

const router = express.Router();

router.post('/', processPayment);
router.get('/', listPayments);
router.patch('/:id/refund', refundPayment);

module.exports = router;
