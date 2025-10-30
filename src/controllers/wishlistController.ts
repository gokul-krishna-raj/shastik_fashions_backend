import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addItemToWishlist = async (req: CustomRequest, res: Response) => {
  try {
    const { productId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const wishlistItem = await Wishlist.create({
      user: userId,
      product: productId,
    });

    apiResponse(res, {
      statusCode: 201,
      data: wishlistItem,
      message: 'Item added to wishlist successfully',
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

// @desc    Get user's wishlist items
// @route   GET /api/wishlist
// @access  Private
export const getWishlistItems = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const wishlistItems = await Wishlist.find({ user: userId }).populate('product');

    apiResponse(res, {
      statusCode: 200,
      data: wishlistItems,
      count: wishlistItems.length,
      message: 'Wishlist items fetched successfully',
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

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
export const removeWishlistItem = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    const wishlistItem = await Wishlist.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!wishlistItem) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Wishlist item not found',
      });
    }

    apiResponse(res, {
      statusCode: 200,
      data: {}, // No data on successful delete
      message: 'Wishlist item removed successfully',
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