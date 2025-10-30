import Joi from 'joi';

export const wishlistItemSchema = Joi.object({
  productId: Joi.string().required(), // Assuming product ID is a string
});