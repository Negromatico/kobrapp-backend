// loans.js - Rutas de préstamos
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const loanController = require('../controllers/loanController');

// Todas las rutas protegidas
router.get('/dashboard-stats', auth, loanController.getDashboardStats);
router.get('/client-dashboard-stats', auth, loanController.getClientDashboardStats);
router.post('/', auth, loanController.createLoan);
router.get('/', auth, loanController.listLoans);
router.get('/:id', auth, loanController.getLoan);
router.put('/:id', auth, loanController.updateLoan);
router.put('/:id/accept', auth, loanController.acceptLoan);
router.put('/:id/reject', auth, loanController.rejectLoan);
router.delete('/:id', auth, loanController.deleteLoan);

module.exports = router;
