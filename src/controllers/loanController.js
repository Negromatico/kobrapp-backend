// loanController.js - Controlador de préstamos
const Loan = require('../models/Loan');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createLoan = async (req, res) => {
  try {
    const { cliente, monto, interes, fechaInicio, cuotas, frecuencia } = req.body;
    if (!cliente || !monto || !interes || !fechaInicio || !cuotas || !frecuencia) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    const loan = new Loan({
      prestamista: req.usuario._id,
      cliente,
      monto,
      interes,
      fechaInicio,
      cuotas,
      frecuencia
    });
    await loan.save();
    // Notificar al cliente para que acepte el préstamo
    await Notification.create({
      usuario: cliente,
      tipo: 'alerta',
      mensaje: `Tienes un nuevo préstamo pendiente de aceptar.`,
    });
    res.status(201).json({ mensaje: 'Préstamo creado correctamente.', loan });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listLoans = async (req, res) => {
  try {
    let filter = {};
    if (req.usuario.rol === 'prestamista') {
      filter.prestamista = req.usuario._id;
    } else if (req.usuario.rol === 'cliente') {
      filter.cliente = req.usuario._id;
    }
    const loans = await Loan.find(filter).populate('cliente', 'nombreCompleto correo').populate('prestamista', 'nombreCompleto correo');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('cliente', 'nombreCompleto correo').populate('prestamista', 'nombreCompleto correo');
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    // Solo prestamista o cliente involucrado puede ver
    if (loan.prestamista._id.toString() !== req.usuario._id && loan.cliente._id.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    res.json(loan);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.acceptLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    if (loan.cliente.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: 'El préstamo ya fue aceptado o rechazado.' });
    }
    loan.estado = 'al_dia';
    await loan.save();
    res.json({ mensaje: 'Préstamo aceptado.', loan });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    if (loan.cliente.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: 'El préstamo ya fue aceptado o rechazado.' });
    }
    await loan.deleteOne();
    res.json({ mensaje: 'Préstamo rechazado y eliminado.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const updates = req.body;
    const loan = await Loan.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    res.json({ mensaje: 'Préstamo eliminado.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
