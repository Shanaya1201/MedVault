/**
 * Standardized API Response Builders
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    statusCode,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
};

export const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};
