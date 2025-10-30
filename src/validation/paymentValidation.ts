import Joi from 'joi';

export const createRazorpayOrderSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  products: Joi.array().items(Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).min(1).required(),
});

export const verifyRazorpayPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  orderDbId: Joi.string().required(),
});