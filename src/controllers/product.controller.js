import { createProductAction } from '../actions/product/createProduct.action.js';
import { getProductsAction } from '../actions/product/getProducts.action.js';
import { getProductByIdAction } from '../actions/product/getProductById.action.js';
import { updateProductAction } from '../actions/product/updateProduct.action.js';
import { deleteProductAction } from '../actions/product/deleteProduct.action.js';
import { searchProductsAction } from '../actions/product/searchProducts.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await createProductAction(req.body, req.user.id);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Product created successfully.',
    data: product,
  });
});

export const getProducts = asyncHandler(async (req, res) => {
  const result = await getProductsAction(req.query);

  return ApiResponse.success(res, {
    message: 'Products fetched successfully.',
    data: result.data,
    pagination: result.pagination,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdAction(req.params.id);

  return ApiResponse.success(res, {
    message: 'Product details fetched successfully.',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductAction(req.params.id, req.body, req.user);

  return ApiResponse.success(res, {
    message: 'Product updated successfully.',
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await deleteProductAction(req.params.id, req.user);

  return ApiResponse.success(res, {
    message: 'Product deleted successfully.',
  });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const result = await searchProductsAction(req.query);

  return ApiResponse.success(res, {
    message: 'Search completed successfully.',
    data: result.data,
    pagination: result.pagination,
  });
});
