import { Response } from 'express';
import Cart from '../models/Cart';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addItemToCart = async (req: CustomRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    let cartItem = await Cart.findOne({ user: userId, product: productId });

    if (cartItem) {
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: userId,
        product: productId,
        quantity,
      });
    }

    apiResponse(res, {
      statusCode: 201,
      data: cartItem,
      message: 'Item added to cart successfully',
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

// @desc    Get user's cart items
// @route   GET /api/cart
// @access  Private
export const getCartItems = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const cartItems = await Cart.find({ user: userId }).populate('product');

    apiResponse(res, {
      statusCode: 200,
      data: cartItems,
      count: cartItems.length,
      message: 'Cart items fetched successfully',
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
export const removeCartItem = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const cartItem = await Cart.findOneAndDelete({ product: req.params.id, user: userId });

    if (!cartItem) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Cart item not found',
      });
    }

    apiResponse(res, {
      statusCode: 200,
      data: {},
      message: 'Cart item removed successfully',
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

// @desc    Clear cart (user's cart or all carts if admin)
// @route   DELETE /api/cart
// @access  Private (admin can clear all)
export const clearCart = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    let result;

    // Admin can delete all cart items
    if (req.user?.role === 'admin') {
      result = await Cart.deleteMany({});
      apiResponse(res, {
        statusCode: 200,
        data: { deletedCount: result.deletedCount ?? 0 },
        message: 'All cart items deleted successfully',
      });
      return;
    }

    // Regular user: delete only their cart items
    result = await Cart.deleteMany({ user: userId });

    apiResponse(res, {
      statusCode: 200,
      data: { deletedCount: result.deletedCount ?? 0 },
      message: 'Your cart cleared successfully',
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