import { getProfileAction } from '../actions/user/getProfile.action.js';
import { updateProfileAction, updatePasswordAction } from '../actions/user/updateProfile.action.js';
import { deleteUserAction } from '../actions/user/deleteUser.action.js';
import { createAddressAction, getAddressesAction, deleteAddressAction } from '../actions/user/address.action.js';
import { getUsersAction } from '../actions/user/getUsers.action.js';
import { updateUserRoleAction } from '../actions/user/updateUserRole.action.js';
import { toggleUserStatusAction } from '../actions/user/toggleUserStatus.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getProfileAction(req.user.id);
  
  return ApiResponse.success(res, {
    message: 'User profile fetched successfully.',
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileAction(req.user.id, req.body);

  return ApiResponse.success(res, {
    message: 'User profile updated successfully.',
    data: user,
  });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await updatePasswordAction(req.user.id, oldPassword, newPassword);

  return ApiResponse.success(res, {
    message: 'Password updated successfully.',
  });
});

export const deleteProfile = asyncHandler(async (req, res) => {
  await deleteUserAction(req.user.id);

  return ApiResponse.success(res, {
    message: 'Account deleted successfully.',
  });
});

// Address CRUD controllers
export const createAddress = asyncHandler(async (req, res) => {
  const address = await createAddressAction(req.user.id, req.body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Shipping address added successfully.',
    data: address,
  });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await getAddressesAction(req.user.id);

  return ApiResponse.success(res, {
    message: 'Addresses fetched successfully.',
    data: addresses,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  await deleteAddressAction(req.user.id, addressId);

  return ApiResponse.success(res, {
    message: 'Address deleted successfully.',
  });
});

// Admin User Management Controllers
export const getUsers = asyncHandler(async (req, res) => {
  const result = await getUsersAction(req.query);

  return ApiResponse.success(res, {
    message: 'Users fetched successfully.',
    data: result.data,
    pagination: result.pagination,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  // Prevent demoting oneself if they are the only active Admin
  if (targetUserId === currentUserId && role !== 'admin') {
    const otherAdminCount = await User.countDocuments({
      role: 'admin',
      isActive: true,
      _id: { $ne: currentUserId },
    });

    if (otherAdminCount === 0) {
      throw new ApiError(400, 'Action denied. You are the only active Admin. You must assign another active user as Admin first before demoting yourself.');
    }
  }

  const user = await updateUserRoleAction(targetUserId, role);

  return ApiResponse.success(res, {
    message: 'User role updated successfully.',
    data: user,
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  // Prevent deactivating oneself if they are the only active Admin
  if (targetUserId === currentUserId && (isActive === false || isActive === 'false')) {
    const otherAdminCount = await User.countDocuments({
      role: 'admin',
      isActive: true,
      _id: { $ne: currentUserId },
    });

    if (otherAdminCount === 0) {
      throw new ApiError(400, 'Action denied. You are the only active Admin. You must assign another active user as Admin first before deactivating yourself.');
    }
  }

  const user = await toggleUserStatusAction(targetUserId, isActive);

  return ApiResponse.success(res, {
    message: 'User status updated successfully.',
    data: user,
  });
});
