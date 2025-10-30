import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  originalPrice: Joi.number().min(0).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(), // Assuming category ID is a string
  fabric: Joi.string().required(),
  color: Joi.string().required(),
  stock: Joi.number().min(0).required(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  originalPrice: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  fabric: Joi.string().optional(),
  color: Joi.string().optional(),
  stock: Joi.number().min(0).optional(),
  isBestSeller: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
});