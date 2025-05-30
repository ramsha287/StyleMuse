const express = require('express');
const router = express.Router();
const { auth, admin, protect } = require('../middlewares/authMiddleware');
const { productValidationRules, validateRequest } = require('../middlewares/validationMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
    createProduct,
    updateProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    addReview,
    getProductsByCategoryName,
    getProductsByBrand,
    updateStockQuantity,
    markProductOutOfStock,
    uploadProductImage,
} = require('../controllers/productController');

// Public routes
router.get('/category/:categoryName', asyncHandler(getProductsByCategoryName));
router.get('/brand/:brandId', asyncHandler(getProductsByBrand));
router.get('/:id', asyncHandler(getProduct)); 
router.get('/', asyncHandler(getAllProducts));

// Protected routes (admin only)
router.post(
    '/',
    auth,
    admin,
    upload,
    productValidationRules.create,
    validateRequest,
    asyncHandler(createProduct)
);

router.patch('/:id', auth, admin, productValidationRules.update, validateRequest, asyncHandler(updateProduct));
router.delete('/:id', auth, admin, asyncHandler(deleteProduct));

// Inventory routes (admin only)
router.put('/:id/stock', protect, admin, updateStockQuantity);
router.put('/:id/out-of-stock', protect, admin, markProductOutOfStock);

module.exports = router;