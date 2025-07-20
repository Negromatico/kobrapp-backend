// cron.js - Rutas para tareas programadas
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const cronController = require('../controllers/cronController');

// Ejecutar verificaciones diarias (solo admin)
router.post('/daily-notifications', auth, async (req, res) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado.' });
  }
  await cronController.runDailyNotifications(req, res);
});

// Ejecutar verificación manual (solo admin, para testing)
router.get('/manual-check', auth, cronController.runManualNotificationCheck);

module.exports = router;
