import Category from '../../models/category.model.js';

export const getCategoriesAction = async () => {
  const categories = await Category.find({})
    .populate('parent', 'name slug')
    .sort({ name: 1 });
  return categories;
};
