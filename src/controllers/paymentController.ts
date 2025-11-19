import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

// @desc    Create new Razorpay order
// @route   POST /api/payment/order
// @access  Private
export const createRazorpayOrder = async (req: CustomRequest, res: Response) => {
  try {
    const { amount, products } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = await Order.create({
      user: userId,
      products,
      totalAmount: amount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
    });
console.log("order =>", order);
console.log("razorpayOrder =>", razorpayOrder);



   return res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      orderDbId: order._id,
    });
    // apiResponse(res, {
    //   statusCode: 201,
    //   // orderId: razorpayOrder.id,
    //   amount: razorpayOrder.amount,
    //   currency: razorpayOrder.currency,
    //   receipt: razorpayOrder.receipt,
    //   orderDbId: order._id,
    //   message: 'Razorpay order created successfully',
    // });
  } catch (error: any) {
    console.error(error.message);
    apiResponse(res, {
      success: false,
      statusCode: 500,
      message: 'Server Error',
      stack: error.stack,
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = async (req: CustomRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDbId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const order = await Order.findById(orderDbId);

      if (!order) {
        return apiResponse(res, {
          success: false,
          statusCode: 404,
          message: 'Order not found in DB',
        });
      }

      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      apiResponse(res, {
        statusCode: 200,
        message: 'Payment verified successfully',
      });
    } else {
      const order = await Order.findById(orderDbId);
      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
      }
      apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Payment verification failed',
      });
    }
  } catch (error: any) {
    console.error(error.message);
    apiResponse(res, {
      success: false,
      statusCode: 500,
      message: 'Server Error',
      stack: error.stack,
    });
  }
};
