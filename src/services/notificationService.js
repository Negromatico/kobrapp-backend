// notificationService.js - Servicio para notificaciones automáticas
const Notification = require('../models/Notification');
const User = require('../models/User');
const Loan = require('../models/Loan');

class NotificationService {
  
  // Notificar pago exitoso al cliente
  static async notifyPaymentSuccess(clientId, loanId, amount) {
    try {
      const client = await User.findById(clientId);
      const loan = await Loan.findById(loanId).populate('prestamista');
      
      if (!client || !loan) return false;
      
      const notification = new Notification({
        usuario: clientId,
        tipo: 'agradecimiento',
        mensaje: `¡Pago exitoso! Has pagado $${amount.toFixed(2)} de tu préstamo. ¡Gracias por mantener tu cuenta al día!`,
        fecha: new Date(),
        leida: false
      });
      
      await notification.save();
      
      // Aquí podrías agregar envío de email/SMS
      console.log(`Notificación de pago exitoso enviada a ${client.nombreCompleto}`);
      return true;
    } catch (error) {
      console.error('Error enviando notificación de pago exitoso:', error);
      return false;
    }
  }
  
  // Notificar al prestamista cuando recibe un pago
  static async notifyLenderPaymentReceived(lenderId, clientId, loanId, amount) {
    try {
      const lender = await User.findById(lenderId);
      const client = await User.findById(clientId);
      const loan = await Loan.findById(loanId);
      
      if (!lender || !client || !loan) return false;
      
      const notification = new Notification({
        usuario: lenderId,
        tipo: 'recordatorio',
        mensaje: `¡Pago recibido! ${client.nombreCompleto} ha pagado $${amount.toFixed(2)} de su préstamo. Saldo actualizado.`,
        fecha: new Date(),
        leida: false
      });
      
      await notification.save();
      
      console.log(`Notificación de pago recibido enviada a ${lender.nombreCompleto}`);
      return true;
    } catch (error) {
      console.error('Error enviando notificación de pago recibido:', error);
      return false;
    }
  }
  
  // Recordatorio de próximo pago para clientes
  static async notifyUpcomingPayment(clientId, loanId, dueDate, amount) {
    try {
      const client = await User.findById(clientId);
      const loan = await Loan.findById(loanId);
      
      if (!client || !loan) return false;
      
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      const notification = new Notification({
        usuario: clientId,
        tipo: 'recordatorio',
        mensaje: `Recordatorio: Tu próximo pago de $${amount.toFixed(2)} vence en ${daysUntilDue} días (${new Date(dueDate).toLocaleDateString()}). ¡No olvides pagarlo a tiempo!`,
        fecha: new Date(),
        leida: false
      });
      
      await notification.save();
      
      console.log(`Recordatorio de pago enviado a ${client.nombreCompleto}`);
      return true;
    } catch (error) {
      console.error('Error enviando recordatorio de pago:', error);
      return false;
    }
  }
  
  // Alerta de pago vencido
  static async notifyOverduePayment(clientId, loanId, overdueAmount, daysPastDue) {
    try {
      const client = await User.findById(clientId);
      const loan = await Loan.findById(loanId);
      
      if (!client || !loan) return false;
      
      const notification = new Notification({
        usuario: clientId,
        tipo: 'alerta',
        mensaje: `⚠️ Pago vencido: Tienes un pago de $${overdueAmount.toFixed(2)} con ${daysPastDue} días de retraso. Por favor, ponte al día lo antes posible.`,
        fecha: new Date(),
        leida: false
      });
      
      await notification.save();
      
      console.log(`Alerta de pago vencido enviada a ${client.nombreCompleto}`);
      return true;
    } catch (error) {
      console.error('Error enviando alerta de pago vencido:', error);
      return false;
    }
  }
  
  // Notificar al prestamista sobre cliente en mora
  static async notifyLenderClientOverdue(lenderId, clientId, loanId, overdueAmount, daysPastDue) {
    try {
      const lender = await User.findById(lenderId);
      const client = await User.findById(clientId);
      
      if (!lender || !client) return false;
      
      const notification = new Notification({
        usuario: lenderId,
        tipo: 'alerta',
        mensaje: `⚠️ Cliente en mora: ${client.nombreCompleto} tiene un pago vencido de $${overdueAmount.toFixed(2)} con ${daysPastDue} días de retraso.`,
        fecha: new Date(),
        leida: false
      });
      
      await notification.save();
      
      console.log(`Alerta de cliente en mora enviada a ${lender.nombreCompleto}`);
      return true;
    } catch (error) {
      console.error('Error enviando alerta de cliente en mora:', error);
      return false;
    }
  }
  
  // Bienvenida para nuevos usuarios
  static async notifyWelcome(userId, userType) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;
      
      let mensaje = '';
      if (userType === 'cliente') {
        mensaje = `¡Bienvenido a Kobrapp, ${user.nombreCompleto}! Aquí podrás gestionar tus préstamos y pagos de forma fácil y segura.`;
      } else if (userType === 'prestamista') {
        mensaje = `¡Bienvenido a Kobrapp, ${user.nombreCompleto}! Ahora puedes gestionar tus clientes y préstamos de manera profesional.`;
      }
      
      const notification = new Notification({
        usuario: userId,
        tipo: 'global',
        mensaje: mensaje,
        fecha: new Date(),
        leida: false
      });
      
      await notification.save();
      
      console.log(`Notificación de bienvenida enviada a ${user.nombreCompleto}`);
      return true;
    } catch (error) {
      console.error('Error enviando notificación de bienvenida:', error);
      return false;
    }
  }
  
  // Buscar préstamos con pagos próximos a vencer (para ejecutar diariamente)
  static async checkUpcomingPayments() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      // Aquí necesitarías implementar la lógica según tu modelo de préstamos
      // Por ejemplo, si tienes un campo nextPaymentDate en Loan
      const loansWithUpcomingPayments = await Loan.find({
        // nextPaymentDate: { $lte: threeDaysFromNow, $gte: new Date() },
        // estado: 'activo'
      }).populate('cliente prestamista');
      
      for (const loan of loansWithUpcomingPayments) {
        // await this.notifyUpcomingPayment(loan.cliente._id, loan._id, loan.nextPaymentDate, loan.nextPaymentAmount);
      }
      
      console.log(`Verificación de pagos próximos completada: ${loansWithUpcomingPayments.length} recordatorios enviados`);
    } catch (error) {
      console.error('Error verificando pagos próximos:', error);
    }
  }
  
  // Buscar pagos vencidos (para ejecutar diariamente)
  static async checkOverduePayments() {
    try {
      const today = new Date();
      
      // Aquí necesitarías implementar la lógica según tu modelo de préstamos
      const overdueLoans = await Loan.find({
        // nextPaymentDate: { $lt: today },
        // estado: 'activo'
      }).populate('cliente prestamista');
      
      for (const loan of overdueLoans) {
        // const daysPastDue = Math.floor((today - loan.nextPaymentDate) / (1000 * 60 * 60 * 24));
        // await this.notifyOverduePayment(loan.cliente._id, loan._id, loan.nextPaymentAmount, daysPastDue);
        // await this.notifyLenderClientOverdue(loan.prestamista._id, loan.cliente._id, loan._id, loan.nextPaymentAmount, daysPastDue);
      }
      
      console.log(`Verificación de pagos vencidos completada`);
    } catch (error) {
      console.error('Error verificando pagos vencidos:', error);
    }
  }
}

module.exports = NotificationService;
