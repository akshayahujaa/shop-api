import Product from '../../models/product.model.js';
import Category from '../../models/category.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to create a new product.
 * @param {Object} productData - The product creation payload
 * @param {string} sellerId - The ID of the seller creating the product
 * @returns {Promise<Object>} The created product document
 */
export const createProductAction = async (productData, sellerId) => {
  const { category } = productData;

  // 1. Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, 'Selected category does not exist.');
  }

  // 2. Create the product
  const product = await Product.create({
    ...productData,
    seller: sellerId,
  });

  return product;
};
