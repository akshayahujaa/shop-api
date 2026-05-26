import Product from '../../models/product.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to retrieve product details by ID or Slug.
 * @param {string} identifier - Product ObjectId or URL Slug
 * @returns {Promise<Object>} The product document populated with category and seller details
 */
export const getProductByIdAction = async (identifier) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('seller', 'name email');

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  return product;
};
