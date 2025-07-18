// Commission.js - Modelo de comisión para Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommissionSchema = new Schema({
  prestamista: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  monto: { type: Number, required: true },
  estado: { type: String, enum: ['pagado', 'pendiente'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now },
  comprobanteUrl: { type: String },
});

module.exports = mongoose.model('Commission', CommissionSchema);
