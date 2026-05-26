import Product from '../../models/product.model.js';
import Review from '../../models/review.model.js';
import Wishlist from '../../models/wishlist.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Action to delete a product and clean up associated reviews/wishlist entries.
 * @param {string} productId - Product ID to delete
 * @param {Object} currentUser - User making the request (id, role)
 */
export const deleteProductAction = async (productId, currentUser) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Verify ownership: seller can only delete their own products
  if (currentUser.role === 'seller' && product.seller.toString() !== currentUser.id) {
    throw new ApiError(403, 'Forbidden. You can only delete your own products.');
  }

  // Delete product document
  await Product.findByIdAndDelete(productId);

  // Clean up reviews and wishlists in parallel
  await Promise.all([
    Review.deleteMany({ product: productId }),
    Wishlist.deleteMany({ product: productId }),
  ]);
};
