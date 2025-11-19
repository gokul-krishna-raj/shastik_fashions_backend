import { Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse';
import { razorpay } from '../config/razorpay';
import paginate from '../utils/pagination';

// @desc    Confirm order and create new order
// @route   POST /api/orders/confirm
// @access  Private
export const confirmOrder = async (req: CustomRequest, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, products, shippingAddress, totalAmount } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return apiResponse(res, {
      success: false,
      statusCode: 401,
      message: 'Not authorized',
    });
  }

  try {
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generated_signature !== razorpaySignature) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Invalid Razorpay signature',
      });
    }

    // Create a new order
    const order = await Order.create({
      user: userId,
      products,
      shippingAddress,
      totalAmount,
      paymentMethod: 'Razorpay',
      paymentStatus: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderStatus: 'processing',
    });

    // Update product stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    await Cart.deleteMany({ user: userId });

    apiResponse(res, {
      statusCode: 201,
      data: { orderId: order._id },
      message: 'Order confirmed successfully',
    });
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

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getAllOrders = async (req: CustomRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};

    const paginatedResult = await paginate(Order, query, Number(page), Number(limit), ['user', 'products.product']);

    apiResponse(res, {
      statusCode: 200,
      data: paginatedResult.data,
      count: paginatedResult.count,
      page: paginatedResult.page,
      pages: paginatedResult.pages,
      limit: paginatedResult.limit,
      message: 'All orders fetched successfully',
    });
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

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: CustomRequest, res: Response) => {
  try {
    const { orderStatus } = req.body;

    let order = await Order.findById(req.params.id);

    if (!order) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Order not found',
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    apiResponse(res, {
      statusCode: 200,
      data: order,
      message: 'Order status updated successfully',
    });
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
