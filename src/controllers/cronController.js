// cronController.js - Controlador para tareas programadas
const NotificationService = require('../services/notificationService');

// Ejecutar verificaciones diarias de notificaciones
exports.runDailyNotifications = async (req, res) => {
  try {
    console.log('Iniciando verificaciones diarias de notificaciones...');
    
    // Verificar pagos próximos a vencer
    await NotificationService.checkUpcomingPayments();
    
    // Verificar pagos vencidos
    await NotificationService.checkOverduePayments();
    
    console.log('Verificaciones diarias completadas exitosamente');
    
    if (res) {
      res.json({ 
        mensaje: 'Verificaciones diarias ejecutadas correctamente',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error ejecutando verificaciones diarias:', error);
    
    if (res) {
      res.status(500).json({ 
        mensaje: 'Error ejecutando verificaciones diarias', 
        error: error.message 
      });
    }
  }
};

// Ejecutar verificación manual de notificaciones (para testing)
exports.runManualNotificationCheck = async (req, res) => {
  try {
    const { type } = req.query; // 'upcoming' o 'overdue'
    
    if (type === 'upcoming') {
      await NotificationService.checkUpcomingPayments();
      res.json({ mensaje: 'Verificación de pagos próximos ejecutada' });
    } else if (type === 'overdue') {
      await NotificationService.checkOverduePayments();
      res.json({ mensaje: 'Verificación de pagos vencidos ejecutada' });
    } else {
      // Ejecutar ambas
      await NotificationService.checkUpcomingPayments();
      await NotificationService.checkOverduePayments();
      res.json({ mensaje: 'Todas las verificaciones ejecutadas' });
    }
  } catch (error) {
    console.error('Error en verificación manual:', error);
    res.status(500).json({ mensaje: 'Error en verificación manual', error: error.message });
  }
};
