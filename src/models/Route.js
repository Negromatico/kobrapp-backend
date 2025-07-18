// Route.js - Modelo de ruta de cobro para Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RouteSchema = new Schema({
  prestamista: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientes: [{
    cliente: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ubicacion: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    estado: { type: String, enum: ['al_dia', 'en_mora'], default: 'al_dia' }
  }],
  fecha: { type: Date, default: Date.now },
  optimizada: { type: Boolean, default: false }
});

module.exports = mongoose.model('Route', RouteSchema);
