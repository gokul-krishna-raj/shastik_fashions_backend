import { Request, Response } from 'express';
import User from '../models/User';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, mobile, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'User already exists',
      });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password,
      mobile,
      role,
    });

    // Generate token
    const token = user.generateAuthToken();

    apiResponse(res, {
      statusCode: 201,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      message: 'User registered successfully',
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return apiResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    apiResponse(res, {
      statusCode: 200,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      message: 'User logged in successfully',
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
