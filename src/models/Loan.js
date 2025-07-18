// Loan.js - Modelo de préstamo para Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoanSchema = new Schema({
  prestamista: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cliente: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  monto: { type: Number, required: true },
  interes: { type: Number, required: true }, // porcentaje
  fechaInicio: { type: Date, required: true },
  cuotas: { type: Number, required: true },
  frecuencia: { type: String, enum: ['diaria', 'semanal', 'mensual'], required: true },
  cuotasPagadas: { type: Number, default: 0 },
  estado: { type: String, enum: ['pendiente', 'al_dia', 'en_mora', 'pagado'], default: 'pendiente' },
  creadoEn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Loan', LoanSchema);
