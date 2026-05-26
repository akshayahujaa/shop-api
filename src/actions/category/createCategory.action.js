import Category from '../../models/category.model.js';
import { ApiError } from '../../utils/apiError.js';

export const createCategoryAction = async (categoryData) => {
  const { name, parent, description, image } = categoryData;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ApiError(409, 'Category already exists.');
  }

  if (parent) {
    const parentExists = await Category.findById(parent);
    if (!parentExists) {
      throw new ApiError(404, 'Parent category not found.');
    }
  }

  const category = await Category.create({
    name,
    parent: parent || null,
    description,
    image,
  });

  return category;
};
