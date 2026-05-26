// Set environment variables before any imports run
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_which_is_long_enough';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_which_is_long_enough';

import { registerAction } from '../../../src/actions/auth/register.action.js';
import User from '../../../src/models/user.model.js';
import Cart from '../../../src/models/cart.model.js';
import { ApiError } from '../../../src/utils/apiError.js';
import { jest } from '@jest/globals';

// Mock models
jest.mock('../../../src/models/user.model.js');
jest.mock('../../../src/models/cart.model.js');

describe('Register Action Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw Conflict error if email already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

    await expect(
      registerAction({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      })
    ).rejects.toThrow(new ApiError(409, 'User with this email already exists.'));

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should successfully register user, create cart and return user + tokens', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const mockSave = jest.fn().mockResolvedValue(true);
    
    const mockUser = {
      _id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      toObject: function() {
        return {
          _id: this._id,
          name: this.name,
          email: this.email,
          role: this.role,
        };
      },
      save: mockSave,
    };

    User.create = jest.fn().mockResolvedValue(mockUser);
    Cart.create = jest.fn().mockResolvedValue({ user: 'user_123', items: [] });

    const result = await registerAction({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!',
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(User.create).toHaveBeenCalled();
    expect(Cart.create).toHaveBeenCalledWith({ user: 'user_123', items: [], totalAmount: 0 });
    expect(mockSave).toHaveBeenCalled();
    
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });
});
