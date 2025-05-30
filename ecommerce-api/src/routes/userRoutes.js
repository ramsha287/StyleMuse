const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middlewares/authMiddleware');
const { validateRequest, userValidationRules } = require('../middlewares/validationMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// Public routes
router.post('/verify-email/:token', asyncHandler(userController.verifyEmail));
router.post('/resend-verification', asyncHandler(userController.resendVerificationEmail));

// Protected routes
router.use(auth);


// Address routes
router.post('/address', asyncHandler(userController.addAddress));
router.get('/address', asyncHandler(userController.getAddresses));
router.patch('/address/:addressId', asyncHandler(userController.updateAddress));
router.delete('/address/:addressId', asyncHandler(userController.deleteAddress));


// Admin only routes
router.get('/', authorize('admin'), asyncHandler(userController.getAllUsers));
router.get('/:id', authorize('admin'), asyncHandler(userController.getUserById));
router.patch('/:id/role', 
    authorize('admin'),
    userValidationRules.updateRole,
    validateRequest,
    asyncHandler(userController.updateUserRole)
);
router.delete('/:id', authorize('admin'), asyncHandler(userController.deleteUser));
router.put('/:id/deactivate', authorize('admin'), asyncHandler(userController.deactivateUser));
router.put('/:id/reactivate', authorize('admin'), asyncHandler(userController.reactivateUser));

module.exports = router;