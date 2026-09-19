function notFoundHandler(req, res) {
  if (req.accepts('html')) {
    return res.status(404).render('error', {
      title: 'Page Not Found',
      statusCode: 404,
      message: 'The page you are looking for does not exist.'
    });
  }
  res.status(404).json({ error: 'Not found' });
}

function globalErrorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (req.accepts('html')) {
    return res.status(statusCode).render('error', {
      title: 'Error',
      statusCode,
      message
    });
  }

  res.status(statusCode).json({ error: message });
}

module.exports = { notFoundHandler, globalErrorHandler };
