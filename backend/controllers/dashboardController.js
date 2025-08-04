import db, { sequelize } from '../sequelize_models/index.js';
import { Op, fn } from 'sequelize';
const { Product, Order, User, Review, Newsletter, Quote, OrderItem } = db;

// GET /api/dashboard/summary
export const getDashboardSummary = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalReviews, totalRevenue, totalSubscribers] = await Promise.all([
      Product.count(),
      Order.count(),
      User.count(),
      Review.count(),
      Order.sum('total'),
      Newsletter.count(),
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

    const [pendingQuotes, closedThisMonth] = await Promise.all([
      Quote.count({ where: { status: 'pending' } }),
      Quote.count({
        where: {
          status: 'closed',
          updatedAt: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    res.json({ pendingQuotes, closedThisMonth });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quote summary', error: err.message });
  }
};

export const getRevenueTrend = async (req, res, next) => {
  try {
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
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const data = await Order.findAll({
      attributes: [
        [fn('YEAR', sequelize.col('createdAt')), 'year'],
        [fn('MONTH', sequelize.col('createdAt')), 'month'],
        [fn('SUM', sequelize.col('total')), 'revenue'],
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: [fn('YEAR', sequelize.col('createdAt')), fn('MONTH', sequelize.col('createdAt'))],
      raw: true,
    });
    const trend = months.map(({ label, year, month }) => {
      const found = data.find(d => d.year == year && d.month == month + 1);
      return { month: label, revenue: found ? parseFloat(found.revenue) : 0 };
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
    const orderItems = await OrderItem.findAll({
      include: [{ model: Product, attributes: ['category'] }],
      raw: true,
    });
    const categoryCounts = {};
    orderItems.forEach(item => {
      const category = item['Product.category'];
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    const data = Object.entries(categoryCounts).map(([category, orders]) => ({ category, orders }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders by category', error: err.message });
  }
};

// GET /api/dashboard/user-signups
export const getUserSignups = async (req, res) => {
  try {
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
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const data = await User.findAll({
      attributes: [
        [fn('YEAR', sequelize.col('createdAt')), 'year'],
        [fn('MONTH', sequelize.col('createdAt')), 'month'],
        [fn('COUNT', sequelize.col('id')), 'signups'],
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: [fn('YEAR', sequelize.col('createdAt')), fn('MONTH', sequelize.col('createdAt'))],
      raw: true,
    });
    const trend = months.map(({ label, year, month }) => {
      const found = data.find(d => d.year == year && d.month == month + 1);
      return { month: label, signups: found ? parseInt(found.signups) : 0 };
    });
    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user signups', error: err.message });
  }
}; 