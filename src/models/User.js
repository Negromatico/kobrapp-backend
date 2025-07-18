// User.js - Modelo de usuario para Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nombreCompleto: { type: String, required: true },
  documento: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, enum: ['prestamista', 'cliente', 'admin'], required: true },
  selfieUrl: { type: String },
  cedulaUrl: { type: String },
  creadoEn: { type: Date, default: Date.now },
  bloqueado: { type: Boolean, default: false },
  appearance: {
    themeColor: { type: String, default: '#1976d2' }, // color principal
    avatarUrl: { type: String }, // imagen de perfil
    layout: { type: String, default: 'default' }, // tipo de layout
  },
});

module.exports = mongoose.model('User', UserSchema);
