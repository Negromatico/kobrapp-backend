// auth.js - Middleware para proteger rutas usando JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // Permitir ambos: Authorization: Bearer <token> y x-auth-token
  let token = req.header('Authorization');
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  } else {
    token = req.header('x-auth-token');
  }
  if (!token) return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ mensaje: 'Token inválido.' });
  }
};
