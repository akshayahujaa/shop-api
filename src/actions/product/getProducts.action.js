import Product from '../../models/product.model.js';
import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Action to retrieve all products using pagination.
 * Supports filters (category, minPrice, maxPrice, search, stock) and sort strategies.
 * @param {Object} queryParams - Express query parameters (page, limit, category, sort, minPrice, maxPrice)
 * @returns {Promise<Object>} Paginated products and meta details
 */
export const getProductsAction = async (queryParams = {}) => {
  const { page, limit, category, sort, minPrice, maxPrice, isActive = true } = queryParams;

  const filter = { isActive };

  // Apply category filter (supports category ObjectId or slug if we want)
  if (category) {
    filter.category = category;
  }

  // Apply price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  // Determine sort options
  const sortOptions = {};
  if (sort === 'price_asc') {
    sortOptions.price = 1;
  } else if (sort === 'price_desc') {
    sortOptions.price = -1;
  } else if (sort === 'rating') {
    sortOptions.ratings = -1;
  } else {
    // Default: Sort by newest
    sortOptions.createdAt = -1;
  }

  // Perform paginated query
  const result = await paginateQuery(Product, filter, {
    page,
    limit,
    sort: sortOptions,
    populate: 'category',
  });

  return result;
};
