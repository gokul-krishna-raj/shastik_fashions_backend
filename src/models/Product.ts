import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug?: string;
  description: string;
  originalPrice: number;
  price: number; // sales price
  category: mongoose.Schema.Types.ObjectId;
  images: string[];
  imageUrl?: string;
  fabric: string;
  color?: string; // legacy single color
  colors?: string[];
  colorImages?: Record<string, string> | Map<string, string>;
  sizes?: string[];
  stock: number;
  inStock?: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  featured?: boolean;
  bestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  variants?: any[];
}
export interface IVariant {
  color: string;
  image?: string;
  price?: number;
  stock?: number;
  [key: string]: any;
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
      maxlength: [1000, 'Description can not be more than 1000 characters'],
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
    imageUrl: {
      type: String,
    },
    fabric: {
      type: String,
      required: [true, 'Please add fabric type'],
    },
    // legacy single color (kept for backward compatibility)
    color: {
      type: String,
    },
    // preferred: array of colors
    colors: {
      type: [String],
      default: [],
    },
    // map of color -> image url
    colorImages: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // variant support: per-color stock and image
    variants: {
      type: [
        {
          color: { type: String, required: true },
          stock: { type: Number, default: 0 },
          image: { type: String },
        },
      ],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: [0, 'Stock cannot be negative'],
    },
    inStock: {
      type: Boolean,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;