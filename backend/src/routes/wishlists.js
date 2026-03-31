const express = require('express');
const {
  listProductsForWishlist,
  addToWishlist,
  getCustomerWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} = require('../controllers/wishlistsController');

const router = express.Router();

router.get('/products', listProductsForWishlist);
router.post('/items', addToWishlist);
router.get('/:customerId', getCustomerWishlist);
router.delete('/items/:id', removeFromWishlist);
router.patch('/items/:id/move-to-cart', moveWishlistToCart);

module.exports = router;
