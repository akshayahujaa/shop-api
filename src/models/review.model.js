import mongoose from 'mongoose';
import Product from './product.model.js';

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating and number of reviews for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        numReviews: stats[0].numReviews,
        ratings: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        numReviews: 0,
        ratings: 0,
      });
    }
  } catch (error) {
    console.error(`❌ Failed to update Product reviews/ratings: ${error.message}`);
  }
};

// Call calculateAverageRating after saving a review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.clone().findOne();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calculateAverageRating(this.r.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
