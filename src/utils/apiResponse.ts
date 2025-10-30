import { Response } from 'express';

interface ApiResponseOptions {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: any;
  count?: number;
  page?: number;
  pages?: number;
  limit?: number;
  token?: string;
  stack?: any;
}

const apiResponse = (res: Response, options: ApiResponseOptions) => {
  const {
    success = true,
    message = success ? 'Success' : 'Error',
    statusCode = success ? 200 : 500,
    data = null,
    count,
    page,
    pages,
    limit,
    token,
    stack,
  } = options;

  res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
    ...(count !== undefined && { count }),
    ...(page !== undefined && { page }),
    ...(pages !== undefined && { pages }),
    ...(limit !== undefined && { limit }),
    ...(token && { token }),
    ...(process.env.NODE_ENV === 'development' && stack && { stack }),
  });
};

export default apiResponse;