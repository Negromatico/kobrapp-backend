// testController.js - Controlador para pruebas y simulaciones
const NotificationService = require('../services/notificationService');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// Simular pago para probar notificaciones
exports.simulatePayment = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo admin puede simular pagos.' });
    }

    const { clientId, lenderId, amount } = req.body;
    
    if (!clientId || !lenderId || !amount) {
      return res.status(400).json({ mensaje: 'clientId, lenderId y amount son requeridos.' });
    }

    // Verificar que los usuarios existen
    const client = await User.findById(clientId);
    const lender = await User.findById(lenderId);
    
    if (!client || !lender) {
      return res.status(404).json({ mensaje: 'Cliente o prestamista no encontrado.' });
    }

    // Crear un préstamo simulado si no existe
    let loan = await Loan.findOne({ cliente: clientId, prestamista: lenderId });
    if (!loan) {
      loan = new Loan({
        cliente: clientId,
        prestamista: lenderId,
        monto: amount * 10, // Simular préstamo 10 veces mayor
        cuotas: 12,
        cuotasPagadas: 0,
        estado: 'activo'
      });
      await loan.save();
    }

    // Simular el pago
    const payment = new Payment({
      loan: loan._id,
      cliente: clientId,
      monto: amount,
      comprobanteUrl: 'https://ejemplo.com/comprobante-simulado.jpg'
    });
    await payment.save();

    // Enviar notificaciones automáticas
    await NotificationService.notifyPaymentSuccess(clientId, loan._id, amount);
    await NotificationService.notifyLenderPaymentReceived(lenderId, clientId, loan._id, amount);

    res.json({
      mensaje: 'Pago simulado exitosamente',
      pago: payment,
      prestamo: loan,
      notificacionesEnviadas: true
    });

  } catch (error) {
    console.error('Error simulando pago:', error);
    res.status(500).json({ mensaje: 'Error simulando pago', error: error.message });
  }
};

// Enviar notificación de bienvenida manual
exports.sendWelcomeNotification = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo admin puede enviar notificaciones manuales.' });
    }

    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ mensaje: 'userId es requerido.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    await NotificationService.notifyWelcome(userId, user.rol);

    res.json({
      mensaje: 'Notificación de bienvenida enviada',
      usuario: user.nombreCompleto,
      rol: user.rol
    });

  } catch (error) {
    console.error('Error enviando notificación de bienvenida:', error);
    res.status(500).json({ mensaje: 'Error enviando notificación', error: error.message });
  }
};

// Simular recordatorio de próximo pago
exports.simulatePaymentReminder = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo admin puede simular recordatorios.' });
    }

    const { clientId, amount, daysUntilDue } = req.body;
    
    if (!clientId || !amount || daysUntilDue === undefined) {
      return res.status(400).json({ mensaje: 'clientId, amount y daysUntilDue son requeridos.' });
    }

    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    // Calcular fecha de vencimiento
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilDue);

    // Crear préstamo simulado si no existe
    let loan = await Loan.findOne({ cliente: clientId });
    if (!loan) {
      loan = new Loan({
        cliente: clientId,
        prestamista: req.usuario._id, // Admin como prestamista
        monto: amount * 10,
        cuotas: 12,
        cuotasPagadas: 0,
        estado: 'activo'
      });
      await loan.save();
    }

    await NotificationService.notifyUpcomingPayment(clientId, loan._id, dueDate, amount);

    res.json({
      mensaje: 'Recordatorio de pago enviado',
      cliente: client.nombreCompleto,
      monto: amount,
      diasHastaVencimiento: daysUntilDue,
      fechaVencimiento: dueDate
    });

  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    res.status(500).json({ mensaje: 'Error enviando recordatorio', error: error.message });
  }
};

// Listar todos los usuarios para pruebas
exports.listUsersForTesting = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo admin puede listar usuarios.' });
    }

    const users = await User.find({}, 'nombreCompleto correo rol _id').sort({ nombreCompleto: 1 });

    res.json({
      mensaje: 'Lista de usuarios para pruebas',
      usuarios: users,
      total: users.length
    });

  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ mensaje: 'Error listando usuarios', error: error.message });
  }
};
