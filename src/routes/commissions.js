// commissions.js - Rutas de comisiones
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const commissionController = require('../controllers/commissionController');

// Registrar comisión (prestamista)
router.post('/', auth, commissionController.registerCommission);
// Marcar comisión como pagada (admin o sistema)
const checkRoles = require('../middlewares/roles');

router.put('/pay/:id', auth, checkRoles(['admin']), commissionController.payCommission);
// Listar mis comisiones (prestamista)
router.get('/my', auth, commissionController.listMyCommissions);
// Listar todas las comisiones (admin)
router.get('/all', auth, checkRoles(['admin']), commissionController.listAllCommissions);

module.exports = router;
