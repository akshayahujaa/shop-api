import { createCategoryAction } from '../actions/category/createCategory.action.js';
import { getCategoriesAction } from '../actions/category/getCategories.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await createCategoryAction(req.body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Category created successfully.',
    data: category,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await getCategoriesAction();

  return ApiResponse.success(res, {
    message: 'Categories fetched successfully.',
    data: categories,
  });
});
