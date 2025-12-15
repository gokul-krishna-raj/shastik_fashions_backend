import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import apiResponse from '../utils/apiResponse';

const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false, // Include all errors
    allowUnknown: true, // Allow unknown properties
    stripUnknown: true, // Remove unknown properties
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return apiResponse(res, {
      success: false,
      statusCode: 400,
      message: errorMessage,
    });
  }
  next();
};

export const validateQuery = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return apiResponse(res, {
      success: false,
      statusCode: 400,
      message: errorMessage,
    });
  }
  next();
};

export default validate;
