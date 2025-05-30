const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Protected routes (admin only)
router.post('/', auth, admin, validateRequest, createCategory);
router.patch('/:id', auth, admin, validateRequest, updateCategory);
router.delete('/:id', auth, admin, deleteCategory);

module.exports = router;