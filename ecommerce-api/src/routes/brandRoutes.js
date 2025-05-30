const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const {
    getAllBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/brandController');

// Public routes
router.get('/', getAllBrands);
router.get('/:id', getBrand);

// Protected routes (admin only)
router.post('/', auth, admin, validateRequest, createBrand);
router.patch('/:id', auth, admin, validateRequest, updateBrand);
router.delete('/:id', auth, admin, deleteBrand);

module.exports = router;