
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Controller to get summary data
exports.getSummary = async (req, res) => {
  try {
    // Fetch total users, total products, total orders
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue
    const totalRevenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (err) {
    console.error('Failed to fetch summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};
