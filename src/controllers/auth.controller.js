import { registerAction } from '../actions/auth/register.action.js';
import { loginAction } from '../actions/auth/login.action.js';
import { logoutAction } from '../actions/auth/logout.action.js';
import { refreshTokenAction } from '../actions/auth/refreshToken.action.js';
import { forgotPasswordAction, resetPasswordAction } from '../actions/auth/forgotPassword.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/token.util.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerAction(req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'User registered successfully.',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginAction(req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  return ApiResponse.success(res, {
    message: 'User logged in successfully.',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutAction(req.user.id);
  clearRefreshTokenCookie(res);

  return ApiResponse.success(res, {
    message: 'User logged out successfully.',
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  const result = await refreshTokenAction(incomingToken);
  setRefreshTokenCookie(res, result.refreshToken);

  return ApiResponse.success(res, {
    message: 'Token refreshed successfully.',
    data: {
      accessToken: result.accessToken,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await forgotPasswordAction(req.body.email);

  return ApiResponse.success(res, {
    message: 'Password reset link sent to your email.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  await resetPasswordAction(token, password);

  return ApiResponse.success(res, {
    message: 'Password reset successfully.',
  });
});
