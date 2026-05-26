import Product from '../../models/product.model.js';
import { paginateQuery } from '../../utils/pagination.util.js';

/**
 * Action to search products using full-text indexes and return paginated results.
 * @param {Object} queryParams - Search term, page, limit, sort
 * @returns {Promise<Object>} Paginated search results
 */
export const searchProductsAction = async (queryParams = {}) => {
  const { query, page, limit, sort } = queryParams;

  const filter = { isActive: true };

  // Apply search query using text index, or regex if no index
  if (query) {
    filter.$text = { $search: query };
  }

  // Determine sort options
  const sortOptions = {};
  if (query) {
    // Sort by text search score relevance by default
    sortOptions.score = { $meta: 'textScore' };
  } else {
    sortOptions.createdAt = -1;
  }

  // If explicit sort is requested
  if (sort === 'price_asc') {
    sortOptions.price = 1;
  } else if (sort === 'price_desc') {
    sortOptions.price = -1;
  }

  // Perform query
  const projection = query ? { score: { $meta: 'textScore' } } : {};
  const result = await paginateQuery(Product, filter, {
    page,
    limit,
    sort: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
    select: projection,
    populate: 'category',
  });

  return result;
};
