import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Protect routes
export const protect = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = await User.findById(decoded.id) as IUser;

    next();
  } catch (err) {
    console.log("err =>",err);
    
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};