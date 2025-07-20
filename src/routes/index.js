// index.js - Exporta todas las rutas principales
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/loans', require('./loans'));
router.use('/payments', require('./payments'));
router.use('/commissions', require('./commissions'));
router.use('/notifications', require('./notifications'));
router.use('/routes', require('./routes'));
router.use('/reports', require('./reports'));
router.use('/admin', require('./admin'));
router.use('/cron', require('./cron'));
// Aquí se agregarán más rutas: etc.

module.exports = router;
