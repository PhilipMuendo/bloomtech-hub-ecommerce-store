import db, { sequelize } from '../sequelize_models/index.js';
import { Op, fn } from 'sequelize';
const { Product, Order, User, Review, Newsletter, Quote, OrderItem } = db;

// GET /api/dashboard/summary
export const getDashboardSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const [totalProducts, totalOrders, totalUsers, totalReviews, totalRevenue, totalSubscribers] = await Promise.all([
      Product.count(),
      Order.count({ where: dateFilter }),
      User.count({ where: dateFilter }),
      Review.count({ where: dateFilter }),
      Order.sum('total', { where: dateFilter }),
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

    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.updatedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const [pendingQuotes, closedQuotes] = await Promise.all([
      Quote.count({ where: { status: 'pending' } }),
      Quote.count({
        where: {
          status: 'closed',
          ...dateFilter
        },
      }),
    ]);

    res.json({ pendingQuotes, closedThisMonth: closedQuotes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quote summary', error: err.message });
  }
};

export const getRevenueTrend = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 6 months if no date range provided
      end = new Date();
      start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
    }

    // Generate monthly data points within the date range
    const months = [];
    const current = new Date(start);
    while (current <= end) {
      months.push({
        label: current.toLocaleString('default', { month: 'short' }),
        year: current.getFullYear(),
        month: current.getMonth(),
      });
      current.setMonth(current.getMonth() + 1);
    }

    const data = await Order.findAll({
      attributes: [
        [fn('YEAR', sequelize.col('createdAt')), 'year'],
        [fn('MONTH', sequelize.col('createdAt')), 'month'],
        [fn('SUM', sequelize.col('total')), 'revenue'],
      ],
      where: { 
        createdAt: { 
          [Op.between]: [start, end] 
        } 
      },
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
    const { startDate, endDate } = req.query;
    
    // Build date filter for orders
    const orderDateFilter = {};
    if (startDate && endDate) {
      orderDateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Define the 4 main categories
    const mainCategories = ['security', 'ict', 'electrical', 'power'];
    
    // Group orders by product category with date filter
    const orderItems = await OrderItem.findAll({
      include: [{ 
        model: Product, 
        attributes: ['category'] 
      }, {
        model: Order,
        where: orderDateFilter,
        required: true
      }],
      raw: true,
    });
    
    const categoryCounts = {};
    
    // Initialize all main categories with 0 orders
    mainCategories.forEach(category => {
      categoryCounts[category] = 0;
    });
    
    // Count orders for each category
    orderItems.forEach(item => {
      const category = item['Product.category'];
      if (category && mainCategories.includes(category)) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    // Convert to array format expected by frontend
    const data = mainCategories.map(category => ({ 
      category, 
      orders: categoryCounts[category] || 0 
    }));
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders by category', error: err.message });
  }
};

// GET /api/dashboard/user-signups
export const getUserSignups = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 6 months if no date range provided
      end = new Date();
      start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
    }

    // Generate monthly data points within the date range
    const months = [];
    const current = new Date(start);
    while (current <= end) {
      months.push({
        label: current.toLocaleString('default', { month: 'short' }),
        year: current.getFullYear(),
        month: current.getMonth(),
      });
      current.setMonth(current.getMonth() + 1);
    }

    const data = await User.findAll({
      attributes: [
        [fn('YEAR', sequelize.col('createdAt')), 'year'],
        [fn('MONTH', sequelize.col('createdAt')), 'month'],
        [fn('COUNT', sequelize.col('id')), 'signups'],
      ],
      where: { 
        createdAt: { 
          [Op.between]: [start, end] 
        } 
      },
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