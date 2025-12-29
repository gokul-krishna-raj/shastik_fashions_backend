import Joi from 'joi';

// export const createRazorpayOrderSchema = Joi.object({
//   amount: Joi.number().min(1).required(),
//   products: Joi.array().items(Joi.object({
//     product: Joi.string().required(),
//     quantity: Joi.number().integer().min(1).required(),
//   })).min(1).required(),
//   receipt: Joi.string().optional(),
//   notes: Joi.object().optional(),
// });
export const createRazorpayOrderSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().optional(), // legacy key
        productId: Joi.string().optional(), // preferred key
        name: Joi.string().optional(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).required(),
        variant: Joi.object({
          color: Joi.string().required(),
          image: Joi.string().uri().optional(),
        }).optional(),
      }).or('product', 'productId') // require either product or productId
    )
    .min(1)
    .required(),
  receipt: Joi.string().optional(),
  notes: Joi.object().optional(),
});
export const verifyRazorpayPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  orderDbId: Joi.string().optional(),
  order_data: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
}).or('orderDbId', 'order_data');