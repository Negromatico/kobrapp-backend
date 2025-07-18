// server.js - Punto de entrada del backend Kobrapp
const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// Conectar a MongoDB y arrancar el servidor
connectDB().then(() => {
  const os = require('os');
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Kobrapp corriendo en http://0.0.0.0:${PORT}`);
});
});
