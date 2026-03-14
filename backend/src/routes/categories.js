const express = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
} = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', listCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.patch('/:id/status', updateCategoryStatus);

module.exports = router;
