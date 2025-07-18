// notifications.js - Rutas de notificaciones
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

// Enviar notificación individual
router.post('/', auth, notificationController.sendNotification);
// Enviar notificación global (admin)
router.post('/global', auth, notificationController.sendGlobalNotification);
// Ver mis notificaciones
router.get('/my', auth, notificationController.getMyNotifications);
// Marcar como leída
router.put('/read/:id', auth, notificationController.markAsRead);

module.exports = router;
