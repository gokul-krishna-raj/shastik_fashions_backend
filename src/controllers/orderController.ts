import { Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import User from '../models/User';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse';
import { razorpay } from '../config/razorpay';
import paginate from '../utils/pagination';
import sendEmail from '../utils/sendEmail';

// @desc    Confirm order and create new order
// @route   POST /api/orders/confirm
// @access  Private
export const confirmOrder = async (req: CustomRequest, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, products, shippingAddress, totalAmount, paymentMethod, paymentStatus } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return apiResponse(res, {
      success: false,
      statusCode: 401,
      message: 'Not authorized',
    });
  }

  try {
    /* ----------------------------------
           Razorpay verification (ONLY ONLINE)
        ----------------------------------- */
    if (paymentMethod === 'Razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return apiResponse(res, {
          success: false,
          statusCode: 400,
          message: 'Missing Razorpay payment details',
        });
      }

      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generated_signature !== razorpaySignature) {
        return apiResponse(res, {
          success: false,
          statusCode: 400,
          message: 'Invalid Razorpay signature',
        });
      }
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create a new order
    // const order = await Order.create({
    //   user: userId,
    //   products,
    //   shippingAddress,
    //   totalAmount,
    //   paymentMethod: 'Razorpay',
    //   paymentStatus: 'paid',
    //   razorpayOrderId,
    //   razorpayPaymentId,
    //   razorpaySignature,
    //   orderStatus: 'processing',
    //   estimatedDelivery,
    // });

    // Validate availability and reduce stock per variant (or global stock if variants not present)
    // First, verify all items have required variant.color and sufficient stock
    for (const item of products) {
      const productDoc: any = await Product.findById(item.product);
      if (!productDoc) {
        return apiResponse(res, {
          success: false,
          statusCode: 404,
          message: `Product ${item.product} not found`,
        });
      }

      // Validate variant
      const variantColor = item.variant?.color;
      if (!variantColor) {
        return apiResponse(res, {
          success: false,
          statusCode: 400,
          message: 'Variant color is required for each product',
        });
      }

      const hasVariants = Array.isArray(productDoc.variants) && productDoc.variants.length > 0;
      if (hasVariants) {
        const variant = productDoc.variants.find((v: any) => String(v.color).toLowerCase() === String(variantColor).toLowerCase());
        if (!variant) {
          return apiResponse(res, {
            success: false,
            statusCode: 400,
            message: `Selected color ${variantColor} not available for product ${item.product}`,
          });
        }
        if (variant.stock < item.quantity) {
          return apiResponse(res, {
            success: false,
            statusCode: 400,
            message: `Insufficient stock for color ${variantColor} of product ${item.product}`,
          });
        }
      } else {
        // Use global stock
        if (typeof productDoc.stock !== 'number' || productDoc.stock < item.quantity) {
          return apiResponse(res, {
            success: false,
            statusCode: 400,
            message: `Insufficient global stock for product ${item.product}`,
          });
        }
      }
    }

    // All validations passed — create order and then deduct stock

    const order = await Order.create({
      user: userId,
      products,
      shippingAddress,
      totalAmount,
      paymentMethod,                      // COD / Razorpay
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      razorpayOrderId: paymentMethod === 'Razorpay' ? razorpayOrderId : null,
      razorpayPaymentId: paymentMethod === 'Razorpay' ? razorpayPaymentId : null,
      razorpaySignature: paymentMethod === 'Razorpay' ? razorpaySignature : null,
      orderStatus: 'processing',
      estimatedDelivery,
    });

    // Deduct stock per item
    for (const item of products) {
      const productDoc: any = await Product.findById(item.product);
      const variantColor = item.variant?.color;
      const hasVariants = Array.isArray(productDoc.variants) && productDoc.variants.length > 0;
      if (hasVariants) {
        // decrement variant stock
        await Product.updateOne(
          { _id: item.product, 'variants.color': variantColor },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      } else {
        // decrement global stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Clear user's cart
    await Cart.deleteMany({ user: userId });

    // Send confirmation email
    try {
      const userDoc = await User.findById(userId);
      if (userDoc) {
        const orderDetails: any = await Order.findById(order._id)
          .populate('products.product');

        const productsHtml = orderDetails.products.map((item: any) => {
          return `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name} (${item.variant?.color || 'Standard'})</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">₹${item.product.price}</td>
            </tr>
          `;
        }).join('');

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Order Confirmation</h1>
            <p>Hi ${userDoc.name},</p>
            <p>Thank you for your order! We have received it and are preparing it for shipment.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            
            <h3>Order Details:</h3>
            <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>
            
            <div style="border-top: 1px solid #eee; padding-top: 15px;">
              <h3>Shipping Address:</h3>
              <p>
                ${orderDetails.shippingAddress.fullName}<br>
                ${orderDetails.shippingAddress.addressLine1}<br>
                ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} - ${orderDetails.shippingAddress.pincode}<br>
                Phone: ${orderDetails.shippingAddress.phone}
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        `;

        await sendEmail({
          email: userDoc.email,
          subject: `Order Confirmation - #${order._id}`,
          message: `Thank you for your order! Order ID: ${order._id}`,
          html
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

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
    const { page = 1, limit = 10, status, startDate, endDate, sort = '-createdAt', q, user, sortOrder } = req.query;
    let sortBy = sort;
    const query: any = {};
    if (sortOrder === 'asc') {
      sortBy = 'createdAt';
    } else {
      sortBy = '-createdAt';
    }
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
      ['user', 'products.product', 'shippingAddress'],
      sortBy as string
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
    const { status } = req.body;
    console.log("req.params =>", req.params.orderId);

    let order = await Order.findById(req.params.orderId);

    if (!order) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
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
