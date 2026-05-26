import { getUsersAction } from '../../../src/actions/user/getUsers.action.js';
import { updateUserRoleAction } from '../../../src/actions/user/updateUserRole.action.js';
import { toggleUserStatusAction } from '../../../src/actions/user/toggleUserStatus.action.js';
import { getDashboardStatsAction } from '../../../src/actions/admin/getDashboardStats.action.js';
import User from '../../../src/models/user.model.js';
import Order from '../../../src/models/order.model.js';
import Product from '../../../src/models/product.model.js';
import { ApiError } from '../../../src/utils/apiError.js';
import { jest } from '@jest/globals';

jest.mock('../../../src/models/user.model.js');
jest.mock('../../../src/models/order.model.js');
jest.mock('../../../src/models/product.model.js');
jest.mock('../../../src/utils/pagination.util.js', () => ({
  paginateQuery: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
}));

import { paginateQuery } from '../../../src/utils/pagination.util.js';

describe('Admin User & Stats Actions Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsersAction', () => {
    it('should query paginated users', async () => {
      User.countDocuments = jest.fn().mockResolvedValue(0);
      User.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue([])
            })
          })
        })
      });
      const result = await getUsersAction({ page: 1, limit: 10, search: 'test', role: 'admin' });
      expect(result.data).toBeDefined();
    });
  });

  describe('updateUserRoleAction', () => {
    it('should throw ApiError if user is not found', async () => {
      User.findById = jest.fn().mockResolvedValue(null);
      await expect(updateUserRoleAction('user_id', 'admin')).rejects.toThrow(
        new ApiError(404, 'User not found.')
      );
    });

    it('should update user role if found', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: 'user_123',
        role: 'user',
        save: mockSave,
        toObject: function() { return this; }
      };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const result = await updateUserRoleAction('user_123', 'admin');
      expect(mockUser.role).toBe('admin');
      expect(mockSave).toHaveBeenCalled();
      expect(result._id).toBe('user_123');
    });
  });

  describe('toggleUserStatusAction', () => {
    it('should throw ApiError if user not found', async () => {
      User.findById = jest.fn().mockResolvedValue(null);
      await expect(toggleUserStatusAction('user_id', false)).rejects.toThrow(
        new ApiError(404, 'User not found.')
      );
    });

    it('should toggle user status', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: 'user_123',
        isActive: true,
        save: mockSave,
        toObject: function() { return this; }
      };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const result = await toggleUserStatusAction('user_123', false);
      expect(mockUser.isActive).toBe(false);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getDashboardStatsAction', () => {
    it('should aggregate kpis, categories, and trends', async () => {
      User.countDocuments = jest.fn().mockResolvedValue(10);
      Product.countDocuments = jest.fn().mockResolvedValue(50);
      Order.countDocuments = jest.fn().mockResolvedValue(20);

      Order.aggregate = jest.fn().mockImplementation((pipeline) => {
        // Mock different aggregates based on pipeline stages or just standard mock response
        if (pipeline.some(p => p.$group && p.$group._id && p.$group._id.year)) {
          // monthly sales trend mock
          return Promise.resolve([
            { _id: { year: 2026, month: 5 }, sales: 500, count: 2 }
          ]);
        }
        // sales sum aggregate mock
        return Promise.resolve([{ totalSales: 1000 }]);
      });

      Product.aggregate = jest.fn().mockResolvedValue([
        { _id: 'cat_1', name: 'Electronics', count: 5 }
      ]);

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([
              { _id: 'order_1', totalAmount: 100 }
            ])
          })
        })
      });

      const stats = await getDashboardStatsAction();
      expect(stats.kpis.totalUsers).toBe(10);
      expect(stats.kpis.totalProducts).toBe(50);
      expect(stats.kpis.totalOrders).toBe(20);
      expect(stats.kpis.totalSales).toBe(1000);
      expect(stats.categoryStats).toHaveLength(1);
      expect(stats.monthlySalesTrend).toHaveLength(1);
      expect(stats.monthlySalesTrend[0].label).toBe('May 2026');
      expect(stats.recentOrders).toHaveLength(1);
    });
  });
});
