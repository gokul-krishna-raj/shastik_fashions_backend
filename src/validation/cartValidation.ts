import Joi from 'joi';

export const cartItemSchema = Joi.object({
  productId: Joi.string().required(), // Assuming product ID is a string
  quantity: Joi.number().integer().min(1).required(),
});