import { addToWishlistAction } from '../actions/wishlist/addToWishlist.action.js';
import { getWishlistAction } from '../actions/wishlist/getWishlist.action.js';
import { removeFromWishlistAction } from '../actions/wishlist/removeFromWishlist.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const result = await getWishlistAction(req.user.id, req.query);

  return ApiResponse.success(res, {
    message: 'Wishlist fetched successfully.',
    data: result.data,
    pagination: result.pagination,
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const productId = req.body.productId || req.body.product;
  const item = await addToWishlistAction(req.user.id, productId);

  return ApiResponse.success(res, {
    message: 'Product added to wishlist successfully.',
    data: item,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await removeFromWishlistAction(req.user.id, productId);

  return ApiResponse.success(res, {
    message: 'Product removed from wishlist successfully.',
  });
});
