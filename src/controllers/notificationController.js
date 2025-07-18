// notificationController.js - Controlador de notificaciones
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendNotification = async (req, res) => {
  try {
    const { usuario, tipo, mensaje } = req.body;
    if (!usuario || !tipo || !mensaje) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    const notification = new Notification({ usuario, tipo, mensaje });
    await notification.save();
    res.status(201).json({ mensaje: 'Notificación enviada.', notification });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.sendGlobalNotification = async (req, res) => {
  try {
    const { tipo, mensaje } = req.body;
    if (!tipo || !mensaje) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    const users = await User.find({});
    const notifications = await Promise.all(users.map(async (u) => {
      const n = new Notification({ usuario: u._id, tipo, mensaje });
      return await n.save();
    }));
    res.status(201).json({ mensaje: 'Notificaciones globales enviadas.', count: notifications.length });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ usuario: req.usuario._id }).sort({ fecha: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { leida: true }, { new: true });
    if (!notification) return res.status(404).json({ mensaje: 'Notificación no encontrada.' });
    res.json({ mensaje: 'Notificación marcada como leída.', notification });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
