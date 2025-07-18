// admin.js - Rutas de administración para Kobrapp
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Listar cuentas y deudas (solo admin)
router.get('/accounts', auth, adminController.listAccountsAndDebts);

// Actualizar apariencia de usuario (solo admin)
router.put('/users/:id/appearance', auth, adminController.updateUserAppearance);

module.exports = router;
