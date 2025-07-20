// test.js - Rutas para pruebas y simulaciones
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const testController = require('../controllers/testController');

// Simular pago para probar notificaciones (solo admin)
router.post('/simulate-payment', auth, testController.simulatePayment);

// Enviar notificación de bienvenida manual (solo admin)
router.post('/welcome-notification', auth, testController.sendWelcomeNotification);

// Simular recordatorio de próximo pago (solo admin)
router.post('/payment-reminder', auth, testController.simulatePaymentReminder);

// Listar usuarios para pruebas (solo admin)
router.get('/users', auth, testController.listUsersForTesting);

module.exports = router;
