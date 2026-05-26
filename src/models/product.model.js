import mongoose from 'mongoose';
import slugify from 'slugify';

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Product description must be at least 10 characters'],
      maxlength: [5000, 'Product description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be a positive number'],
      validate: {
        validator: function (value) {
          // 'this' refers to the document. Only works on create/save.
          return !value || value < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than the original price',
      },
    },
    images: {
      type: [String],
      required: [true, 'Product must have at least 1 image'],
      validate: {
        validator: function (val) {
          return val.length >= 1 && val.length <= 5;
        },
        message: 'Product images must be between 1 and 5',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product seller is required'],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ seller: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ stock: 1 });

productSchema.pre('validate', async function () {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
