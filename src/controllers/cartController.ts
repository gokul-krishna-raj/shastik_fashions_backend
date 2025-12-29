import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addItemToCart = async (req: CustomRequest, res: Response) => {
  try {
    const { productId, quantity, variant } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    // variant.color is required by validation middleware, still double-check
    if (!variant || !variant.color) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Variant color is required',
      });
    }

    // Validate product and color availability
    const product = await Product.findById(productId);
    if (!product) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Product not found',
      });
    }

    const colorVal = variant.color;
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

    // If the product defines colors or variants, ensure selected color exists
    if (hasVariants) {
      const found = product.variants!.find((v: any) => String(v.color).toLowerCase() === String(colorVal).toLowerCase());
      if (!found) {
        return apiResponse(res, {
          success: false,
          statusCode: 400,
          message: 'Selected color not available for this product (variant not found)',
        });
      }
    } else if (hasColors) {
      const found = product.colors!.map((c: string) => String(c).toLowerCase()).includes(String(colorVal).toLowerCase());
      if (!found) {
        return apiResponse(res, {
          success: false,
          statusCode: 400,
          message: 'Selected color not available for this product',
        });
      }
    }

    // Find existing cart item by user, product, and variant color
    let cartItem = await Cart.findOne({ user: userId, product: productId, 'variant.color': colorVal });

    if (cartItem) {
      cartItem.quantity = quantity;
      cartItem.variant = { color: variant.color, image: variant.image };
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: userId,
        product: productId,
        quantity,
        variant: { color: variant.color, image: variant.image },
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

    // Ensure variant color is included in response
    const data = cartItems.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      variant: item.variant,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    apiResponse(res, {
      statusCode: 200,
      data,
      count: data.length,
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
    const color = req.query.color as string | undefined;

    if (!userId) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authorized',
      });
    }

    let cartItem;
    if (color) {
      cartItem = await Cart.findOneAndDelete({ product: req.params.id, user: userId, 'variant.color': color });
    } else {
      // fallback for previous behavior (deleting by product id)
      cartItem = await Cart.findOneAndDelete({ product: req.params.id, user: userId });
    }

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

// @desc    Update cart item (quantity or variant)
// @route   POST /api/cart/update
// @access  Private
export const updateCartItem = async (req: CustomRequest, res: Response) => {
  try {
    const { productId, quantity, variant } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse(res, { success: false, statusCode: 401, message: 'Not authorized' });
    }

    if (!productId) {
      return apiResponse(res, { success: false, statusCode: 400, message: 'productId is required' });
    }

    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
      return apiResponse(res, { success: false, statusCode: 400, message: 'quantity must be an integer >= 0' });
    }

    if (variant && !variant.color) {
      return apiResponse(res, { success: false, statusCode: 400, message: 'Variant color is required when variant provided' });
    }

    const product = await Product.findById(productId).lean().exec();
    if (!product) {
      return apiResponse(res, { success: false, statusCode: 404, message: 'Product not found' });
    }

    const colorVal = variant?.color;
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

    if (colorVal) {
      if (hasVariants) {
        const found = product.variants!.find((v: any) => String(v.color).toLowerCase() === String(colorVal).toLowerCase());
        if (!found) {
          return apiResponse(res, { success: false, statusCode: 400, message: 'Selected color not available for this product (variant not found)' });
        }
      } else if (hasColors) {
        const found = product.colors!.map((c: string) => String(c).toLowerCase()).includes(String(colorVal).toLowerCase());
        if (!found) {
          return apiResponse(res, { success: false, statusCode: 400, message: 'Selected color not available for this product' });
        }
      }
    }

    const query: any = { user: userId, product: productId };
    if (colorVal) query['variant.color'] = colorVal;

    const cartItem = await Cart.findOne(query);
    if (!cartItem) {
      return apiResponse(res, { success: false, statusCode: 404, message: 'Cart item not found for the given product/variant' });
    }

    // If quantity is zero, remove the item
      if (Number(quantity) === 0) {
        await Cart.deleteOne({ _id: cartItem._id });
        return apiResponse(res, {
          success: true,
          statusCode: 200,
          message: 'Cart item removed',
          data: {},
        });
      }
    if (quantity < 0) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Quantity cannot be negative',
      });
    }

    cartItem.quantity = quantity;
    if (variant) cartItem.variant = { color: variant.color, image: variant.image };
    await cartItem.save();

    apiResponse(res, { statusCode: 200, data: cartItem, message: 'Cart item updated successfully' });
  } catch (error: any) {
    console.error(error.message);
    apiResponse(res, { success: false, statusCode: 500, message: 'Server Error', stack: error.stack });
  }
};


