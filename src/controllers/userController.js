// userController.js - Controlador de usuarios
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.usuario._id).select('-contrasena');
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ usuario: user });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.contrasena;
    const user = await User.findByIdAndUpdate(req.usuario._id, updates, { new: true, select: '-contrasena' });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ usuario: user });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { bloqueado: true }, { new: true });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Usuario bloqueado.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-contrasena');
    res.json(users);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
