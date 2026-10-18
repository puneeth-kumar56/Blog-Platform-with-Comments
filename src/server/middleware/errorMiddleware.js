export const notFound = (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: `API Route not found: [${req.method}] ${req.originalUrl}`,
    });
    return;
  }
  next();
};

export const errorHandler = (err, _req, res, _next) => {
  console.error('[Server Error Handler]:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
