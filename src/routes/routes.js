// routes.js - Rutas de rutas de cobro
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const routeController = require('../controllers/routeController');

// Crear ruta de cobro
router.post('/', auth, routeController.createRoute);
// Listar rutas del prestamista autenticado
router.get('/', auth, routeController.listRoutes);
// Obtener ruta individual
router.get('/:id', auth, routeController.getRoute);
// Eliminar ruta
router.delete('/:id', auth, routeController.deleteRoute);

module.exports = router;
