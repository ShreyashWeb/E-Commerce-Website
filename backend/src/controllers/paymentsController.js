const { all, get, run } = require('../db');

const normalizePaymentStatus = (rawStatus) => {
  if (!rawStatus || rawStatus === 'all') {
    return null;
  }

  const normalized = String(rawStatus).toLowerCase();
  if (['paid', 'failed', 'refunded'].includes(normalized)) {
    return normalized;
  }

  return null;
};

const normalizePaymentMethod = (rawMethod) => {
  if (!rawMethod) {
    return null;
  }

  const normalized = String(rawMethod).toLowerCase();
  const validMethods = {
    'credit card': 'credit_card',
    credit_card: 'credit_card',
    card: 'credit_card',
    'debit card': 'debit_card',
    debit_card: 'debit_card',
    debit: 'debit_card',
    paypal: 'paypal',
    bank: 'bank_transfer',
    bank_transfer: 'bank_transfer',
    transfer: 'bank_transfer',
  };

  return validMethods[normalized] || null;
};

const processPayment = async (req, res, next) => {
  try {
    const {
      order_id: orderId,
      payment_method: paymentMethod,
      amount,
      payment_gateway: paymentGateway = 'simulated_gateway',
      force_status: forceStatus,
    } = req.body;

    if (!Number.isInteger(orderId)) {
      res.status(400).json({ message: 'Valid order_id is required.' });
      return;
    }

    const normalizedMethod = normalizePaymentMethod(paymentMethod);
    if (!normalizedMethod) {
      res.status(400).json({
        message: 'Valid payment_method is required: credit_card, debit_card, paypal, bank_transfer.',
      });
      return;
    }

    const order = await get('SELECT order_id, total_amount, order_status FROM orders WHERE order_id = ?', [
      orderId,
    ]);

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (order.order_status === 'cancelled') {
      res.status(409).json({ message: 'Cannot process payment for cancelled order.' });
      return;
    }

    const existingPaidPayment = await get(
      "SELECT payment_id FROM payments WHERE order_id = ? AND payment_status = 'paid'",
      [orderId],
    );

    if (existingPaidPayment) {
      res.status(409).json({ message: 'Payment already completed for this order.' });
      return;
    }

    const amountToCharge = Number(amount ?? order.total_amount);
    if (!Number.isFinite(amountToCharge) || amountToCharge <= 0) {
      res.status(400).json({ message: 'Valid payment amount is required.' });
      return;
    }

    const normalizedForceStatus = forceStatus ? String(forceStatus).toLowerCase() : null;
    const paymentStatus = ['paid', 'failed'].includes(normalizedForceStatus)
      ? normalizedForceStatus
      : 'paid';

    const transactionRef = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const inserted = await run(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_ref, payment_gateway, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        orderId,
        amountToCharge.toFixed(2),
        normalizedMethod,
        paymentStatus,
        transactionRef,
        String(paymentGateway),
      ],
    );

    const created = await get(
      `SELECT p.*, o.order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = ?
      `,
      [inserted.id],
    );

    res.status(201).json({
      message:
        paymentStatus === 'paid'
          ? 'Payment processed successfully.'
          : 'Payment processing failed. Please retry.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

const listPayments = async (req, res, next) => {
  try {
    const normalizedStatus = normalizePaymentStatus(req.query.payment_status);
    const whereClause = normalizedStatus ? 'WHERE p.payment_status = ?' : '';
    const params = normalizedStatus ? [normalizedStatus] : [];

    const rows = await all(
      `SELECT
          p.payment_id,
          p.order_id,
          p.amount,
          p.payment_method,
          p.payment_status,
          p.transaction_ref,
          p.payment_gateway,
          p.created_at,
          p.updated_at,
          o.user_id,
          o.order_status,
          u.full_name,
          u.email
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       ${whereClause}
       ORDER BY p.updated_at DESC
      `,
      params,
    );

    const paidCount = await get("SELECT COUNT(*) AS count FROM payments WHERE payment_status = 'paid'");
    const failedCount = await get("SELECT COUNT(*) AS count FROM payments WHERE payment_status = 'failed'");
    const refundedCount = await get(
      "SELECT COUNT(*) AS count FROM payments WHERE payment_status = 'refunded'",
    );
    const totalAmountRow = await get(
      "SELECT COALESCE(SUM(amount), 0) AS total_amount FROM payments WHERE payment_status = 'paid'",
    );

    res.json({
      data: rows,
      stats: {
        total: rows.length,
        paid: paidCount.count,
        failed: failedCount.count,
        refunded: refundedCount.count,
        collected_amount: Number(totalAmountRow.total_amount || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const paymentId = Number(req.params.id);

    if (!Number.isInteger(paymentId)) {
      res.status(400).json({ message: 'Invalid payment id.' });
      return;
    }

    const payment = await get(
      `SELECT p.payment_id, p.order_id, p.payment_status, o.order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = ?
      `,
      [paymentId],
    );

    if (!payment) {
      res.status(404).json({ message: 'Payment not found.' });
      return;
    }

    if (payment.payment_status === 'refunded') {
      res.status(409).json({ message: 'Payment is already refunded.' });
      return;
    }

    if (payment.payment_status !== 'paid') {
      res.status(409).json({ message: 'Only paid transactions can be refunded.' });
      return;
    }

    if (!['cancelled', 'returned'].includes(String(payment.order_status).toLowerCase())) {
      res.status(409).json({
        message: 'Refund allowed only for cancelled or returned orders.',
      });
      return;
    }

    await run(
      `UPDATE payments
       SET payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = ?
      `,
      [paymentId],
    );

    const updated = await get('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    res.json({ message: 'Refund processed successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  listPayments,
  refundPayment,
};
