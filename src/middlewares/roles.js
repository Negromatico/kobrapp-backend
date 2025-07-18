// roles.js - Middleware para validación de roles
module.exports = function(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción.' });
    }
    next();
  };
};
