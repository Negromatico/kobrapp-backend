// Notification.js - Modelo de notificación para Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['recordatorio', 'agradecimiento', 'alerta', 'global'], required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
