import { Request, Response } from 'express';
import Category from '../models/Category';
import apiResponse from '../utils/apiResponse'; // Import apiResponse

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.create({
      name,
      description,
      image,
      slug: name.split(' ').join('-').toLowerCase(),
    });

    apiResponse(res, {
      statusCode: 201,
      data: category,
      message: 'Category created successfully',
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

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();

    apiResponse(res, {
      statusCode: 200,
      data: categories,
      count: categories.length,
      message: 'Categories fetched successfully',
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

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Category not found',
      });
    }

    apiResponse(res, {
      statusCode: 200,
      data: category,
      message: 'Category fetched successfully',
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

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Category not found',
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    apiResponse(res, {
      statusCode: 200,
      data: category,
      message: 'Category updated successfully',
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

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return apiResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Category not found',
      });
    }

    await category.deleteOne();

    apiResponse(res, {
      statusCode: 200,
      data: {}, // No data on successful delete
      message: 'Category deleted successfully',
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