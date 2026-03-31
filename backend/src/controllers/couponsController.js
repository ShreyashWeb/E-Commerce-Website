const { all, get, run } = require('../db');

const normalizeCouponCode = (couponCode) => String(couponCode || '').trim().toUpperCase();

const isValidDiscountType = (type) => ['percentage', 'fixed'].includes(String(type || '').toLowerCase());

const createCoupon = async (req, res, next) => {
  try {
    const {
      coupon_code: couponCodeInput,
      discount_type: discountTypeInput,
      discount_value: discountValueInput,
      valid_from: validFrom,
      valid_to: validTo,
      usage_limit: usageLimitInput,
    } = req.body;

    const couponCode = normalizeCouponCode(couponCodeInput);
    const discountType = String(discountTypeInput || '').toLowerCase();
    const discountValue = Number(discountValueInput);
    const usageLimit = Number.isInteger(Number(usageLimitInput)) ? Number(usageLimitInput) : 0;

    if (!couponCode) {
      res.status(400).json({ message: 'coupon_code is required.' });
      return;
    }

    if (!isValidDiscountType(discountType)) {
      res.status(400).json({ message: 'discount_type must be percentage or fixed.' });
      return;
    }

    if (Number.isNaN(discountValue) || discountValue <= 0) {
      res.status(400).json({ message: 'discount_value must be greater than 0.' });
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      res.status(400).json({ message: 'Percentage discount cannot exceed 100.' });
      return;
    }

    if (!validFrom || !validTo) {
      res.status(400).json({ message: 'valid_from and valid_to are required.' });
      return;
    }

    if (new Date(validTo) <= new Date(validFrom)) {
      res.status(400).json({ message: 'valid_to must be greater than valid_from.' });
      return;
    }

    if (usageLimit < 0) {
      res.status(400).json({ message: 'usage_limit cannot be negative.' });
      return;
    }

    const existing = await get('SELECT coupon_id FROM coupons WHERE coupon_code = ?', [couponCode]);
    if (existing) {
      res.status(409).json({ message: 'Coupon code already exists.' });
      return;
    }

    const inserted = await run(
      `INSERT INTO coupons (coupon_code, discount_type, discount_value, valid_from, valid_to, usage_limit, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [couponCode, discountType, discountValue, validFrom, validTo, usageLimit],
    );

    const created = await get('SELECT * FROM coupons WHERE coupon_id = ?', [inserted.id]);
    res.status(201).json({ message: 'Coupon created successfully.', data: created });
  } catch (error) {
    next(error);
  }
};

const getCouponsDashboard = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status === 'active') {
      whereClause += ' AND status = 1';
    } else if (status === 'inactive') {
      whereClause += ' AND status = 0';
    } else if (status === 'expired') {
      whereClause += " AND datetime(valid_to) < datetime('now')";
    }

    const data = await all(
      `SELECT *
       FROM coupons
       WHERE ${whereClause}
       ORDER BY created_at DESC`,
      params,
    );

    const statsRow = await get(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS inactive,
        SUM(CASE WHEN datetime(valid_to) < datetime('now') THEN 1 ELSE 0 END) AS expired
       FROM coupons`,
    );

    res.json({
      data,
      stats: {
        total: Number(statsRow?.total || 0),
        active: Number(statsRow?.active || 0),
        inactive: Number(statsRow?.inactive || 0),
        expired: Number(statsRow?.expired || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

const applyCouponAtCheckout = async (req, res, next) => {
  try {
    const { coupon_code: couponCodeInput, order_total: orderTotalInput } = req.body;

    const couponCode = normalizeCouponCode(couponCodeInput);
    const orderTotal = Number(orderTotalInput);

    if (!couponCode) {
      res.status(400).json({ message: 'coupon_code is required.' });
      return;
    }

    if (Number.isNaN(orderTotal) || orderTotal <= 0) {
      res.status(400).json({ message: 'order_total must be greater than 0.' });
      return;
    }

    const coupon = await get('SELECT * FROM coupons WHERE coupon_code = ?', [couponCode]);

    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found.' });
      return;
    }

    if (Number(coupon.status) !== 1) {
      res.status(400).json({ message: 'Coupon is inactive.' });
      return;
    }

    const now = new Date();
    if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_to)) {
      res.status(400).json({ message: 'Coupon is expired or not yet active.' });
      return;
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderTotal * Number(coupon.discount_value)) / 100;
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    const finalTotal = orderTotal - discountAmount;

    res.json({
      message: 'Coupon applied successfully.',
      data: {
        coupon_id: coupon.coupon_id,
        coupon_code: coupon.coupon_code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        order_total: Number(orderTotal.toFixed(2)),
        discount_amount: Number(discountAmount.toFixed(2)),
        final_total: Number(finalTotal.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const couponId = Number(req.params.coupon_id);
    if (!Number.isInteger(couponId)) {
      res.status(400).json({ message: 'Valid coupon_id is required.' });
      return;
    }

    const existing = await get('SELECT * FROM coupons WHERE coupon_id = ?', [couponId]);
    if (!existing) {
      res.status(404).json({ message: 'Coupon not found.' });
      return;
    }

    const couponCode = req.body.coupon_code !== undefined
      ? normalizeCouponCode(req.body.coupon_code)
      : existing.coupon_code;

    const discountType = req.body.discount_type !== undefined
      ? String(req.body.discount_type).toLowerCase()
      : existing.discount_type;

    const discountValue = req.body.discount_value !== undefined
      ? Number(req.body.discount_value)
      : Number(existing.discount_value);

    const validFrom = req.body.valid_from !== undefined ? req.body.valid_from : existing.valid_from;
    const validTo = req.body.valid_to !== undefined ? req.body.valid_to : existing.valid_to;

    const usageLimit = req.body.usage_limit !== undefined
      ? Number(req.body.usage_limit)
      : Number(existing.usage_limit);

    if (!couponCode) {
      res.status(400).json({ message: 'coupon_code cannot be empty.' });
      return;
    }

    if (!isValidDiscountType(discountType)) {
      res.status(400).json({ message: 'discount_type must be percentage or fixed.' });
      return;
    }

    if (Number.isNaN(discountValue) || discountValue <= 0) {
      res.status(400).json({ message: 'discount_value must be greater than 0.' });
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      res.status(400).json({ message: 'Percentage discount cannot exceed 100.' });
      return;
    }

    if (new Date(validTo) <= new Date(validFrom)) {
      res.status(400).json({ message: 'valid_to must be greater than valid_from.' });
      return;
    }

    if (!Number.isInteger(usageLimit) || usageLimit < 0) {
      res.status(400).json({ message: 'usage_limit must be a non-negative integer.' });
      return;
    }

    const duplicate = await get(
      'SELECT coupon_id FROM coupons WHERE coupon_code = ? AND coupon_id != ?',
      [couponCode, couponId],
    );

    if (duplicate) {
      res.status(409).json({ message: 'Coupon code already exists.' });
      return;
    }

    await run(
      `UPDATE coupons
       SET coupon_code = ?, discount_type = ?, discount_value = ?, valid_from = ?, valid_to = ?, usage_limit = ?, updated_at = CURRENT_TIMESTAMP
       WHERE coupon_id = ?`,
      [couponCode, discountType, discountValue, validFrom, validTo, usageLimit, couponId],
    );

    const updated = await get('SELECT * FROM coupons WHERE coupon_id = ?', [couponId]);
    res.json({ message: 'Coupon updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

const updateCouponStatus = async (req, res, next) => {
  try {
    const couponId = Number(req.params.coupon_id);
    const { status } = req.body;

    if (!Number.isInteger(couponId)) {
      res.status(400).json({ message: 'Valid coupon_id is required.' });
      return;
    }

    if (typeof status !== 'boolean') {
      res.status(400).json({ message: 'status must be a boolean.' });
      return;
    }

    const existing = await get('SELECT coupon_id FROM coupons WHERE coupon_id = ?', [couponId]);
    if (!existing) {
      res.status(404).json({ message: 'Coupon not found.' });
      return;
    }

    await run('UPDATE coupons SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE coupon_id = ?', [
      status ? 1 : 0,
      couponId,
    ]);

    const updated = await get('SELECT * FROM coupons WHERE coupon_id = ?', [couponId]);
    res.json({ message: `Coupon ${status ? 'activated' : 'deactivated'} successfully.`, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const couponId = Number(req.params.coupon_id);

    if (!Number.isInteger(couponId)) {
      res.status(400).json({ message: 'Valid coupon_id is required.' });
      return;
    }

    const existing = await get('SELECT coupon_id FROM coupons WHERE coupon_id = ?', [couponId]);
    if (!existing) {
      res.status(404).json({ message: 'Coupon not found.' });
      return;
    }

    await run('UPDATE coupons SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE coupon_id = ?', [
      couponId,
    ]);

    res.json({ message: 'Coupon deleted successfully (soft delete).' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoupon,
  getCouponsDashboard,
  applyCouponAtCheckout,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
};
