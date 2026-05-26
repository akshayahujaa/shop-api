import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator.js';

const router = express.Router();

// All cart operations require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.put('/', validate(updateCartItemSchema), updateCartItem);
router.delete('/:productId', removeFromCart);

export default router;
