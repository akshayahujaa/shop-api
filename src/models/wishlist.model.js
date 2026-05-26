import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const wishlistSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
