import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Newsletter from '../models/Newsletter.js';
import Quote from '../models/Quote.js';

// GET /api/dashboard/summary
export const getDashboardSummary = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalReviews, totalRevenue, totalSubscribers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]).then(r => r[0]?.total || 0),
      Newsletter.countDocuments(),
      // Add logic for total revenue if superadmin
      req.user.role === 'superadmin' ? Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]).then(r => r[0]?.total || 0) : Promise.resolve([{ totalRevenue: 0 }]),
    ]);
    res.json({ totalProducts, totalOrders, totalUsers, totalReviews, revenue: totalRevenue, subscribers: totalSubscribers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: err.message });
  }
};

export const getQuoteSummary = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const pendingQuotes = await Quote.countDocuments({ status: 'pending' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const closedThisMonth = await Quote.countDocuments({
      status: 'closed',
      updatedAt: { $gte: startOfMonth },
    });

    res.json({
      pendingQuotes,
      closedThisMonth,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/revenue-trend
export const getRevenueTrend = async (req, res) => {
  try {
    // Last 6 months revenue by month
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    const pipeline = [
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
      } },
    ];
    const data = await Order.aggregate(pipeline);
    const trend = months.map(({ label, year, month }) => {
      const found = data.find(d => d._id.year === year && d._id.month === month + 1);
      return { month: label, revenue: found ? found.revenue : 0 };
    });
    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revenue trend', error: err.message });
  }
};

// GET /api/dashboard/orders-by-category
export const getOrdersByCategory = async (req, res) => {
  try {
    // Group orders by product category
    const pipeline = [
      { $unwind: '$items' },
      { $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
      } },
      { $unwind: '$product' },
      { $group: {
        _id: '$product.category',
        orders: { $sum: 1 },
      } },
      { $project: { category: '$_id', orders: 1, _id: 0 } },
    ];
    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders by category', error: err.message });
  }
};

// GET /api/dashboard/user-signups
export const getUserSignups = async (req, res) => {
  try {
    // Last 6 months user signups by month
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    const pipeline = [
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        signups: { $sum: 1 },
      } },
    ];
    const data = await User.aggregate(pipeline);
    const trend = months.map(({ label, year, month }) => {
      const found = data.find(d => d._id.year === year && d._id.month === month + 1);
      return { month: label, signups: found ? found.signups : 0 };
    });
    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user signups', error: err.message });
  }
}; 