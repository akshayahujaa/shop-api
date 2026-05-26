import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

// Pre-save hook to ensure only one default address exists for a user
addressSchema.pre('save', async function () {
  if (this.isDefault) {
    // Set all other addresses for this user to isDefault = false
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

const Address = mongoose.model('Address', addressSchema);
export default Address;
