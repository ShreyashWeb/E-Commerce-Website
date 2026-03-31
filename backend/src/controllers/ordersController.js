const { all, get, run } = require('../db');

const normalizeStatus = (rawStatus) => {
  if (!rawStatus || rawStatus === 'all') {
    return null;
  }

  const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
  if (validStatuses.includes(rawStatus.toLowerCase())) {
    return rawStatus.toLowerCase();
  }

  return null;
};

// Place an Order - Create new order from cart items
const placeOrder = async (req, res, next) => {
  try {
    const { user_id: userId, shipping_address: shippingAddress } = req.body;

    if (!userId || !Number.isInteger(userId)) {
      res.status(400).json({ message: 'Valid user_id is required.' });
      return;
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      res.status(400).json({ message: 'Shipping address is required.' });
      return;
    }

    // Check user exists
    const user = await get('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Get cart items
    const cartItems = await all(
      `SELECT c.cart_id, c.product_id, c.quantity, p.price, p.product_name 
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ? AND c.status = 1
      `,
      [userId],
    );

    if (cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty. Add items before placing an order.' });
      return;
    }

    // Calculate total amount
    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    // Create order
    const insertedOrder = await run(
      `INSERT INTO orders (user_id, total_amount, order_status, status)
       VALUES (?, ?, ?, 1)
      `,
      [userId, totalAmount.toFixed(2), 'pending'],
    );

    const orderId = insertedOrder.id;

    // Create order items
    for (const item of cartItems) {
      await run(
        `INSERT INTO order_items (order_id, product_id, quantity, item_price)
         VALUES (?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.quantity, item.price],
      );
    }

    // Clear cart
    await run('UPDATE cart SET status = 0 WHERE user_id = ? AND status = 1', [userId]);

    const createdOrder = await get(
      `SELECT o.*, u.full_name, u.email 
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = ?
      `,
      [orderId],
    );

    res.status(201).json({
      message: 'Order placed successfully.',
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// View all orders with optional filters
const listOrders = async (req, res, next) => {
  try {
    const { order_status: orderStatus, user_id: userId } = req.query;
    const normalizedStatus = normalizeStatus(orderStatus);

    let whereClause = 'WHERE o.status = 1';
    const params = [];

    if (normalizedStatus) {
      whereClause += ' AND o.order_status = ?';
      params.push(normalizedStatus);
    }

    if (userId && Number.isInteger(Number(userId))) {
      whereClause += ' AND o.user_id = ?';
      params.push(Number(userId));
    }

    const rows = await all(
      `
      SELECT
        o.order_id,
        o.user_id,
        o.total_amount,
        o.order_status,
        o.created_at,
        o.updated_at,
        u.full_name,
        u.email,
        COUNT(oi.order_item_id) AS item_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id
      ORDER BY o.updated_at DESC
      `,
      params,
    );

    const pendingCount = await get(
      'SELECT COUNT(*) AS count FROM orders WHERE status = 1 AND order_status = ?',
      ['pending'],
    );
    const shippedCount = await get(
      'SELECT COUNT(*) AS count FROM orders WHERE status = 1 AND order_status = ?',
      ['shipped'],
    );
    const deliveredCount = await get(
      'SELECT COUNT(*) AS count FROM orders WHERE status = 1 AND order_status = ?',
      ['delivered'],
    );

    res.json({
      data: rows,
      stats: {
        total: rows.length,
        pending: pendingCount.count,
        shipped: shippedCount.count,
        delivered: deliveredCount.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get order details with items
const getOrderDetails = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      res.status(400).json({ message: 'Invalid order id.' });
      return;
    }

    const order = await get(
      `SELECT o.*, u.full_name, u.email FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = ? AND o.status = 1
      `,
      [orderId],
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    const items = await all(
      `SELECT oi.*, p.product_name, p.price FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?
      `,
      [orderId],
    );

    res.json({
      data: {
        ...order,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (Pending -> Shipped -> Delivered)
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const { order_status: newStatus } = req.body;

    if (!Number.isInteger(orderId)) {
      res.status(400).json({ message: 'Invalid order id.' });
      return;
    }

    if (!newStatus || !['pending', 'shipped', 'delivered'].includes(newStatus.toLowerCase())) {
      res.status(400).json({
        message: 'Valid order_status required: pending, shipped, or delivered.',
      });
      return;
    }

    const order = await get(
      'SELECT * FROM orders WHERE order_id = ? AND status = 1',
      [orderId],
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (order.order_status === 'cancelled') {
      res.status(409).json({ message: 'Cannot update cancelled orders.' });
      return;
    }

    await run(
      `UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = ?
      `,
      [newStatus.toLowerCase(), orderId],
    );

    const updated = await get(
      `SELECT o.*, u.full_name, u.email FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = ?
      `,
      [orderId],
    );

    res.json({ message: 'Order status updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

// Cancel Order - Soft delete by setting status to 0 and order_status to 'cancelled'
const cancelOrder = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      res.status(400).json({ message: 'Invalid order id.' });
      return;
    }

    const order = await get(
      'SELECT * FROM orders WHERE order_id = ? AND status = 1',
      [orderId],
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (order.order_status === 'shipped' || order.order_status === 'delivered') {
      res.status(409).json({
        message: `Cannot cancel orders that are already ${order.order_status}.`,
      });
      return;
    }

    if (order.order_status === 'cancelled') {
      res.status(409).json({ message: 'Order is already cancelled.' });
      return;
    }

    await run(
      `UPDATE orders SET status = 0, order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE order_id = ?
      `,
      [orderId],
    );

    const cancelled = await get(
      `SELECT o.*, u.full_name, u.email FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = ?
      `,
      [orderId],
    );

    res.json({ message: 'Order cancelled successfully.', data: cancelled });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  listOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
};
