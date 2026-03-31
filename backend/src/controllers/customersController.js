const { all, get, run } = require('../db');

const normalizeStatus = (rawStatus) => {
  if (!rawStatus || rawStatus === 'all') {
    return null;
  }

  if (rawStatus === 'active') {
    return 1;
  }

  if (rawStatus === 'inactive') {
    return 0;
  }

  return null;
};

// Create new customer
const createCustomer = async (req, res, next) => {
  try {
    const { full_name: fullName, email, phone = '', role = 'customer' } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ message: 'Customer name is required.' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    // Check if email already exists
    const existing = await get('SELECT user_id FROM users WHERE email = ?', [email.trim()]);
    if (existing) {
      res.status(409).json({ message: 'Email already exists.' });
      return;
    }

    const inserted = await run(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, 1)
      `,
      [fullName.trim(), email.trim(), phone.trim(), 'default_hash', role],
    );

    const created = await get('SELECT * FROM users WHERE user_id = ?', [inserted.id]);
    res.status(201).json({ message: 'Customer created successfully.', data: created });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ message: 'Email already exists.' });
      return;
    }
    next(error);
  }
};

// List all customers with filters
const listCustomers = async (req, res, next) => {
  try {
    const { status: statusFilter } = req.query;
    const normalizedStatus = normalizeStatus(statusFilter);

    const whereClause = normalizedStatus === null ? '' : 'WHERE status = ?';
    const params = normalizedStatus === null ? [] : [normalizedStatus];

    const rows = await all(
      `
      SELECT
        user_id,
        full_name,
        email,
        phone,
        role,
        created_at,
        updated_at,
        status
      FROM users
      WHERE role = 'customer'
      ${normalizedStatus === null ? '' : 'AND status = ?'}
      ORDER BY updated_at DESC
      `,
      normalizedStatus === null ? [] : [normalizedStatus],
    );

    const totalCount = await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', [
      'customer',
    ]);
    const activeCount = await get('SELECT COUNT(*) AS count FROM users WHERE status = 1 AND role = ?', [
      'customer',
    ]);
    const inactiveCount = await get('SELECT COUNT(*) AS count FROM users WHERE status = 0 AND role = ?', [
      'customer',
    ]);

    res.json({
      data: rows,
      stats: {
        total: totalCount.count,
        active: activeCount.count,
        inactive: inactiveCount.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get customer details by ID
const getCustomerDetails = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Invalid customer id.' });
      return;
    }

    const customer = await get(
      `SELECT user_id, full_name, email, phone, role, created_at, updated_at, status 
       FROM users WHERE user_id = ?
      `,
      [customerId],
    );

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
};

// Update customer details
const updateCustomer = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);
    const { full_name: fullName, email, phone = '' } = req.body;

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Invalid customer id.' });
      return;
    }

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ message: 'Customer name is required.' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const customer = await get('SELECT * FROM users WHERE user_id = ?', [customerId]);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    // Check if new email is different and already exists
    if (email.trim() !== customer.email) {
      const duplicate = await get('SELECT user_id FROM users WHERE email = ? AND user_id != ?', [
        email.trim(),
        customerId,
      ]);
      if (duplicate) {
        res.status(409).json({ message: 'Email already exists.' });
        return;
      }
    }

    await run(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?
      `,
      [fullName.trim(), email.trim(), phone.trim(), customerId],
    );

    const updated = await get('SELECT * FROM users WHERE user_id = ?', [customerId]);
    res.json({ message: 'Customer updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

// Deactivate/Delete customer (soft delete)
const deactivateCustomer = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Invalid customer id.' });
      return;
    }

    const customer = await get('SELECT * FROM users WHERE user_id = ?', [customerId]);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    if (customer.status === 0) {
      res.status(409).json({ message: 'Customer is already inactive.' });
      return;
    }

    await run(
      `UPDATE users SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [customerId],
    );

    const deactivated = await get('SELECT * FROM users WHERE user_id = ?', [customerId]);
    res.json({ message: 'Customer deactivated successfully.', data: deactivated });
  } catch (error) {
    next(error);
  }
};

// Reactivate customer
const reactivateCustomer = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Invalid customer id.' });
      return;
    }

    const customer = await get('SELECT * FROM users WHERE user_id = ?', [customerId]);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    if (customer.status === 1) {
      res.status(409).json({ message: 'Customer is already active.' });
      return;
    }

    await run(
      `UPDATE users SET status = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [customerId],
    );

    const reactivated = await get('SELECT * FROM users WHERE user_id = ?', [customerId]);
    res.json({ message: 'Customer reactivated successfully.', data: reactivated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerDetails,
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer,
};
