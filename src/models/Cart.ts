import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
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
  },
  {
    timestamps: true,
  }
);

// Ensure that a user can only have one of each product in their cart
CartSchema.index({ user: 1, product: 1 }, { unique: true });

const Cart = mongoose.model<ICart>('Cart', CartSchema);

export default Cart;