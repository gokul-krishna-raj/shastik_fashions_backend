import { Response } from 'express';
import Order from '../models/Order';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse
import paginate from '../utils/pagination'; // Import paginate

// @desc    Create new order (after payment verification)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: CustomRequest, res: Response) => {
  try {
    const { products, totalAmount, paymentStatus, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderStatus: 'pending', // Initial status
    });

    apiResponse(res, {
      statusCode: 201,
      data: order,
      message: 'Order created successfully',
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

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const query = { user: userId };

    const paginatedResult = await paginate(Order, query, Number(page), Number(limit), 'products.product');

    apiResponse(res, {
      statusCode: 200,
      data: paginatedResult.data,
      count: paginatedResult.count,
      page: paginatedResult.page,
      pages: paginatedResult.pages,
      limit: paginatedResult.limit,
      message: 'User orders fetched successfully',
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
