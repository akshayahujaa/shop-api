import express from 'express';
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
  createAddress,
  getAddresses,
  deleteAddress,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  updatePasswordSchema,
  addressSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../validators/user.validator.js';

const router = express.Router();

// All user routes are protected
router.use(protect);

// Admin User Management Routes (Must be defined before wildcard id if any)
router.get('/', authorize('admin'), getUsers);
router.put('/:id/role', authorize('admin'), validate(updateUserRoleSchema), updateUserRole);
router.put('/:id/status', authorize('admin'), validate(updateUserStatusSchema), updateUserStatus);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/password', validate(updatePasswordSchema), updatePassword);
router.delete('/profile', deleteProfile);

// Address endpoints
router.post('/address', validate(addressSchema), createAddress);
router.get('/address', getAddresses);
router.delete('/address/:addressId', deleteAddress);

export default router;
