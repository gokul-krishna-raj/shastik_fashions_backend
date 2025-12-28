import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  slug: Joi.string().optional(),
  description: Joi.string().min(10).max(500).required(),
  originalPrice: Joi.number().min(0).optional(),
  original_price: Joi.number().min(0).optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().optional(), // Assuming category ID is a string
  category_id: Joi.string().optional(),
  fabric: Joi.string().required(),
  color: Joi.string().optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  color_images: Joi.object().optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().min(0).optional(),
  in_stock: Joi.boolean().optional(),
  imageUrl: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  featured: Joi.boolean().optional(),
  bestseller: Joi.boolean().optional(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  rating: Joi.number().min(0).optional(),
  review_count: Joi.number().min(0).optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  slug: Joi.string().optional(),
  description: Joi.string().min(10).max(500).optional(),
  originalPrice: Joi.number().min(0).optional(),
  original_price: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  category_id: Joi.string().optional(),
  fabric: Joi.string().optional(),
  color: Joi.string().optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  color_images: Joi.object().optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().min(0).optional(),
  in_stock: Joi.boolean().optional(),
  imageUrl: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  featured: Joi.boolean().optional(),
  bestseller: Joi.boolean().optional(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  rating: Joi.number().min(0).optional(),
  review_count: Joi.number().min(0).optional(),
});

export const getProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  category: Joi.string().optional(),
  categorySlug: Joi.string().optional(),
  search: Joi.string().optional(),
  colors: Joi.string().optional(), // Comma-separated values
  fabrics: Joi.string().optional(), // Comma-separated values
  sortBy: Joi.string().valid('newest', 'oldest', 'price_low', 'price_high', 'best_sellers').optional(),
});
