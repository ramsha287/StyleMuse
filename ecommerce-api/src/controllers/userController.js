const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError } = require('../middlewares/errorMiddleware');
const nodemailer = require('nodemailer');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    // Apply filters
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
        success: true,
        users,
        totalPages: Math.ceil(total / limit)
    });
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    res.json({
        success: true,
        user
    });
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    ).select('-password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        user
    });
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
};

// Get user profile
exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    res.json({
        success: true,
        user
    });
};

// Add address
exports.addAddress = async (req, res) => {
    try {
        const { street, city, state, zipCode, country, isDefault } = req.body;
        
        if (!street || !city || !state || !zipCode || !country) {
            throw new AppError('All fields are required', 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Create new address
        const newAddress = {
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
        };

        // If this is the first address or isDefault is true, handle default address
        if (isDefault || user.addresses.length === 0) {
            user.addresses.forEach(addr => addr.isDefault = false);
            newAddress.isDefault = true;
        }

        // Add the new address
        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: newAddress
        });
    } catch (error) {
        throw error;
    }
};

// Update address
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { street, city, state, zipCode, country, isDefault } = req.body;

        if (!street || !city || !state || !zipCode || !country) {
            throw new AppError('All fields are required', 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Find the address index
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            throw new AppError('Address not found', 404);
        }

        // Update address fields
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
        };

        // If setting as default, update other addresses
        if (isDefault) {
            user.addresses.forEach((addr, index) => {
                if (index !== addressIndex) {
                    addr.isDefault = false;
                }
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address updated successfully',
            address: user.addresses[addressIndex]
        });
    } catch (error) {
        throw error;
    }
};

// Delete address
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Find the address index
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            throw new AppError('Address not found', 404);
        }

        // Remove the address
        user.addresses.splice(addressIndex, 1);

        // If we deleted the default address and there are other addresses, set a new default
        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        throw error;
    }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Resending verification email to:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            throw new AppError('User not found', 404);
        }

        if (user.emailVerified) {
            console.log('Email already verified for user:', email);
            throw new AppError('Email is already verified', 400);
        }

        // Generate new verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save();

        // TODO: Send verification email
        // For now, just return the token
        console.log('Verification token generated for user:', email);
        res.json({
            success: true,
            message: 'Verification email sent',
            verificationToken // In production, remove this and send via email
        });
    } catch (error) {
        console.error('Resend verification email error:', error);
        throw error;
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Verifying email with token:', token);

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching token and non-expired verification
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Invalid or expired verification token');
            throw new AppError('Invalid or expired verification token', 400);
        }

        // Update user's email verification status
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        console.log('Email verified successfully for user:', user.email);
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        throw error;
    }
};


exports.deactivateUser = async (req, res) => {
    try {
        // Ensure only admins can perform this action
        if (req.user.role !== 'admin') {
            throw new AppError('Access denied. Admins only.', 403);
        }

        // Prevent the admin from deactivating their own account
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account',
            });
        }

        // Find the user to deactivate
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Deactivate the user
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: `User account with ID ${req.params.id} deactivated successfully`,
        });
    } catch (error) {
        console.error('Error deactivating user:', error);
        throw error;
    }
};

// Reactivate user account  
exports.reactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        user.isActive = true;
        await user.save();

        res.json({
            success: true,
            message: 'User account reactivated successfully'
        });
    } catch (error) {
        console.error('Error reactivating user:', error);
        throw error;
    }
};

// Get Addresses
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            addresses: user.addresses
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};






