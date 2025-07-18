// app.js - Configuración principal de Express
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rutas principales
app.use('/api', require('./routes'));

// Ruta base
app.get('/', (req, res) => {
  res.send('Kobrapp Backend API');
});

// Middleware global de errores (debe ir al final)
app.use(require('./middlewares/errorHandler'));

module.exports = app;
