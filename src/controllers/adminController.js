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

// Editar datos de usuario (nombre, correo, rol, bloqueado)
exports.editUser = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    const { id } = req.params;
    const { nombreCompleto, correo, rol, bloqueado } = req.body;
    const update = {};
    if (nombreCompleto) update.nombreCompleto = nombreCompleto;
    if (correo) update.correo = correo;
    if (rol) update.rol = rol;
    if (typeof bloqueado === 'boolean') update.bloqueado = bloqueado;
    const user = await User.findByIdAndUpdate(id, update, { new: true, select: '-contrasena' });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ usuario: user });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Usuario eliminado.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Resetear contraseña de usuario (genera una nueva y la retorna)
const bcrypt = require('bcryptjs');
exports.resetPassword = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    const { id } = req.params;
    const nuevaContrasena = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(nuevaContrasena, 10);
    const user = await User.findByIdAndUpdate(id, { contrasena: hash }, { new: true, select: '-contrasena' });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ usuario: user, nuevaContrasena });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Enviar notificación de próximo pago a prestamista
const Notification = require('../models/Notification');
exports.sendPaymentNotification = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    const { id } = req.params;
    const { mensaje } = req.body;
    
    // Verificar que el usuario existe y es prestamista
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    if (user.rol !== 'prestamista') {
      return res.status(400).json({ mensaje: 'Solo se pueden enviar notificaciones a prestamistas.' });
    }
    
    // Crear la notificación
    const notification = new Notification({
      usuario: id,
      tipo: 'pago_proximo',
      titulo: 'Recordatorio de Pago',
      mensaje: mensaje || `Hola ${user.nombreCompleto}, te recordamos que tienes un pago próximo. Por favor, realiza tu pago para mantener tu cuenta al día.`,
      fecha: new Date(),
      leida: false
    });
    
    await notification.save();
    
    // Aquí podrías agregar lógica para enviar email/SMS real
    // Por ejemplo: await sendEmail(user.correo, notification.titulo, notification.mensaje);
    
    res.json({ 
      mensaje: 'Notificación enviada exitosamente',
      notificacion: notification,
      usuario: user.nombreCompleto
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
