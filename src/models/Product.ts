import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  originalPrice: number;
  price: number; // sales price
  category: mongoose.Schema.Types.ObjectId;
  images: string[];
  fabric: string;
  color: string;
  stock: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Please add an original price'],
    },
    // sales price
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    fabric: {
      type: String,
      required: [true, 'Please add fabric type'],
    },
    color: {
      type: String,
      required: [true, 'Please add color'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: [0, 'Stock cannot be negative'],
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;