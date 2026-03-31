const express = require('express');
const {
  createCustomer,
  listCustomers,
  getCustomerDetails,
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer,
} = require('../controllers/customersController');

const router = express.Router();

router.post('/', createCustomer);
router.get('/', listCustomers);
router.get('/:id', getCustomerDetails);
router.put('/:id', updateCustomer);
router.patch('/:id/deactivate', deactivateCustomer);
router.patch('/:id/reactivate', reactivateCustomer);

module.exports = router;
