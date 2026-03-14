const errorHandler = (error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: 'Something went wrong. Please try again.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

module.exports = errorHandler;
