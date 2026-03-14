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

const listCategories = async (req, res, next) => {
  try {
    const normalizedStatus = normalizeStatus(req.query.status);

    const whereClause = normalizedStatus === null ? '' : 'WHERE c.status = ?';
    const params = normalizedStatus === null ? [] : [normalizedStatus];

    const rows = await all(
      `
      SELECT
        c.category_id,
        c.category_name,
        c.description,
        c.created_at,
        c.updated_at,
        c.status,
        COUNT(p.product_id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id AND p.status = 1
      ${whereClause}
      GROUP BY c.category_id
      ORDER BY c.updated_at DESC
      `,
      params,
    );

    const activeCount = await get('SELECT COUNT(*) AS count FROM categories WHERE status = 1');
    const inactiveCount = await get('SELECT COUNT(*) AS count FROM categories WHERE status = 0');

    res.json({
      data: rows,
      stats: {
        total: rows.length,
        active: activeCount.count,
        inactive: inactiveCount.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { category_name: categoryName, description = '' } = req.body;

    if (!categoryName || !categoryName.trim()) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const inserted = await run(
      `
      INSERT INTO categories (category_name, description, status)
      VALUES (?, ?, 1)
      `,
      [categoryName.trim(), description.trim()],
    );

    const created = await get('SELECT * FROM categories WHERE category_id = ?', [inserted.id]);
    res.status(201).json({ message: 'Category created successfully.', data: created });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ message: 'Category name already exists.' });
      return;
    }
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const { category_name: categoryName, description = '' } = req.body;

    if (!Number.isInteger(categoryId)) {
      res.status(400).json({ message: 'Invalid category id.' });
      return;
    }

    if (!categoryName || !categoryName.trim()) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const existing = await get('SELECT * FROM categories WHERE category_id = ?', [categoryId]);
    if (!existing) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    await run(
      `
      UPDATE categories
      SET category_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE category_id = ?
      `,
      [categoryName.trim(), description.trim(), categoryId],
    );

    const updated = await get('SELECT * FROM categories WHERE category_id = ?', [categoryId]);
    res.json({ message: 'Category updated successfully.', data: updated });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ message: 'Category name already exists.' });
      return;
    }
    next(error);
  }
};

const updateCategoryStatus = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const { status, replacementCategoryId } = req.body;

    if (!Number.isInteger(categoryId)) {
      res.status(400).json({ message: 'Invalid category id.' });
      return;
    }

    if (typeof status !== 'boolean') {
      res.status(400).json({ message: 'Status must be a boolean value.' });
      return;
    }

    const category = await get('SELECT * FROM categories WHERE category_id = ?', [categoryId]);
    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    if (status === false) {
      const productCountData = await get(
        'SELECT COUNT(*) AS count FROM products WHERE category_id = ? AND status = 1',
        [categoryId],
      );

      const productCount = productCountData?.count ?? 0;
      if (productCount > 0 && !replacementCategoryId) {
        res.status(409).json({
          message:
            'This category has active products. Assign products to another category before deactivation.',
          productCount,
        });
        return;
      }

      if (productCount > 0 && replacementCategoryId) {
        const replacement = await get(
          'SELECT category_id, status FROM categories WHERE category_id = ?',
          [replacementCategoryId],
        );

        if (!replacement || replacement.status === 0) {
          res.status(400).json({ message: 'Replacement category must be active and valid.' });
          return;
        }

        await run('UPDATE products SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE category_id = ?', [
          replacementCategoryId,
          categoryId,
        ]);
      }
    }

    await run(
      `
      UPDATE categories
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE category_id = ?
      `,
      [status ? 1 : 0, categoryId],
    );

    const updated = await get('SELECT * FROM categories WHERE category_id = ?', [categoryId]);
    res.json({ message: 'Category status updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
};
