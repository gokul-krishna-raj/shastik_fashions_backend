import Joi from 'joi';

export const cartItemSchema = Joi.object({
  productId: Joi.string().required(), // Assuming product ID is a string
  quantity: Joi.number().integer().min(1).required(),
  variant: Joi.object({
    color: Joi.string().required().messages({ 'any.required': 'Variant color is required' }),
    image: Joi.string().uri().optional(),
  }).required(),
});