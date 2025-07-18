// db.js - Configuración y conexión a MongoDB Atlas
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
