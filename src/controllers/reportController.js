// reportController.js - Controlador de reportes y estadísticas
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

exports.generalStats = async (req, res) => {
  try {
    const totalPrestado = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);
    const totalRecuperado = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);
    const totalMora = await Loan.countDocuments({ estado: 'en_mora' });
    const prestamosActivos = await Loan.countDocuments({ estado: { $in: ['al_dia', 'en_mora'] } });
    const prestamosPagados = await Loan.countDocuments({ estado: 'pagado' });
    res.json({
      totalPrestado: totalPrestado[0]?.total || 0,
      totalRecuperado: totalRecuperado[0]?.total || 0,
      totalMora,
      prestamosActivos,
      prestamosPagados
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Ganancias mensuales por prestamista (usuario autenticado)
exports.monthlyEarnings = async (req, res) => {
  try {
    const pagos = await Payment.aggregate([
      // Join con Loan para filtrar por prestamista
      {
        $lookup: {
          from: 'loans',
          localField: 'loan',
          foreignField: '_id',
          as: 'loanInfo'
        }
      },
      { $unwind: '$loanInfo' },
      { $match: { 'loanInfo.prestamista': req.usuario._id } },
      {
        $group: {
          _id: { mes: { $month: '$fecha' }, anio: { $year: '$fecha' } },
          total: { $sum: '$monto' }
        }
      },
      { $sort: { '_id.anio': 1, '_id.mes': 1 } }
    ]);
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Ganancias del día actual por prestamista (usuario autenticado)
exports.dailyEarnings = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const pagos = await Payment.aggregate([
      {
        $lookup: {
          from: 'loans',
          localField: 'loan',
          foreignField: '_id',
          as: 'loanInfo'
        }
      },
      { $unwind: '$loanInfo' },
      { $match: {
          'loanInfo.prestamista': req.usuario._id,
          fecha: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' }
        }
      }
    ]);
    res.json({ total: pagos[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

// Placeholder para exportar a Excel/PDF (lógica a integrar luego)
exports.exportReport = async (req, res) => {
  try {
    // Aquí se integrará librería como exceljs o pdfkit
    res.json({ mensaje: 'Funcionalidad de exportación lista para conectar.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
