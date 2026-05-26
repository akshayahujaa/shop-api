import { addToCartAction } from '../actions/cart/addToCart.action.js';
import { getCartAction } from '../actions/cart/getCart.action.js';
import { updateCartItemAction } from '../actions/cart/updateCartItem.action.js';
import { removeFromCartAction } from '../actions/cart/removeFromCart.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartAction(req.user.id);

  return ApiResponse.success(res, {
    message: 'Cart fetched successfully.',
    data: cart,
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { product, quantity } = req.body;
  const cart = await addToCartAction(req.user.id, product, quantity);

  return ApiResponse.success(res, {
    message: 'Product added to cart successfully.',
    data: cart,
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { product, quantity } = req.body;
  const cart = await updateCartItemAction(req.user.id, product, quantity);

  return ApiResponse.success(res, {
    message: 'Cart item updated successfully.',
    data: cart,
  });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await removeFromCartAction(req.user.id, productId);

  return ApiResponse.success(res, {
    message: 'Product removed from cart successfully.',
    data: cart,
  });
});
