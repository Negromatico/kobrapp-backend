// errorHandler.js - Middleware global para manejo de errores
module.exports = (err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    mensaje: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};
