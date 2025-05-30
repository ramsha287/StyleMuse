const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');
require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();


const dns = require('dns');
dns.lookup(process.env.SMTP_HOST, (err, address, family) => {
    console.log(`Resolved ${process.env.SMTP_HOST} to ${address} (IPv${family})`);
});


// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    debug: true, 
});

// Read email template
const readTemplate = async (templateName) => {
    try {
        const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
        const template = await fs.readFile(templatePath, 'utf-8');
        return handlebars.compile(template);
    } catch (error) {
        logger.error('Error reading email template:', error);
        throw new Error('Error reading email template');
    }
};

// Send email
const sendEmail = async (options) => {
    try {
        // Log SMTP configuration (without password)
        logger.info('SMTP Configuration:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            user: process.env.SMTP_USER
        });

        // Verify transporter configuration
        await transporter.verify();
        logger.info('SMTP connection verified successfully');

        let html = options.html;
        if (options.template) {
            const template = await readTemplate(options.template);
            html = template(options.context);
        }

        // Email options
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: html
        };

        logger.info('Attempting to send email to:', options.to);

        // Send email
        const info = await transporter.sendMail(mailOptions);
        logger.info('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        logger.error('Error sending email:', error);
        if (error.code === 'EAUTH') {
            throw new Error('SMTP authentication failed. Please check your email credentials.');
        } else if (error.code === 'ESOCKET') {
            throw new Error('Could not connect to SMTP server. Please check your SMTP settings.');
        } else {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
};

// Email templates
const emailTemplates = {
    // Welcome email
    welcome: async (user) => {
        return sendEmail({
            to: user.email,
            subject: 'Welcome to Our E-commerce Platform',
            template: 'welcome',
            context: {
                name: user.name,
                loginUrl: `${process.env.FRONTEND_URL}/login`
            }
        });
    },

    // Order confirmation email
    orderConfirmation: async (order, user) => {
        return sendEmail({
            to: user.email,
            subject: 'Order Confirmation',
            template: 'orderConfirmation',
            context: {
                name: user.name,
                orderNumber: order._id,
                orderDate: order.createdAt.toLocaleDateString(),
                items: order.items,
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress
            }
        });
    },

    // Password reset email
    passwordReset: async (user, resetToken) => {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        return sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            template: 'passwordReset',
            context: {
                name: user.name,
                resetUrl: resetUrl
            }
        });
    },

    // Order status update email
    orderStatusUpdate: async (order, user) => {
        return sendEmail({
            to: user.email,
            subject: 'Order Status Update',
            template: 'orderStatusUpdate',
            context: {
                name: user.name,
                orderNumber: order._id,
                status: order.status,
                orderUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
            }
        });
    }
};

module.exports = {
    sendEmail,
    emailTemplates
};