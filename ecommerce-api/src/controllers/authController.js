const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorMiddleware');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');


// Register new user
exports.register = async (req, res) => {
    try {
        console.log("Received registration data:", { ...req.body, password: '[REDACTED]' });
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            throw new AppError(errors.array()[0].msg, 400);
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            throw new AppError('User already exists', 400);
        }

        console.log('Creating new user with email:', email);
        
        // Create new user
        user = new User({
            name,
            email,
            password,
            role: 'user'
        });
        
        console.log('Saving user...');
        await user.save();
        console.log('User saved successfully');

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400);
        }
        throw error;
    }
};

// Update password directly
const updateUserPassword = async (email, newPassword) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );
        
        if (!user) {
            throw new AppError('User not found', 404);
        }
        
        return user;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            throw new AppError('Please provide email and password', 400);
        }

        console.log('Login attempt for email:', email);

        // Check if user exists and explicitly select password field
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('No user found with email:', email);
            throw new AppError('Invalid credentials', 401);
        }

        if (!user.password) {
            console.log('No password found for user:', email);
            throw new AppError('Invalid credentials', 401);
        }

        console.log('User found:', {
            id: user._id,
            email: user.email,
            name: user.name,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
        });

        // Check if user is active
        if (!user.isActive) {
            console.log('Account is deactivated for user:', email);
            throw new AppError('Account is deactivated', 401);
        }

        console.log('User found, comparing passwords...');
        // Direct bcrypt comparison
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch);
        
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            throw new AppError('Invalid credentials', 401);
        }

        // Additional validation to ensure password is correct
        if (!user.password || !user.password.startsWith('$2')) {
            console.log('Invalid password hash for user:', email);
            throw new AppError('Invalid credentials', 401);
        }

        console.log('Password verified, generating token...');
        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        console.log('Login successful for user:', email);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                emailVerified: user.emailVerified,
                avatar: user.avatar,
                phone: user.phone,
                addresses: user.addresses,
                preferredLanguage: user.preferredLanguage,
                preferredCurrency: user.preferredCurrency,
                notificationPreferences: user.notificationPreferences,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Invalid credentials', 401);
    }
};

//Logout user
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

exports.getCurrentUser = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        user
    });
};


// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        console.log('Updating profile for user:', req.user._id);
        
        // Find user by _id
        const user = await User.findById(req.user._id);
        if (!user) {
            console.log('User not found with ID:', req.user._id);
            throw new AppError('User not found', 404);
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        throw error;
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Processing forgot password request for email:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(404).json({ 
                success: false, 
                message: 'No user found with that email address' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        try {
            // Use the passwordReset template
            await emailTemplates.passwordReset(user, resetToken);

            console.log('Password reset email sent successfully to:', user.email);
            res.json({ 
                success: true, 
                message: 'Password reset email sent successfully' 
            });
        } catch (err) {
            console.error('Error sending reset email:', err);
            
            // Clear reset token on failure
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            // Send a more specific error message
            const errorMessage = err.message || 'Email could not be sent. Please try again later.';
            throw new AppError(errorMessage, 500);
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        // Send a more specific error response
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'An error occurred while processing your request'
        });
    }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log('Processing password reset request with token');

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token & valid expiry
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token');
      throw new AppError('Token is invalid or has expired', 400);
    }

    console.log('User found for password reset:', {
      id: user._id,
      email: user.email
    });

    // Set the new password (pre-save middleware will hash it)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Save the user document
    await user.save();
    console.log('Password updated successfully for user:', user.email);

    // Verify the password was saved correctly
    const updatedUser = await User.findById(user._id).select('+password');
    console.log('Verifying password update:', {
      hasPassword: !!updatedUser.password,
      passwordLength: updatedUser.password ? updatedUser.password.length : 0
    });

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

//change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        console.log('Changing password for user:', req.user._id);

        // Find user and explicitly select password field
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            console.log('User not found');
            throw new AppError('User not found', 404);
        }

        console.log('User found:', {
            id: user._id,
            email: user.email,
            hasPassword: !!user.password
        });

        // Use the model's comparePassword method
        console.log('Comparing current password...');
        const isMatch = await user.comparePassword(currentPassword);
        console.log('Current password comparison result:', isMatch);

        if (!isMatch) {
            console.log('Current password verification failed');
            throw new AppError('Incorrect current password', 401);
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new AppError('New password must be at least 6 characters long', 400);
        }

        console.log('Current password verified, updating to new password...');
        // Set the new password (pre-save middleware will hash it)
        user.password = newPassword;
        await user.save();
        console.log('Password updated successfully');

        // Generate new token after password change
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ 
            success: true,
            message: 'Password changed successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
};

//Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Deleting account for email:', email);

        // Find user by email and explicitly select password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found with email:', email);
            throw new AppError('User not found', 404);
        }

        console.log('Found user, comparing passwords...');
        // Compare provided password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password comparison failed');
            throw new AppError('Invalid password', 401);
        }

        console.log('Password verified, deleting account...');
        // Delete the user account
        await User.findByIdAndDelete(user._id);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        throw error;
    }
};
