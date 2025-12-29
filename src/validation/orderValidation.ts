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
  paymentMethod: Joi.string()
    .valid('Razorpay', 'COD')
    .required(),

  paymentStatus: Joi.when('paymentMethod', {
    is: 'COD',
    then: Joi.string().valid('pending').required(),
    otherwise: Joi.string().valid('paid').required(),
  }),

  razorpayOrderId: Joi.when('paymentMethod', {
    is: 'Razorpay',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  razorpayPaymentId: Joi.when('paymentMethod', {
    is: 'Razorpay',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  razorpaySignature: Joi.when('paymentMethod', {
    is: 'Razorpay',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),

        quantity: Joi.number()
          .integer()
          .min(1)
          .required(),

        variant: Joi.object({
          color: Joi.string().required().messages({
            'any.required': 'Variant color is required',
          }),
          image: Joi.string().uri().optional(),
        }).optional(), // 👈 variant optional for non-variant products
      })
    )
    .min(1)
    .required(),

  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    addressLine1: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),

  totalAmount: Joi.number().positive().required(),
});
