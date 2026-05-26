import User from '../../models/user.model.js';
import Order from '../../models/order.model.js';
import Product from '../../models/product.model.js';

/**
 * Action to retrieve dashboard statistics for administrators.
 * @returns {Promise<Object>} Dashboard metrics
 */
export const getDashboardStatsAction = async () => {
  // 1. Fetch counts
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // 2. Calculate total sales (paid online orders + delivered COD orders)
  const salesAggregate = await Order.aggregate([
    {
      $match: {
        $or: [
          { 'paymentInfo.status': 'paid' },
          { paymentMethod: 'cod', status: 'delivered' },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

  // 3. Category product distribution (sorted by product count descending)
  const categoryStats = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $project: {
        _id: 1,
        name: '$categoryInfo.name',
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // Group categories beyond top 5 into "Others" to prevent excessive dashboard scroll
  let processedCategoryStats = [];
  if (categoryStats.length > 5) {
    const topCategories = categoryStats.slice(0, 5);
    const othersCount = categoryStats.slice(5).reduce((sum, item) => sum + item.count, 0);
    processedCategoryStats = [
      ...topCategories,
      { _id: 'others', name: 'Others', count: othersCount },
    ];
  } else {
    processedCategoryStats = categoryStats;
  }

  // 4. Get monthly sales trend
  const monthlySalesTrend = await Order.aggregate([
    {
      $match: {
        $or: [
          { 'paymentInfo.status': 'paid' },
          { paymentMethod: 'cod', status: 'delivered' },
        ],
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        sales: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Format monthly trend: e.g. "Jan 2026"
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedSalesTrend = monthlySalesTrend.map((item) => {
    const monthIndex = item._id.month - 1;
    const label = `${monthNames[monthIndex]} ${item._id.year}`;
    return {
      label,
      sales: item.sales,
      ordersCount: item.count,
    };
  });

  // 5. Get recent 5 orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  return {
    kpis: {
      totalSales,
      totalOrders,
      totalUsers,
      totalProducts,
    },
    categoryStats: processedCategoryStats,
    monthlySalesTrend: formattedSalesTrend,
    recentOrders,
  };
};
