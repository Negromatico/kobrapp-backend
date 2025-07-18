// auth.js - Rutas de autenticación (registro y login)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombreCompleto, documento, correo, contrasena, rol } = req.body;
    // Validación básica
    if (!nombreCompleto || !documento || !correo || !contrasena || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    // Verificar si ya existe el usuario
    let user = await User.findOne({ correo });
    if (user) return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);
    // Crear usuario
    user = new User({ nombreCompleto, documento, correo, contrasena: hashedPassword, rol });
    await user.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const user = await User.findOne({ correo });
    if (!user) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });
    // Verificar contraseña
    const validPass = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPass) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });
    // Generar JWT
    const token = jwt.sign({ _id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, usuario: { _id: user._id, nombreCompleto: user.nombreCompleto, correo: user.correo, rol: user.rol } });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
});

// Recuperar contraseña (envío de instrucciones por email)
const nodemailer = require('nodemailer');
router.post('/forgot-password', async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
    }
    const user = await User.findOne({ correo });
    if (!user) {
      // Por seguridad, responde igual aunque el usuario no exista
      return res.json({ mensaje: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' });
    }

    // Configura el transportador de Nodemailer (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: correo,
      subject: 'Recuperación de contraseña',
      text: 'Haz clic en el siguiente enlace para restablecer tu contraseña: https://tuapp.com/reset-password'
    };

    await transporter.sendMail(mailOptions);

    return res.json({ mensaje: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
});

module.exports = router;
