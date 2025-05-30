const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'seller'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    addresses: [{
        street: {
            type: String,
            required: [true, 'Street is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required']
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    preferredLanguage: {
        type: String,
        default: 'en'
    },
    preferredCurrency: {
        type: String,
        default: 'USD'
    },
    notificationPreferences: {
        email: {
            type: Boolean,
            default: true
        },
        push: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it has been modified (or is new)
        if (!this.isModified('password')) {
            console.log('Password not modified, skipping hash');
            return next();
        }

        // Check if password is already hashed
        if (this.password.startsWith('$2')) {
            console.log('Password already hashed, skipping');
            return next();
        }

        console.log('Hashing password before save');
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password along with our new salt
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        if (!this.password) {
            console.log('No password found for user');
            return false;
        }

        if (!candidatePassword) {
            console.log('No candidate password provided');
            return false;
        }

        // Validate password hash format
        if (!this.password.startsWith('$2')) {
            console.log('Invalid password hash format');
            return false;
        }

        // Direct bcrypt comparison
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison:', {
            candidateLength: candidatePassword.length,
            storedHashLength: this.password.length,
            isMatch: isMatch
        });
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

// Virtual for password reset URL
userSchema.virtual('resetPasswordUrl').get(function() {
    const resetToken = this.getResetPasswordToken();
    return `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
});

// Virtual for email verification URL
userSchema.virtual('emailVerificationUrl').get(function() {
    const verificationToken = this.getEmailVerificationToken();
    return `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
});

module.exports = mongoose.model('User', userSchema);