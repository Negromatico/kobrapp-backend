// paymentController.js - Controlador de pagos
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const NotificationService = require('../services/notificationService');

exports.registerPayment = async (req, res) => {
  try {
    const { loan, monto, comprobanteUrl } = req.body;
    if (!loan || !monto) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    
    // Obtener información del préstamo antes de registrar el pago
    const loanData = await Loan.findById(loan).populate('cliente prestamista');
    if (!loanData) {
      return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    }
    
    const payment = new Payment({
      loan,
      cliente: req.usuario._id,
      monto,
      comprobanteUrl
    });
    await payment.save();
    
    // Actualiza cuotas pagadas y estado del préstamo
    await Loan.findByIdAndUpdate(loan, { $inc: { cuotasPagadas: 1 } });
    
    // Enviar notificaciones automáticas
    try {
      // Notificar al cliente que su pago fue exitoso
      await NotificationService.notifyPaymentSuccess(
        req.usuario._id, 
        loan, 
        monto
      );
      
      // Notificar al prestamista que recibió un pago
      await NotificationService.notifyLenderPaymentReceived(
        loanData.prestamista._id,
        req.usuario._id,
        loan,
        monto
      );
      
      console.log('Notificaciones de pago enviadas exitosamente');
    } catch (notifError) {
      console.error('Error enviando notificaciones de pago:', notifError);
      // No fallar el pago por errores de notificación
    }
    
    res.status(201).json({ mensaje: 'Pago registrado correctamente.', payment });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listPaymentsByLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const payments = await Payment.find({ loan: loanId }).populate('cliente', 'nombreCompleto correo');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listPaymentsByUser = async (req, res) => {
  try {
    const payments = await Payment.find({ cliente: req.usuario._id }).populate('loan');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
