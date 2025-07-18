// routeController.js - Controlador de rutas de cobro
const Route = require('../models/Route');
const User = require('../models/User');

exports.createRoute = async (req, res) => {
  try {
    const { clientes, optimizada } = req.body;
    if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({ mensaje: 'Debes proporcionar al menos un cliente.' });
    }
    const route = new Route({
      prestamista: req.usuario._id,
      clientes,
      optimizada: !!optimizada
    });
    await route.save();
    res.status(201).json({ mensaje: 'Ruta de cobro creada.', route });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.listRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ prestamista: req.usuario._id }).populate('clientes.cliente', 'nombreCompleto correo');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findById(id).populate('clientes.cliente', 'nombreCompleto correo');
    if (!route) return res.status(404).json({ mensaje: 'Ruta no encontrada.' });
    if (route.prestamista.toString() !== req.usuario._id) {
      return res.status(403).json({ mensaje: 'No autorizado.' });
    }
    res.json(route);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findByIdAndDelete(id);
    if (!route) return res.status(404).json({ mensaje: 'Ruta no encontrada.' });
    res.json({ mensaje: 'Ruta eliminada.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor.', error: err.message });
  }
};
