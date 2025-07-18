// Payment.js - Modelo de pago para Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
  cliente: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  comprobanteUrl: { type: String },
  confirmado: { type: Boolean, default: false },
});

module.exports = mongoose.model('Payment', PaymentSchema);
