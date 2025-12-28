import Joi from 'joi';

// ✅ createOrderSchema
export const createOrderSchema = Joi.object({
  products: Joi.array().items(
    Joi.object({
      product: Joi.string().min(1).required().messages({
        'string.empty': 'Product ID is required',
        'string.min': 'Product ID is required',
      }),
      quantity: Joi.number().min(1).required().messages({
        'number.min': 'Quantity must be at least 1',
      }),
    })
  ).required(),
  totalAmount: Joi.number().min(0).required().messages({
    'number.min': 'Total amount must be a positive number',
  }),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed').required(),
  razorpayOrderId: Joi.string().optional(),
  razorpayPaymentId: Joi.string().optional(),
  razorpaySignature: Joi.string().optional(),
});

// ✅ updateOrderStatusSchema
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
});

// ✅ confirmOrderSchema
export const confirmOrderSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().required(),
    })
  ).required(),
  shippingAddress: Joi.string().required(),
  totalAmount: Joi.number().required(),
});