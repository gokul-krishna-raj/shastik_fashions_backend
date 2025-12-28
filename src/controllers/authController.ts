import { Request, Response } from 'express';
import User from '../models/User';
import { CustomRequest } from '../middleware/authMiddleware';
import apiResponse from '../utils/apiResponse'; // Import apiResponse
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (user: any) => {
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

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

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    apiResponse(res, {
      statusCode: 201,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        token:accessToken,
        refreshToken,
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

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    apiResponse(res, {
      statusCode: 200,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        token:accessToken,
        refreshToken,
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

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return apiResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Invalid refresh token',
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user);

    apiResponse(res, {
      statusCode: 200,
      data: {
        token:accessToken,
        refreshToken: newRefreshToken,
      },
      message: 'Access token refreshed successfully',
    });
  } catch (error: any) {
    console.error(error.message);
    apiResponse(res, {
      success: false,
      statusCode: 401,
      message: 'Invalid refresh token',
    });
  }
};

// @desc    Check if authenticated user is admin
// @route   GET /api/auth/check-admin
// @access  Private
export const checkAdminRole = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return apiResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Not authenticated',
      });
    }

    const isAdmin = req.user.role === 'admin';

    apiResponse(res, {
      statusCode: 200,
      data: { isAdmin },
      message: 'Admin status fetched successfully',
    });
  } catch (error: any) {
    console.error('Error checking admin role:', error.message);
    apiResponse(res, {
      success: false,
      statusCode: 500,
      message: 'Server Error',
      stack: error.stack,
    });
  }
};
