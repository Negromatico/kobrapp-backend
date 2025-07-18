// adminController.js - Endpoints de administración para Kobrapp
const User = require('../models/User');
const Loan = require('../models/Loan');

// Listar todas las cuentas y cuánto debe cada una
exports.listAccountsAndDebts = async (req, res) => {
  try {
    // Solo admin
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    // Traer todos los usuarios
    const users = await User.find().select('-contrasena');
    // Para cada usuario, calcular la deuda activa (suma de préstamos pendientes o en mora)
    const accounts = await Promise.all(users.map(async (u) => {
      const loans = await Loan.find({ cliente: u._id, estado: { $in: ['pendiente', 'al_dia', 'en_mora'] } });
      const deuda = loans.reduce((sum, l) => sum + l.monto - (l.monto / l.cuotas) * l.cuotasPagadas, 0);
      return {
        ...u.toObject(),
        deuda,
      };
    }));
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Actualizar apariencia de usuario
exports.updateUserAppearance = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    const { id } = req.params;
    const { appearance } = req.body;
    const user = await User.findByIdAndUpdate(id, { appearance }, { new: true, select: '-contrasena' });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ usuario: user });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
