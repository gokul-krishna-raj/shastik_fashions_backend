import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  products: {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    variant?: {
      color: string;
      image?: string;
    };
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  estimatedDelivery?: Date;
  trackingId?: string;
  carrier?: string;
  trackingUrl?: string;
  trackingHistory?: {
    status: string;
    message: string;
    timestamp: Date;
  }[];
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
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
        variant: {
          color: { type: String },
          image: { type: String },
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },
    // shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'COD'],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    trackingId: {
      type: String,
    },
    carrier: {
      type: String,
    },
    trackingUrl: {
      type: String,
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

