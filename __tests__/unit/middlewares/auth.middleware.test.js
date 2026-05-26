import { protect } from '../../../src/middlewares/auth.middleware.js';
import { ApiError } from '../../../src/utils/apiError.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

jest.mock('jsonwebtoken');

describe('Auth Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next with ApiError 401 if no authorization header or cookie is present', async () => {
    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(new ApiError(401, 'Access denied. No token provided.'));
  });

  it('should call next with ApiError 401 if token validation fails', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('JWT error');
    });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(new ApiError(401, 'Invalid access token.'));
  });

  it('should set req.user and call next if token is valid', async () => {
    req.headers.authorization = 'Bearer valid_token';
    const decodedPayload = { userId: 'user_123', role: 'admin' };
    jwt.verify = jest.fn().mockReturnValue(decodedPayload);

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'user_123', role: 'admin' });
    expect(next).toHaveBeenCalledWith(); // called with no errors
  });
});
