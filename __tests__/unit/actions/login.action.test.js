import { loginAction } from '../../../src/actions/auth/login.action.js';
import User from '../../../src/models/user.model.js';
import { ApiError } from '../../../src/utils/apiError.js';
import { jest } from '@jest/globals';

jest.mock('../../../src/models/user.model.js');
jest.mock('../../../src/utils/token.util.js', () => ({
  generateAccessToken: () => 'fake_access_token',
  generateRefreshToken: () => 'fake_refresh_token',
}));

describe('Login Action Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw Unauthorized if email is not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      loginAction({ email: 'wrong@example.com', password: 'Password1!' })
    ).rejects.toThrow(new ApiError(401, 'Invalid email or password.'));
  });

  it('should throw Unauthorized if password is incorrect', async () => {
    const mockComparePassword = jest.fn().mockResolvedValue(false);
    const mockUser = {
      email: 'test@example.com',
      comparePassword: mockComparePassword,
    };
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    await expect(
      loginAction({ email: 'test@example.com', password: 'WrongPassword' })
    ).rejects.toThrow(new ApiError(401, 'Invalid email or password.'));

    expect(mockComparePassword).toHaveBeenCalledWith('WrongPassword');
  });

  it('should throw Forbidden if user is deactivated', async () => {
    const mockUser = {
      email: 'test@example.com',
      isActive: false,
    };
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    await expect(
      loginAction({ email: 'test@example.com', password: 'Password1!' })
    ).rejects.toThrow(new ApiError(403, 'Your account has been deactivated. Please contact support.'));
  });

  it('should login user and return user + tokens', async () => {
    const mockComparePassword = jest.fn().mockResolvedValue(true);
    const mockSave = jest.fn().mockResolvedValue(true);
    
    const mockUser = {
      _id: 'user_123',
      email: 'test@example.com',
      role: 'user',
      comparePassword: mockComparePassword,
      save: mockSave,
      toObject: function() {
        return {
          _id: this._id,
          email: this.email,
          role: this.role,
        };
      },
    };
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const result = await loginAction({ email: 'test@example.com', password: 'Password1!' });

    expect(mockComparePassword).toHaveBeenCalledWith('Password1!');
    expect(mockSave).toHaveBeenCalled();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user._id).toBe('user_123');
  });
});
