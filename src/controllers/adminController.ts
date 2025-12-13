import { Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import apiResponse from '../utils/apiResponse';
import { CustomRequest } from '../middleware/authMiddleware';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req: CustomRequest, res: Response) => {
  try {
    const now = new Date();

    // Total revenue (sum of paid orders)
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Total orders (all orders)
    const totalOrders = await Order.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments();

    // Helper to get start and end of a month
    const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
    const startOfNextMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);

    // Current and previous month ranges
    const currentMonthStart = startOfMonth(now);
    const previousMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const currentMonthEnd = startOfNextMonth(now);
    const previousMonthEnd = currentMonthStart;

    // Revenue for current and previous month
    const revenueThisMonthAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const revenuePrevMonthAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenuePrevMonth = revenuePrevMonthAgg[0]?.total || 0;

    // Orders for current and previous month
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd } });
    const ordersPrevMonth = await Order.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd } });

    // Users for current and previous month
    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd } });
    const usersPrevMonth = await User.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd } });

    // Percent change calculator
    const percentChange = (current: number, previous: number) => {
      if (previous === 0) {
        if (current === 0) return 0;
        return 100;
      }
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const revenueChange = percentChange(revenueThisMonth, revenuePrevMonth);
    const ordersChange = percentChange(ordersThisMonth, ordersPrevMonth);
    const usersChange = percentChange(usersThisMonth, usersPrevMonth);

    // Sales data for last 6 months
    const monthsToShow = 6;
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);

    const monthlyAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Convert aggregation result into a map for quick lookup
    const salesMap = new Map<string, number>();
    monthlyAgg.forEach((m) => {
      const key = `${m._id.year}-${m._id.month}`;
      salesMap.set(key, m.sales);
    });

    const salesData: { name: string; sales: number }[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const name = MONTH_NAMES[d.getMonth()];
      const sales = salesMap.get(key) || 0;
      salesData.push({ name, sales });
    }

    apiResponse(res, {
      statusCode: 200,
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers,
        revenueChange,
        ordersChange,
        usersChange,
        salesData,
      },
      message: 'Admin stats fetched successfully',
    });
  } catch (error: any) {
    console.error(error.message);
    apiResponse(res, {
      statusCode: 500,
      success: false,
      message: 'Server Error',
      stack: error.stack,
    });
  }
};

export default { getStats };
