// payments.js - Rutas de pagos
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const paymentController = require('../controllers/paymentController');

// Registrar pago
router.post('/', auth, paymentController.registerPayment);
// Ver pagos de un préstamo
router.get('/loan/:loanId', auth, paymentController.listPaymentsByLoan);
// Ver pagos hechos por el usuario autenticado
router.get('/my', auth, paymentController.listPaymentsByUser);

module.exports = router;
