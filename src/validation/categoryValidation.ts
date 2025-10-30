import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(10).max(500).required(),
  image: Joi.string().uri().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().min(10).max(500).optional(),
  image: Joi.string().uri().optional(),
});