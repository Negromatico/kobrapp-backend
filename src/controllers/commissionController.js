// commissionController.js - Controlador de comisiones
const Commission = require('../models/Commission');

exports.registerCommission = async (req, res) => {
  try {
    const { monto, comprobanteUrl } = req.body;
    if (!monto) {
      return res.status(400).json({ mensaje: 'El monto es obligatorio.' });
    }
    const commission = new Commission({
      prestamista: req.usuario._id,
      monto,
      comprobanteUrl,
      estado: 'pendiente'
    });
    await commission.save();
    res.status(201).json({ mensaje: 'Comisión registrada correctamente.', commission });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.payCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await Commission.findByIdAndUpdate(id, { estado: 'pagado' }, { new: true });
    if (!commission) return res.status(404).json({ mensaje: 'Comisión no encontrada.' });
    res.json({ mensaje: 'Comisión marcada como pagada.', commission });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listMyCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find({ prestamista: req.usuario._id });
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listAllCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find().populate('prestamista', 'nombreCompleto correo');
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
