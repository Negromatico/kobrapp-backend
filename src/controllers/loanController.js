// loanController.js - Controlador de préstamos
const Loan = require('../models/Loan');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createLoan = async (req, res) => {
  try {
    const { cliente, monto, interes, fechaInicio, cuotas, frecuencia } = req.body;
    if (!cliente || !monto || !interes || !fechaInicio || !cuotas || !frecuencia) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    const loan = new Loan({
      prestamista: req.usuario._id,
      cliente,
      monto,
      interes,
      fechaInicio,
      cuotas,
      frecuencia
    });
    await loan.save();
    // Notificar al cliente para que acepte el préstamo
    await Notification.create({
      usuario: cliente,
      tipo: 'alerta',
      mensaje: `Tienes un nuevo préstamo pendiente de aceptar.`,
    });
    res.status(201).json({ mensaje: 'Préstamo creado correctamente.', loan });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listLoans = async (req, res) => {
  try {
    let filter = {};
    if (req.usuario.rol === 'prestamista') {
      filter.prestamista = req.usuario._id;
    } else if (req.usuario.rol === 'cliente') {
      filter.cliente = req.usuario._id;
    }
    const loans = await Loan.find(filter).populate('cliente', 'nombreCompleto correo').populate('prestamista', 'nombreCompleto correo');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('cliente', 'nombreCompleto correo').populate('prestamista', 'nombreCompleto correo');
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    // Solo prestamista o cliente involucrado puede ver
    if (loan.prestamista._id.toString() !== req.usuario._id && loan.cliente._id.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    res.json(loan);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.acceptLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    if (loan.cliente.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: 'El préstamo ya fue aceptado o rechazado.' });
    }
    loan.estado = 'al_dia';
    await loan.save();
    res.json({ mensaje: 'Préstamo aceptado.', loan });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    if (loan.cliente.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: 'El préstamo ya fue aceptado o rechazado.' });
    }
    await loan.deleteOne();
    res.json({ mensaje: 'Préstamo rechazado y eliminado.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const updates = req.body;
    const loan = await Loan.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!loan) return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ mensaje: 'Préstamo no encontrado.' });
    }
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Préstamo eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    let filter = {};
    if (req.usuario.rol === 'prestamista') {
      filter.prestamista = req.usuario._id;
    } else {
      return res.status(403).json({ mensaje: 'Solo los prestamistas pueden acceder a estas estadísticas.' });
    }

    // Obtener todos los préstamos del prestamista
    const loans = await Loan.find(filter)
      .populate('cliente', 'nombreCompleto correo documento')
      .populate('prestamista', 'nombreCompleto correo');

    // Calcular estadísticas
    let totalPrestado = 0;
    let totalRecuperado = 0;
    let gananciaTotal = 0;
    let clientesEnMora = 0;
    let clientesUnicos = new Set();
    let prestamosActivos = [];

    const hoy = new Date();

    for (const loan of loans) {
      totalPrestado += loan.monto;
      clientesUnicos.add(loan.cliente._id.toString());

      // Calcular cuota mensual
      const tasaMensual = loan.interes / 100 / 12;
      const cuotaMensual = loan.monto * (tasaMensual * Math.pow(1 + tasaMensual, loan.cuotas)) / (Math.pow(1 + tasaMensual, loan.cuotas) - 1);
      
      // Calcular pagos realizados (simulado - en un sistema real esto vendría de una tabla de pagos)
      const fechaInicio = new Date(loan.fechaInicio);
      const mesesTranscurridos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24 * 30));
      const cuotasPagadas = Math.min(mesesTranscurridos, loan.cuotas);
      const pagosRealizados = cuotasPagadas * cuotaMensual;
      
      totalRecuperado += pagosRealizados;
      gananciaTotal += Math.max(0, pagosRealizados - loan.monto);

      // Determinar si está en mora (más de 30 días sin pagar)
      const proximoPago = new Date(fechaInicio);
      proximoPago.setMonth(proximoPago.getMonth() + cuotasPagadas + 1);
      const diasVencido = Math.floor((hoy - proximoPago) / (1000 * 60 * 60 * 24));
      const enMora = diasVencido > 30 && cuotasPagadas < loan.cuotas;
      
      if (enMora) {
        clientesEnMora++;
      }

      // Agregar a préstamos activos si no está completamente pagado
      if (cuotasPagadas < loan.cuotas) {
        prestamosActivos.push({
          id: loan._id,
          clienteNombre: loan.cliente.nombreCompleto,
          monto: loan.monto,
          saldoPendiente: (loan.cuotas - cuotasPagadas) * cuotaMensual,
          enMora: enMora,
          proximoPago: proximoPago
        });
      }
    }

    const stats = {
      totalPrestado: Math.round(totalPrestado * 100) / 100,
      totalRecuperado: Math.round(totalRecuperado * 100) / 100,
      gananciaTotal: Math.round(gananciaTotal * 100) / 100,
      clientesEnMora: clientesEnMora,
      totalClientes: clientesUnicos.size,
      comisionPendiente: 0, // Implementar según lógica de comisiones
      prestamosActivos: prestamosActivos
    };

    console.log('Dashboard stats calculated:', stats);
    res.json(stats);
  } catch (err) {
    console.error('Error calculating dashboard stats:', err);
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.getClientDashboardStats = async (req, res) => {
  try {
    let filter = {};
    if (req.usuario.rol === 'cliente') {
      filter.cliente = req.usuario._id;
    } else {
      return res.status(403).json({ mensaje: 'Solo los clientes pueden acceder a estas estadísticas.' });
    }

    // Obtener todos los préstamos del cliente
    const loans = await Loan.find(filter)
      .populate('cliente', 'nombreCompleto correo documento')
      .populate('prestamista', 'nombreCompleto correo telefono');

    if (loans.length === 0) {
      return res.json({
        saldoPendiente: 0,
        proximaCuotaFecha: null,
        proximaCuotaMonto: 0,
        enMora: false,
        totalPrestamos: 0,
        totalPagado: 0,
        prestamista: null,
        historialPagos: []
      });
    }

    // Calcular estadísticas del cliente
    let saldoPendienteTotal = 0;
    let proximaCuotaFecha = null;
    let proximaCuotaMonto = 0;
    let enMora = false;
    let totalPrestamos = 0;
    let totalPagado = 0;
    let prestamista = loans[0].prestamista; // Asumir un prestamista principal
    let historialPagos = [];

    const hoy = new Date();

    for (const loan of loans) {
      totalPrestamos += loan.monto;

      // Calcular cuota mensual
      const tasaMensual = loan.interes / 100 / 12;
      const cuotaMensual = loan.monto * (tasaMensual * Math.pow(1 + tasaMensual, loan.cuotas)) / (Math.pow(1 + tasaMensual, loan.cuotas) - 1);
      
      // Calcular pagos realizados
      const fechaInicio = new Date(loan.fechaInicio);
      const mesesTranscurridos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24 * 30));
      const cuotasPagadas = Math.min(mesesTranscurridos, loan.cuotas);
      const pagosRealizados = cuotasPagadas * cuotaMensual;
      
      totalPagado += pagosRealizados;
      
      // Calcular saldo pendiente
      const saldoPendiente = (loan.cuotas - cuotasPagadas) * cuotaMensual;
      saldoPendienteTotal += saldoPendiente;

      // Determinar próxima cuota
      if (cuotasPagadas < loan.cuotas) {
        const proximoPago = new Date(fechaInicio);
        proximoPago.setMonth(proximoPago.getMonth() + cuotasPagadas + 1);
        
        if (!proximaCuotaFecha || proximoPago < proximaCuotaFecha) {
          proximaCuotaFecha = proximoPago;
          proximaCuotaMonto = cuotaMensual;
        }

        // Verificar si está en mora
        const diasVencido = Math.floor((hoy - proximoPago) / (1000 * 60 * 60 * 24));
        if (diasVencido > 0) {
          enMora = true;
        }
      }

      // Generar historial de pagos simulado
      for (let i = 0; i < cuotasPagadas; i++) {
        const fechaPago = new Date(fechaInicio);
        fechaPago.setMonth(fechaPago.getMonth() + i + 1);
        historialPagos.push({
          fecha: fechaPago,
          valor: Math.round(cuotaMensual * 100) / 100,
          estado: 'pagado'
        });
      }

      // Agregar próximo pago pendiente si existe
      if (cuotasPagadas < loan.cuotas) {
        const proximoPago = new Date(fechaInicio);
        proximoPago.setMonth(proximoPago.getMonth() + cuotasPagadas + 1);
        historialPagos.push({
          fecha: proximoPago,
          valor: Math.round(cuotaMensual * 100) / 100,
          estado: 'pendiente'
        });
      }
    }

    // Ordenar historial por fecha
    historialPagos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const clientStats = {
      saldoPendiente: Math.round(saldoPendienteTotal * 100) / 100,
      proximaCuotaFecha: proximaCuotaFecha,
      proximaCuotaMonto: Math.round(proximaCuotaMonto * 100) / 100,
      enMora: enMora,
      totalPrestamos: Math.round(totalPrestamos * 100) / 100,
      totalPagado: Math.round(totalPagado * 100) / 100,
      prestamista: {
        nombre: prestamista.nombreCompleto,
        correo: prestamista.correo,
        telefono: prestamista.telefono || 'No disponible'
      },
      historialPagos: historialPagos
    };

    console.log('Client dashboard stats calculated:', clientStats);
    res.json(clientStats);
  } catch (err) {
    console.error('Error calculating client dashboard stats:', err);
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
