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

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

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
      estimatedDelivery,
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
      success: true,
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

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrderById = async (req: CustomRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('products.product', 'name price image')
      .populate('shippingAddress');



    if (!order) {
      return apiResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Order not found',
      });
    }

    return apiResponse(res, {
      statusCode: 200,
      success: true,
      data: order,
      message: 'Order details fetched successfully',
    });
  } catch (error: any) {
    console.error(error.message);
    return apiResponse(res, {
      statusCode: 500,
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getAllOrders = async (req: CustomRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, sort = '-createdAt', q, user } = req.query;

    const query: any = {};

    // Filter by order status
    if (status) {
      query.orderStatus = status;
    }

    // Filter by specific user id
    if (user) {
      query.user = user;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const sd = new Date(startDate as string);
        if (!isNaN(sd.getTime())) query.createdAt.$gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate as string);
        if (!isNaN(ed.getTime())) query.createdAt.$lte = ed;
      }
    }

    // Search by order id or user id
    if (q) {
      const qStr = String(q);
      // If looks like an ObjectId, search in _id or user
      if (/^[0-9a-fA-F]{24}$/.test(qStr)) {
        query.$or = [{ _id: qStr }, { user: qStr }];
      }
    }

    // Fetch paginated results
    const paginatedResult = await paginate(
      Order,
      query,
      Number(page),
      Number(limit),
      ['user', 'products.product'],
      sort as string
    );


    apiResponse(res, {
      statusCode: 200,
      data: paginatedResult.data,
      count: paginatedResult.count,
      totalDocs: paginatedResult.totalDocs,
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

// @desc    Get current user's orders (paginated)
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

    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const paginatedResult = await paginate(
      Order,
      { user: userId },
      Number(page),
      Number(limit),
      ['products.product'],
      sort as string
    );

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
