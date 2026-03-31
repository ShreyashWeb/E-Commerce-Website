const express = require('express');
const {
  listProductsForCart,
  addToCart,
  getCustomerCart,
  updateCartItem,
  removeCartItem,
  getCartDashboard,
} = require('../controllers/cartsController');

const router = express.Router();

router.get('/products', listProductsForCart);
router.get('/admin/dashboard', getCartDashboard);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.get('/:customerId', getCustomerCart);

module.exports = router;
