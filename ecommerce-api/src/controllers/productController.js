const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorMiddleware');

const generateSKU = (name) => {
    return name.slice(0, 3).toUpperCase() + "-" + Date.now().toString().slice(-4);
};

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            featured,
            inStock
        } = req.query;

        // Build query
        const query = {};

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by brand
        if (brand) {
            query.brand = brand;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter by featured status
        if (featured) {
            query.featured = featured === 'true';
        }

        // Filter by stock status
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        // Execute query with pagination
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get all products error:', error);
        throw new AppError('Error fetching products', 500);
    }
};

// Get single product by ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('brand', 'name')
            .populate('ratings.user', 'name');

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        throw error;
    }
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 400);
        }

        // Check if category exists
        const category = await Category.findById(req.body.category);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Handle files from multer.fields()
        const images = req.files?.images ? req.files.images.map(file => file.filename) : [];
        const video = req.files?.video ? req.files.video[0].filename : null;
        
        if (images.length === 0) {
            throw new AppError('At least one image is required', 400);
        }

        const sku = generateSKU(req.body.name);
        const product = new Product({ 
            ...req.body, 
            sku,
            images,
            video
        });
        await product.save();

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        throw error;
    }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(errors.array()[0].msg, 400);
        }

        // If category is being updated, check if it exists
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        throw error;
    }
};



// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Get all descendant categories
        const descendantCategories = await category.getDescendants();
        const categoryIds = [categoryId, ...descendantCategories.map(cat => cat._id)];

        const products = await Product.find({ category: { $in: categoryIds } })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments({ category: { $in: categoryIds } });

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            category
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        throw error;
    }
};

// Get products by brand
exports.getProductsByBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const products = await Product.find({ brand: brandId })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments({ brand: brandId });

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get products by brand error:', error);
        throw error;
    }
};

// Get featured products by category
exports.getFeaturedProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { limit = 10 } = req.query;

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Get all descendant categories
        const descendantCategories = await category.getDescendants();
        const categoryIds = [categoryId, ...descendantCategories.map(cat => cat._id)];

        const products = await Product.find({
            category: { $in: categoryIds },
            featured: true,
            isActive: true
        })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort('-createdAt')
            .limit(limit * 1);

        res.json({
            success: true,
            products,
            category
        });
    } catch (error) {
        console.error('Get featured products by category error:', error);
        throw error;
    }
};

// Get products by category with filters
exports.getProductsByCategoryWithFilters = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            minPrice,
            maxPrice,
            brands,
            inStock,
            featured
        } = req.query;

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Get all descendant categories
        const descendantCategories = await category.getDescendants();
        const categoryIds = [categoryId, ...descendantCategories.map(cat => cat._id)];

        // Build query
        const query = { category: { $in: categoryIds } };

        // Apply filters
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (brands) {
            const brandIds = brands.split(',');
            query.brand = { $in: brandIds };
        }

        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        if (featured === 'true') {
            query.featured = true;
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(query);

        // Get available brands in this category
        const availableBrands = await Product.distinct('brand', { category: { $in: categoryIds } });

        // Get price range
        const priceStats = await Product.aggregate([
            { $match: { category: { $in: categoryIds } } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            category,
            filters: {
                availableBrands,
                priceRange: priceStats.length > 0 ? {
                    min: priceStats[0].minPrice,
                    max: priceStats[0].maxPrice
                } : { min: 0, max: 0 }
            }
        });
    } catch (error) {
        console.error('Get products by category with filters error:', error);
        throw error;
    }
};


//inventory management

exports.updateStockQuantity = async (req, res) => {
    const { stock } = req.body;

    if (stock == null || stock < 0) {
        res.status(400);
        throw new Error('Stock quantity must be a non-negative number');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.stock = stock;
    await product.save();

    res.status(200).json({
        message: 'Stock updated successfully',
        stock: product.stock,
    });
};

exports.markProductOutOfStock = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.stock = 0;
    await product.save();

    res.status(200).json({
        message: 'Product marked as out of stock',
        stock: product.stock,
    });
};

// Get products by category name
exports.getProductsByCategoryName = async (req, res) => {
    const { categoryName } = req.params;
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const products = await Product.find({ category: category._id });
    res.json({products});
};


