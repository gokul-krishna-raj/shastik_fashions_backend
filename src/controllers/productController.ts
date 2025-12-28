import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category'; // Import Category model
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse
import paginate from '../utils/pagination'; // Import paginate
import transformProduct from '../utils/productResponse'; // Add transformer for consistent API shape

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: CustomRequest, res: Response) => {
  try {
    const { name, description, originalPrice, price, category, fabric, color, stock, isBestSeller, isNewArrival } = req.body;
    let images: string[] = [];
    let imageUrls: string[] = req.body.images;
    const hasFiles = req.files && (req.files as Express.Multer.File[]).length > 0;
    const hasUrls = imageUrls && imageUrls.length > 0;

    // Enforce Mutual Exclusivity
    if (hasFiles && hasUrls) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Please provide either image files OR image URLs, not both.',
      });
    }

    if (hasFiles) {
      images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    } else if (hasUrls) {
      images = imageUrls;
    } else {
      // Optional: Enforce at least one image source if required by business logic, 
      // though schema validation might not enforce it, controller logic often does.
      // Given prompt "If files exist... Else if image URLs... Else return validation error"
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Please provide product images (either uploaded files or URLs).',
      });
    }

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
      data: transformProduct(product),
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

// @desc    Get all products with filtering and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      categorySlug,
      search,
      colors,
      fabrics,
      sortBy
    } = req.query;

    const query: any = {};

    // Category filtering
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

    // Search filtering
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Color filtering (supports multiple colors)
    if (colors) {
      const colorArray = (colors as string).split(',').map(c => c.trim());
      query.color = { $in: colorArray };
    }

    // Fabric filtering (supports multiple fabrics)
    if (fabrics) {
      const fabricArray = (fabrics as string).split(',').map(f => f.trim());
      query.fabric = { $in: fabricArray };
    }

    // Sorting options
    let sortOptions: any = {};
    if (sortBy) {
      switch (sortBy) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'price_low':
          sortOptions = { price: 1 };
          break;
        case 'price_high':
          sortOptions = { price: -1 };
          break;
        case 'best_sellers':
          sortOptions = { isBestSeller: -1 };
          break;
        default:
          sortOptions = {};
      }
    }

    const paginatedResult = await paginate(
      Product,
      query,
      Number(page),
      Number(limit),
      'category',
      sortOptions
    );

    apiResponse(res, {
      statusCode: 200,
      data: paginatedResult.data.map((p: any) => transformProduct(p)),
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
      data: transformProduct(product),
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
    let imageUrls: string[] = req.body.images;

    const hasFiles = req.files && (req.files as Express.Multer.File[]).length > 0;
    const hasUrls = imageUrls && imageUrls.length > 0;

    // Enforce Mutual Exclusivity
    if (hasFiles && hasUrls) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Please provide either image files OR image URLs, not both.',
      });
    }

    if (hasFiles) {
      images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    } else if (hasUrls) {
      images = imageUrls;
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
      data: transformProduct(product),
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
      data: result.data.map((p: any) => transformProduct(p)),
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
      data: result.data.map((p: any) => transformProduct(p)),
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