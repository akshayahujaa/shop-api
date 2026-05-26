import { getDashboardStatsAction } from '../actions/admin/getDashboardStats.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Controller to fetch admin dashboard stats.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatsAction();

  return ApiResponse.success(res, {
    message: 'Dashboard statistics fetched successfully.',
    data: stats,
  });
});
