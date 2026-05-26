import Product from '../../models/product.model.js';
import Category from '../../models/category.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to update product details.
 * Verifies ownership if updated by a seller.
 * @param {string} productId - Product ID to update
 * @param {Object} updateData - Fields to update
 * @param {Object} currentUser - The user making the request (id, role)
 * @returns {Promise<Object>} The updated product document
 */
export const updateProductAction = async (productId, updateData, currentUser) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Verify ownership: seller can only edit their own products
  if (currentUser.role === 'seller' && product.seller.toString() !== currentUser.id) {
    throw new ApiError(403, 'Forbidden. You can only edit your own products.');
  }

  // If updating category, check if it exists
  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new ApiError(404, 'Selected category does not exist.');
    }
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      product[key] = updateData[key];
    }
  });

  await product.save();
  return product;
};
