import appConfig from '../config/app.config.js';

/**
 * Reusable utility to paginate Mongoose queries.
 * @param {Object} model - The Mongoose model to query
 * @param {Object} filter - The filter criteria
 * @param {Object} options - Query options (page, limit, sort, populate, select)
 * @returns {Promise<Object>} An object containing the query data and pagination metadata
 */
export const paginateQuery = async (model, filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) || appConfig.pagination.defaultPage;
  let limit = parseInt(options.limit, 10) || appConfig.pagination.defaultLimit;

  // Cap limit at max limit to prevent performance abuse
  if (limit > appConfig.pagination.maxLimit) {
    limit = appConfig.pagination.maxLimit;
  }

  const skip = (page - 1) * limit;

  const countQuery = model.countDocuments(filter);
  let dataQuery = model.find(filter).skip(skip).limit(limit);

  if (options.sort) {
    dataQuery = dataQuery.sort(options.sort);
  } else {
    dataQuery = dataQuery.sort({ createdAt: -1 });
  }

  if (options.populate) {
    dataQuery = dataQuery.populate(options.populate);
  }

  if (options.select) {
    dataQuery = dataQuery.select(options.select);
  }

  const [totalItems, data] = await Promise.all([countQuery, dataQuery]);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: totalPages || 1,
      totalItems,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
