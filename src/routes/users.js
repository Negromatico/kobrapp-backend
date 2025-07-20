// users.js - Rutas de usuario
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Perfil del usuario autenticado
router.get('/me', auth, userController.getProfile);
router.get('/profile', auth, userController.getProfile); // compatibilidad Flutter
router.put('/me', auth, userController.updateProfile);

// Solo admin puede listar y bloquear usuarios
const checkRoles = require('../middlewares/roles');

// Endpoint para obtener lista de clientes (para validación en préstamos)
router.get('/clients', auth, userController.getClients);

router.get('/', auth, checkRoles(['admin']), userController.listUsers);
router.put('/block/:id', auth, checkRoles(['admin']), userController.blockUser);

module.exports = router;
