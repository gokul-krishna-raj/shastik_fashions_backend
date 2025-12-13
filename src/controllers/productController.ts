import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category'; // Import Category model
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse
import paginate from '../utils/pagination'; // Import paginate

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: CustomRequest, res: Response) => {
        try {
          const { name, description, originalPrice, price, category, fabric, color, stock, isBestSeller, isNewArrival } = req.body;    const images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);

    const product = await Product.create({
      name,
      description,
      originalPrice,
      price,
      category,
      images,
      fabric,
      color,
      stock,
      isBestSeller,
      isNewArrival,
    });

    apiResponse(res, {
      statusCode: 201,
      data: product,
      message: 'Product created successfully',
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

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, categorySlug, search } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    } else if (categorySlug) {
      const categoryObject = await Category.findOne({ slug: categorySlug as string });
      if (categoryObject) {
        query.category = categoryObject._id;
      } else {
        // Return empty array if category slug is not found
        return apiResponse(res, {
          statusCode: 200,
          data: [],
          count: 0,
          page: 1,
          pages: 1,
          limit: Number(limit),
          message: 'No products found for this category slug',
        });
      }
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const paginatedResult = await paginate(Product, query, Number(page), Number(limit), 'category');

    apiResponse(res, {
      statusCode: 200,
      data: paginatedResult.data,
      count: paginatedResult.count,
      page: paginatedResult.page,
      pages: paginatedResult.pages,
      limit: paginatedResult.limit,
      message: 'Products fetched successfully',
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


// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Product not found',
      });
    }

    apiResponse(res, {
      statusCode: 200,
      data: product,
      message: 'Product fetched successfully',
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: CustomRequest, res: Response) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Product not found',
      });
    }

    const { name, description, originalPrice, price, category, fabric, color, stock, isBestSeller, isNewArrival } = req.body;
    let images: string[] = product.images;

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    }

    const updatedProduct = {
      name,
      description,
      originalPrice,
      price,
      category,
      images,
      fabric,
      color,
      stock,
      isBestSeller,
      isNewArrival,
    };

    product = await Product.findByIdAndUpdate(req.params.id, updatedProduct, {
      new: true,
      runValidators: true,
    });

    apiResponse(res, {
      statusCode: 200,
      data: product,
      message: 'Product updated successfully',
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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    apiResponse(res, {
      statusCode: 200,
      data: {}, // No data on successful delete
      message: 'Product deleted successfully',
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

// @desc    Get best seller products
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { isBestSeller: true };
    const result = await paginate(Product, query, Number(page), Number(limit), 'category');
    apiResponse(res, {
      statusCode: 200,
      data: result.data,
      count: result.count,
      page: result.page,
      pages: result.totalPages,
      limit: result.limit,
      message: 'Best sellers fetched successfully',
    });
  } catch (error: any) {
    apiResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { isNewArrival: true };
    const result = await paginate(Product, query, Number(page), Number(limit), 'category');

    apiResponse(res, {
      statusCode: 200,
      data: result.data,
      count: result.count,
      page: result.page,
      pages: result.totalPages,
      limit: result.limit,
      message: 'New arrivals fetched successfully',
    });
  } catch (error: any) {
    apiResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};