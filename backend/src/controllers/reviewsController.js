const { all, get, run } = require('../db');

const addReview = async (req, res, next) => {
  try {
    const {
      product_id: productId,
      customer_id: customerId,
      rating,
      review_text: reviewText,
    } = req.body;

    if (!Number.isInteger(productId)) {
      res.status(400).json({ message: 'Valid product_id is required.' });
      return;
    }

    if (!Number.isInteger(customerId)) {
      res.status(400).json({ message: 'Valid customer_id is required.' });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    const product = await get(
      'SELECT product_id, product_name FROM products WHERE product_id = ? AND status = 1',
      [productId],
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
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

    const existingReview = await get(
      'SELECT review_id FROM reviews WHERE product_id = ? AND customer_id = ?',
      [productId, customerId],
    );

    if (existingReview) {
      res.status(409).json({ message: 'You have already reviewed this product.' });
      return;
    }

    const inserted = await run(
      `INSERT INTO reviews (product_id, customer_id, rating, review_text, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [productId, customerId, rating, reviewText || null],
    );

    const created = await get(
      `SELECT r.*, p.product_name, u.full_name, u.email
       FROM reviews r
       JOIN products p ON r.product_id = p.product_id
       JOIN users u ON r.customer_id = u.user_id
       WHERE r.review_id = ?
      `,
      [inserted.id],
    );

    res.status(201).json({
      message: 'Review submitted successfully. Pending moderation.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { product_id: productId } = req.params;
    const { status = 'approved' } = req.query;

    if (!Number.isInteger(parseInt(productId, 10))) {
      res.status(400).json({ message: 'Valid product_id is required.' });
      return;
    }

    const product = await get(
      'SELECT product_id, product_name FROM products WHERE product_id = ? AND status = 1',
      [productId],
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    let whereClause = 'r.product_id = ?';
    const params = [productId];

    if (status === 'approved') {
      whereClause += ' AND r.status = 1';
    } else if (status === 'pending') {
      whereClause += ' AND r.status = 0';
    }

    const reviews = await all(
      `SELECT r.review_id, r.product_id, r.customer_id, r.rating, r.review_text,
              r.created_at, r.updated_at, r.status,
              u.full_name, u.email
       FROM reviews r
       JOIN users u ON r.customer_id = u.user_id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
      `,
      params,
    );

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      data: reviews,
      product,
      stats: {
        total_reviews: reviews.length,
        average_rating: parseFloat(avgRating),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerReviews = async (req, res, next) => {
  try {
    const { customer_id: customerId } = req.params;

    if (!Number.isInteger(parseInt(customerId, 10))) {
      res.status(400).json({ message: 'Valid customer_id is required.' });
      return;
    }

    const customer = await get(
      'SELECT user_id, full_name FROM users WHERE user_id = ? AND status = 1',
      [customerId],
    );

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    const reviews = await all(
      `SELECT r.review_id, r.product_id, r.customer_id, r.rating, r.review_text,
              r.created_at, r.updated_at, r.status,
              p.product_name, p.price
       FROM reviews r
       JOIN products p ON r.product_id = p.product_id
       WHERE r.customer_id = ?
       ORDER BY r.created_at DESC
      `,
      [customerId],
    );

    res.json({
      data: reviews,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminReviewsDashboard = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;

    let whereClause = 'r.review_id IS NOT NULL';
    const params = [];

    if (status === 'approved') {
      whereClause += ' AND r.status = 1';
    } else if (status === 'pending') {
      whereClause += ' AND r.status = 0';
    } else if (status === 'rejected') {
      whereClause += ' AND r.status = 2';
    }

    const reviews = await all(
      `SELECT r.review_id, r.product_id, r.customer_id, r.rating, r.review_text,
              r.created_at, r.updated_at, r.status,
              p.product_name, u.full_name, u.email,
              COUNT(*) OVER() as total_count
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.product_id
       LEFT JOIN users u ON r.customer_id = u.user_id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
      `,
      params,
    );

    const stats = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      average_rating: 0,
    };

    let ratingSum = 0;
    let ratingCount = 0;

    reviews.forEach((review) => {
      if (review.status === 1) stats.approved++;
      else if (review.status === 0) stats.pending++;
      else if (review.status === 2) stats.rejected++;

      ratingSum += review.rating;
      ratingCount++;
    });

    stats.total = reviews.length > 0 ? reviews[0].total_count : 0;
    stats.average_rating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 0;

    res.json({
      data: reviews,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

const moderateReview = async (req, res, next) => {
  try {
    const { review_id: reviewId } = req.params;
    const { action } = req.body;

    if (!Number.isInteger(parseInt(reviewId, 10))) {
      res.status(400).json({ message: 'Valid review_id is required.' });
      return;
    }

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Action must be approve or reject.' });
      return;
    }

    const review = await get('SELECT review_id, status FROM reviews WHERE review_id = ?', [
      reviewId,
    ]);

    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    const newStatus = action === 'approve' ? 1 : 2;

    await run('UPDATE reviews SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?', [
      newStatus,
      reviewId,
    ]);

    const updated = await get(
      `SELECT r.*, p.product_name, u.full_name, u.email
       FROM reviews r
       JOIN products p ON r.product_id = p.product_id
       JOIN users u ON r.customer_id = u.user_id
       WHERE r.review_id = ?
      `,
      [reviewId],
    );

    res.json({
      message: `Review ${action}ed successfully.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { review_id: reviewId } = req.params;
    const { rating, review_text: reviewText, customer_id: customerId } = req.body;

    if (!Number.isInteger(parseInt(reviewId, 10))) {
      res.status(400).json({ message: 'Valid review_id is required.' });
      return;
    }

    const review = await get('SELECT * FROM reviews WHERE review_id = ?', [reviewId]);

    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    if (customerId && review.customer_id !== customerId) {
      res.status(403).json({ message: 'You can only update your own reviews.' });
      return;
    }

    let newRating = review.rating;
    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
        return;
      }
      newRating = rating;
    }

    const newText = reviewText !== undefined ? reviewText : review.review_text;

    await run(
      `UPDATE reviews SET rating = ?, review_text = ?, status = 0, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?`,
      [newRating, newText || null, reviewId],
    );

    const updated = await get(
      `SELECT r.*, p.product_name, u.full_name, u.email
       FROM reviews r
       JOIN products p ON r.product_id = p.product_id
       JOIN users u ON r.customer_id = u.user_id
       WHERE r.review_id = ?
      `,
      [reviewId],
    );

    res.json({
      message: 'Review updated and sent for moderation.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { review_id: reviewId } = req.params;
    const { customer_id: customerId, is_admin: isAdmin } = req.body;

    if (!Number.isInteger(parseInt(reviewId, 10))) {
      res.status(400).json({ message: 'Valid review_id is required.' });
      return;
    }

    const review = await get('SELECT * FROM reviews WHERE review_id = ?', [reviewId]);

    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    if (!isAdmin && review.customer_id !== customerId) {
      res.status(403).json({ message: 'You can only delete your own reviews.' });
      return;
    }

    await run('DELETE FROM reviews WHERE review_id = ?', [reviewId]);

    res.json({
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getCustomerReviews,
  getAdminReviewsDashboard,
  moderateReview,
  updateReview,
  deleteReview,
};
