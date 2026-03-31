const { all, get, run } = require('../db');

const normalizeQuantity = (value) => Number(value);

const listProductsForCart = async (req, res, next) => {
  try {
    const products = await all(
      `SELECT product_id, product_name, price, stock_quantity
       FROM products
       WHERE status = 1
       ORDER BY product_name ASC`,
    );

    res.json({ data: products });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const {
      customer_id: customerId,
      product_id: productId,
      quantity: rawQuantity = 1,
    } = req.body;

    const quantity = normalizeQuantity(rawQuantity);

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Valid customer_id is required.' });
      return;
    }

    if (!Number.isInteger(productId)) {
      res.status(400).json({ message: 'Valid product_id is required.' });
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ message: 'Quantity must be a positive integer.' });
      return;
    }

    const customer = await get(
      "SELECT user_id FROM users WHERE user_id = ? AND status = 1 AND role = 'customer'",
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

    const existingCartItem = await get(
      'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND status = 1',
      [customerId, productId],
    );

    const nextQuantity = existingCartItem ? Number(existingCartItem.quantity) + quantity : quantity;

    if (nextQuantity > Number(product.stock_quantity)) {
      res.status(409).json({
        message: `Insufficient stock. Available stock is ${product.stock_quantity}.`,
      });
      return;
    }

    const totalPrice = Number((nextQuantity * Number(product.price)).toFixed(2));

    let cartId = null;

    if (existingCartItem) {
      await run(
        `UPDATE cart
         SET quantity = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP
         WHERE cart_id = ?`,
        [nextQuantity, totalPrice, existingCartItem.cart_id],
      );
      cartId = existingCartItem.cart_id;
    } else {
      const inserted = await run(
        `INSERT INTO cart (user_id, product_id, quantity, total_price, status)
         VALUES (?, ?, ?, ?, 1)`,
        [customerId, productId, quantity, Number((quantity * Number(product.price)).toFixed(2))],
      );
      cartId = inserted.id;
    }

    const created = await get(
      `SELECT c.cart_id, c.user_id AS customer_id, c.product_id, p.product_name, p.price,
              c.quantity, c.total_price, c.created_at, c.updated_at
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.cart_id = ?`,
      [cartId],
    );

    res.status(existingCartItem ? 200 : 201).json({
      message: existingCartItem ? 'Cart item quantity updated.' : 'Product added to cart successfully.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerCart = async (req, res, next) => {
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

    const items = await all(
      `SELECT c.cart_id, c.user_id AS customer_id, c.product_id, p.product_name, p.price,
              c.quantity, c.total_price, c.created_at, c.updated_at
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ? AND c.status = 1
       ORDER BY c.updated_at DESC`,
      [customerId],
    );

    const totals = await get(
      `SELECT COUNT(*) AS item_count, COALESCE(SUM(total_price), 0) AS grand_total
       FROM cart
       WHERE user_id = ? AND status = 1`,
      [customerId],
    );

    res.json({
      data: {
        customer,
        items,
        summary: {
          item_count: totals.item_count,
          grand_total: Number(totals.grand_total || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const cartId = Number(req.params.id);
    const quantity = normalizeQuantity(req.body.quantity);

    if (!Number.isInteger(cartId)) {
      res.status(400).json({ message: 'Invalid cart id.' });
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ message: 'Quantity must be a positive integer.' });
      return;
    }

    const cartItem = await get(
      `SELECT c.cart_id, c.product_id, p.price, p.stock_quantity
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.cart_id = ? AND c.status = 1`,
      [cartId],
    );

    if (!cartItem) {
      res.status(404).json({ message: 'Cart item not found.' });
      return;
    }

    if (quantity > Number(cartItem.stock_quantity)) {
      res.status(409).json({
        message: `Insufficient stock. Available stock is ${cartItem.stock_quantity}.`,
      });
      return;
    }

    const totalPrice = Number((quantity * Number(cartItem.price)).toFixed(2));

    await run(
      `UPDATE cart
       SET quantity = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP
       WHERE cart_id = ?`,
      [quantity, totalPrice, cartId],
    );

    const updated = await get(
      `SELECT c.cart_id, c.user_id AS customer_id, c.product_id, p.product_name, p.price,
              c.quantity, c.total_price, c.created_at, c.updated_at
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.cart_id = ?`,
      [cartId],
    );

    res.json({ message: 'Cart item updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const cartId = Number(req.params.id);

    if (!Number.isInteger(cartId)) {
      res.status(400).json({ message: 'Invalid cart id.' });
      return;
    }

    const cartItem = await get('SELECT cart_id FROM cart WHERE cart_id = ? AND status = 1', [cartId]);

    if (!cartItem) {
      res.status(404).json({ message: 'Cart item not found.' });
      return;
    }

    await run(
      `UPDATE cart
       SET status = 0, updated_at = CURRENT_TIMESTAMP
       WHERE cart_id = ?`,
      [cartId],
    );

    res.json({ message: 'Cart item removed successfully.' });
  } catch (error) {
    next(error);
  }
};

const getCartDashboard = async (req, res, next) => {
  try {
    const rows = await all(
      `SELECT
         c.user_id AS customer_id,
         u.full_name,
         u.email,
         COUNT(c.cart_id) AS item_count,
         COALESCE(SUM(c.total_price), 0) AS cart_total,
         MAX(c.updated_at) AS last_updated,
         CASE
           WHEN julianday('now') - julianday(MAX(c.updated_at)) > 1 THEN 1
           ELSE 0
         END AS abandoned
       FROM cart c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.status = 1
       GROUP BY c.user_id, u.full_name, u.email
       ORDER BY last_updated DESC`,
    );

    const activeCartCount = await get('SELECT COUNT(DISTINCT user_id) AS count FROM cart WHERE status = 1');
    const abandonedCount = await get(
      `SELECT COUNT(*) AS count FROM (
         SELECT user_id
         FROM cart
         WHERE status = 1
         GROUP BY user_id
         HAVING julianday('now') - julianday(MAX(updated_at)) > 1
       )`,
    );

    res.json({
      data: rows,
      stats: {
        active_carts: activeCartCount.count,
        abandoned_carts: abandonedCount.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProductsForCart,
  addToCart,
  getCustomerCart,
  updateCartItem,
  removeCartItem,
  getCartDashboard,
};
