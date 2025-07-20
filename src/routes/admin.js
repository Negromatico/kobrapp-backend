// admin.js - Rutas de administración para Kobrapp
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// Listar cuentas y deudas (solo admin)
router.get('/accounts', auth, adminController.listAccountsAndDebts);

// Actualizar apariencia de usuario (solo admin)
router.put('/users/:id/appearance', auth, adminController.updateUserAppearance);

// Editar datos de usuario
router.put('/users/:id', auth, adminController.editUser);

// Eliminar usuario
router.delete('/users/:id', auth, adminController.deleteUser);

// Resetear contraseña de usuario
router.post('/users/:id/reset-password', auth, adminController.resetPassword);

// Enviar notificación de pago a prestamista
router.post('/users/:id/notify-payment', auth, adminController.sendPaymentNotification);

module.exports = router;
