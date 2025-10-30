import Joi from 'joi';

export const createOrderSchema = Joi.object({
  products: Joi.array().items(Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed').required(),
  razorpayOrderId: Joi.string().optional(),
  razorpayPaymentId: Joi.string().optional(),
  razorpaySignature: Joi.string().optional(),
});

export const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
});