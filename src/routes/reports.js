// reports.js - Rutas de reportes y estadísticas
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const reportController = require('../controllers/reportController');

// Estadísticas generales
router.get('/stats', auth, reportController.generalStats);
// Ganancias mensuales
router.get('/monthly', auth, reportController.monthlyEarnings);
// Ganancias del día actual
router.get('/daily', auth, reportController.dailyEarnings);
// Exportar reporte (placeholder)
router.get('/export', auth, reportController.exportReport);

module.exports = router;
