const { all, get, run } = require('../db');

const listProductsForWishlist = async (req, res, next) => {
  try {
    const products = await all(
      `SELECT product_id, product_name, price, stock_quantity, status
       FROM products
       WHERE status = 1
       ORDER BY product_name ASC`,
    );

    res.json({ data: products });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { customer_id: customerId, product_id: productId } = req.body;

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Valid customer_id is required.' });
      return;
    }

    if (!Number.isInteger(productId)) {
      res.status(400).json({ message: 'Valid product_id is required.' });
      return;
    }

    const customer = await get(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 1",
      [customerId],
    );

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    const product = await get(
      'SELECT product_id, product_name, price, stock_quantity, status FROM products WHERE product_id = ?',
      [productId],
    );

    if (!product || Number(product.status) !== 1) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const existing = await get(
      'SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ? AND status = 1',
      [customerId, productId],
    );

    if (existing) {
      res.status(409).json({ message: 'Product is already in wishlist.' });
      return;
    }

    const inserted = await run(
      `INSERT INTO wishlist (user_id, product_id, status, updated_at)
       VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
      [customerId, productId],
    );

    const created = await get(
      `SELECT w.wishlist_id, w.user_id AS customer_id, w.product_id, p.product_name, p.price,
              p.stock_quantity, w.created_at, w.updated_at
       FROM wishlist w
       JOIN products p ON w.product_id = p.product_id
       WHERE w.wishlist_id = ?`,
      [inserted.id],
    );

    res.status(201).json({ message: 'Product added to wishlist.', data: created });
  } catch (error) {
    next(error);
  }
};

const getCustomerWishlist = async (req, res, next) => {
  try {
    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Invalid customer id.' });
      return;
    }

    const customer = await get(
      "SELECT user_id, full_name, email FROM users WHERE user_id = ? AND role = 'customer'",
      [customerId],
    );

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    const rows = await all(
      `SELECT w.wishlist_id, w.user_id AS customer_id, w.product_id,
              p.product_name, p.price, p.stock_quantity, p.status AS product_status,
              w.created_at, w.updated_at
       FROM wishlist w
       JOIN products p ON w.product_id = p.product_id
       WHERE w.user_id = ? AND w.status = 1
       ORDER BY w.updated_at DESC`,
      [customerId],
    );

    res.json({
      data: {
        customer,
        items: rows,
        summary: {
          total_items: rows.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlistId = Number(req.params.id);

    if (!Number.isInteger(wishlistId)) {
      res.status(400).json({ message: 'Invalid wishlist id.' });
      return;
    }

    const item = await get('SELECT wishlist_id FROM wishlist WHERE wishlist_id = ? AND status = 1', [wishlistId]);

    if (!item) {
      res.status(404).json({ message: 'Wishlist item not found.' });
      return;
    }

    await run(
      `UPDATE wishlist
       SET status = 0, updated_at = CURRENT_TIMESTAMP
       WHERE wishlist_id = ?`,
      [wishlistId],
    );

    res.json({ message: 'Wishlist item removed successfully.' });
  } catch (error) {
    next(error);
  }
};

const moveWishlistToCart = async (req, res, next) => {
  try {
    const wishlistId = Number(req.params.id);

    if (!Number.isInteger(wishlistId)) {
      res.status(400).json({ message: 'Invalid wishlist id.' });
      return;
    }

    const wishlistItem = await get(
      `SELECT w.wishlist_id, w.user_id, w.product_id,
              p.price, p.stock_quantity, p.status
       FROM wishlist w
       JOIN products p ON w.product_id = p.product_id
       WHERE w.wishlist_id = ? AND w.status = 1`,
      [wishlistId],
    );

    if (!wishlistItem) {
      res.status(404).json({ message: 'Wishlist item not found.' });
      return;
    }

    if (Number(wishlistItem.status) !== 1) {
      res.status(409).json({ message: 'Product is not available.' });
      return;
    }

    if (Number(wishlistItem.stock_quantity) < 1) {
      res.status(409).json({ message: 'Product is out of stock.' });
      return;
    }

    const existingCart = await get(
      'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND status = 1',
      [wishlistItem.user_id, wishlistItem.product_id],
    );

    if (existingCart) {
      const nextQuantity = Number(existingCart.quantity) + 1;
      if (nextQuantity > Number(wishlistItem.stock_quantity)) {
        res.status(409).json({ message: 'Insufficient stock to move product to cart.' });
        return;
      }

      await run(
        `UPDATE cart
         SET quantity = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP
         WHERE cart_id = ?`,
        [nextQuantity, Number((nextQuantity * Number(wishlistItem.price)).toFixed(2)), existingCart.cart_id],
      );
    } else {
      await run(
        `INSERT INTO cart (user_id, product_id, quantity, total_price, status)
         VALUES (?, ?, 1, ?, 1)`,
        [wishlistItem.user_id, wishlistItem.product_id, Number(wishlistItem.price.toFixed(2))],
      );
    }

    await run(
      `UPDATE wishlist
       SET status = 0, updated_at = CURRENT_TIMESTAMP
       WHERE wishlist_id = ?`,
      [wishlistId],
    );

    res.json({ message: 'Item moved from wishlist to cart successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProductsForWishlist,
  addToWishlist,
  getCustomerWishlist,
  removeFromWishlist,
  moveWishlistToCart,
};
