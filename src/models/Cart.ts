import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
    variant?: {
    color: string;
    image?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity can not be less than 1'],
    },
    // Variant (color required to support variants)
    variant: {
      color: { type: String, required: true },
      image: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that a user can only have one cart item per product + color variant
CartSchema.index({ user: 1, product: 1, 'variant.color': 1 }, { unique: true });

const Cart = mongoose.model<ICart>('Cart', CartSchema);

export default Cart;