import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
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
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Attach user to request
    const user = await User.findById(decoded.id).select('-password') as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err: any) {
    console.log("err =>", err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('JWT error:', err);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role ?? 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};
