import { createReviewAction } from '../actions/review/createReview.action.js';
import { getReviewsAction } from '../actions/review/getReviews.action.js';
import { updateReviewAction } from '../actions/review/updateReview.action.js';
import { deleteReviewAction } from '../actions/review/deleteReview.action.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createReview = asyncHandler(async (req, res) => {
  const review = await createReviewAction(req.user.id, req.body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Review submitted successfully.',
    data: review,
  });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const result = await getReviewsAction(productId, req.query);

  return ApiResponse.success(res, {
    message: 'Product reviews fetched successfully.',
    data: result.data,
    pagination: result.pagination,
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await updateReviewAction(req.params.id, req.user.id, req.body);

  return ApiResponse.success(res, {
    message: 'Review updated successfully.',
    data: review,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await deleteReviewAction(req.params.id, req.user);

  return ApiResponse.success(res, {
    message: 'Review deleted successfully.',
  });
});
