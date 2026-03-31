const { all, get, run } = require('../db');

const calculateShippingCost = (orderAmount, weight = 1) => {
  // Base shipping cost
  let shippingCost = 5.0;

  // Add cost based on order amount
  if (orderAmount > 100) {
    shippingCost = 3.0;
  } else if (orderAmount > 50) {
    shippingCost = 4.0;
  }

  // Add cost based on weight (e.g., weight in kg)
  shippingCost += weight * 0.5;

  return parseFloat(shippingCost.toFixed(2));
};

const generateTrackingNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TRACK_${timestamp}_${random}`;
};

const couriers = ['FedEx', 'UPS', 'DHL', 'Amazon', 'Local Courier'];

const getRandomCourier = () => {
  return couriers[Math.floor(Math.random() * couriers.length)];
};

const listShippingDashboard = async (req, res, next) => {
  try {
    const { shipping_status } = req.query;

    let whereClause = 's.shipping_id IS NOT NULL';
    const params = [];

    if (shipping_status && shipping_status !== 'all') {
      whereClause += ' AND s.shipping_status = ?';
      params.push(String(shipping_status));
    }

    const rows = await all(
      `SELECT
          s.shipping_id,
          s.order_id,
          s.courier_service,
          s.tracking_number,
          s.shipping_status,
          s.shipping_cost,
          s.created_at,
          s.updated_at,
          o.user_id,
          o.total_amount,
          o.order_status,
          u.full_name,
          u.email,
          COUNT(*) OVER() as total_count
       FROM shipping s
       LEFT JOIN orders o ON s.order_id = o.order_id
       LEFT JOIN users u ON o.user_id = u.user_id
       WHERE ${whereClause}
       ORDER BY s.created_at DESC`,
      params,
    );

    const stats = {
      shipped: 0,
      in_transit: 0,
      delivered: 0,
      total_cost: 0,
    };

    rows.forEach((row) => {
      if (row.shipping_status === 'Shipped') stats.shipped++;
      else if (row.shipping_status === 'In Transit') stats.in_transit++;
      else if (row.shipping_status === 'Delivered') stats.delivered++;

      stats.total_cost += parseFloat(row.shipping_cost) || 0;
    });

    res.json({
      data: rows,
      stats: {
        ...stats,
        total_shipments: rows.length > 0 ? rows[0].total_count : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createShipping = async (req, res, next) => {
  try {
    const {
      order_id: orderId,
      courier_service: courierService,
      tracking_number: trackingNumber,
      shipping_cost: shippingCostInput,
    } = req.body;

    if (!Number.isInteger(orderId)) {
      res.status(400).json({ message: 'Valid order_id is required.' });
      return;
    }

    const order = await get(
      'SELECT order_id, total_amount FROM orders WHERE order_id = ? AND status = 1',
      [orderId],
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    const existingShipping = await get('SELECT shipping_id FROM shipping WHERE order_id = ?', [orderId]);

    if (existingShipping) {
      res.status(409).json({ message: 'Shipping already exists for this order.' });
      return;
    }

    const courier = courierService || getRandomCourier();
    const trackingNum = trackingNumber || generateTrackingNumber();
    const shippingCost = shippingCostInput !== undefined ? parseFloat(shippingCostInput) : calculateShippingCost(order.total_amount);

    if (!Number.isFinite(shippingCost) || shippingCost < 0) {
      res.status(400).json({ message: 'Valid shipping cost is required.' });
      return;
    }

    const inserted = await run(
      `INSERT INTO shipping (order_id, courier_service, tracking_number, shipping_status, shipping_cost, created_at, updated_at)
       VALUES (?, ?, ?, 'Shipped', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [orderId, courier, trackingNum, shippingCost.toFixed(2)],
    );

    const created = await get(
      `SELECT s.*, o.user_id, o.total_amount, u.full_name, u.email
       FROM shipping s
       JOIN orders o ON s.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       WHERE s.shipping_id = ?
      `,
      [inserted.id],
    );

    res.status(201).json({
      message: 'Shipping record created successfully.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

const getShippingByTrackingNumber = async (req, res, next) => {
  try {
    const { tracking_number } = req.params;

    if (!tracking_number || tracking_number.trim() === '') {
      res.status(400).json({ message: 'Tracking number is required.' });
      return;
    }

    const shipping = await get(
      `SELECT s.*, o.user_id, o.total_amount, o.order_status, u.full_name, u.email
       FROM shipping s
       JOIN orders o ON s.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       WHERE s.tracking_number = ?
      `,
      [tracking_number],
    );

    if (!shipping) {
      res.status(404).json({ message: 'Shipment not found with this tracking number.' });
      return;
    }

    res.json({
      message: 'Shipment details retrieved successfully.',
      data: shipping,
    });
  } catch (error) {
    next(error);
  }
};

const updateShippingInformation = async (req, res, next) => {
  try {
    const { shipping_id: shippingId } = req.params;
    const {
      courier_service: courierService,
      tracking_number: trackingNumber,
      shipping_status: shippingStatus,
    } = req.body;

    if (!Number.isInteger(parseInt(shippingId, 10))) {
      res.status(400).json({ message: 'Valid shipping_id is required.' });
      return;
    }

    const shipping = await get('SELECT * FROM shipping WHERE shipping_id = ?', [shippingId]);

    if (!shipping) {
      res.status(404).json({ message: 'Shipping record not found.' });
      return;
    }

    const validStatuses = ['Shipped', 'In Transit', 'Delivered'];
    let finalStatus = shipping.shipping_status;

    if (shippingStatus) {
      if (!validStatuses.includes(shippingStatus)) {
        res.status(400).json({
          message: `Valid shipping_status required: ${validStatuses.join(', ')}`,
        });
        return;
      }
      finalStatus = shippingStatus;
    }

    const finalCourier = courierService || shipping.courier_service;
    const finalTracking = trackingNumber || shipping.tracking_number;

    const checkDuplicate = await get(
      'SELECT shipping_id FROM shipping WHERE tracking_number = ? AND shipping_id != ?',
      [finalTracking, shippingId],
    );

    if (checkDuplicate) {
      res.status(409).json({ message: 'This tracking number is already in use.' });
      return;
    }

    await run(
      `UPDATE shipping
       SET courier_service = ?, tracking_number = ?, shipping_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE shipping_id = ?
      `,
      [finalCourier, finalTracking, finalStatus, shippingId],
    );

    const updated = await get(
      `SELECT s.*, o.user_id, o.total_amount, o.order_status, u.full_name, u.email
       FROM shipping s
       JOIN orders o ON s.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       WHERE s.shipping_id = ?
      `,
      [shippingId],
    );

    res.json({
      message: 'Shipping information updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const getShippingByOrderId = async (req, res, next) => {
  try {
    const { order_id: orderId } = req.params;

    if (!Number.isInteger(parseInt(orderId, 10))) {
      res.status(400).json({ message: 'Valid order_id is required.' });
      return;
    }

    const shipping = await get(
      `SELECT s.*, o.user_id, o.total_amount, o.order_status, u.full_name, u.email
       FROM shipping s
       JOIN orders o ON s.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       WHERE s.order_id = ?
      `,
      [orderId],
    );

    if (!shipping) {
      res.status(404).json({ message: 'No shipping record found for this order.' });
      return;
    }

    res.json({
      message: 'Shipping details retrieved successfully.',
      data: shipping,
    });
  } catch (error) {
    next(error);
  }
};

const getShippingCost = async (req, res, next) => {
  try {
    const { order_amount, weight = 1 } = req.query;

    if (!order_amount || parseFloat(order_amount) <= 0) {
      res.status(400).json({ message: 'Valid order_amount is required.' });
      return;
    }

    const cost = calculateShippingCost(parseFloat(order_amount), parseFloat(weight));

    res.json({
      data: {
        order_amount: parseFloat(order_amount),
        weight: parseFloat(weight),
        shipping_cost: cost,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listShippingDashboard,
  createShipping,
  getShippingByTrackingNumber,
  updateShippingInformation,
  getShippingByOrderId,
  getShippingCost,
  calculateShippingCost,
  generateTrackingNumber,
};
