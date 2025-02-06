const express = require('express');
const router = express.Router();
const Multa = require('../models/multas'); // Ajusta la ruta según tu estructura
const Notification = require('../models/notification'); // Modelo de notificación

// Ruta para insertar multas
router.post('/insertar_multas', async (req, res) => {
  try {
    const { reason, amount, date, user, department } = req.body;

    // Validar que todos los campos estén completos
    if (!reason || !amount || !date || !user || !department) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Crear una nueva multa con los nuevos campos
    const nuevaMulta = new Multa({ reason, amount, date, user, department });
    await nuevaMulta.save();

    // Crear una notificación para el departamento
    const notificationMessage = `Nueva multa registrada: ${reason} - $${amount}`;
    const newNotification = new Notification({
      multaId: nuevaMulta._id,
      department,
      message: notificationMessage,
    });
    await newNotification.save();

    res.status(201).json({ message: 'Multa registrada exitosamente', multa: nuevaMulta });
  } catch (error) {
    console.error('Error al registrar la multa:', error);
    res.status(500).json({ message: 'Error al registrar la multa' });
  }
});

// Ruta para obtener las multas y notificaciones por departamento
router.get('/obtener_multas', async (req, res) => {
  try {
    const { department } = req.query; // El departamento se pasa como query

    if (!department) {
      return res.status(400).json({ message: 'El departamento es obligatorio' });
    }

    // Obtener las multas filtradas por departamento
    const multas = await Multa.find({ department });

    // Formatear las multas antes de enviarlas
    const formattedMultas = multas.map((multa) => ({
      id: multa._id,
      reason: multa.reason,
      amount: multa.amount,
      date: multa.date,
      user: multa.user,
      department: multa.department,
    }));

    // Obtener las notificaciones del departamento
    const notifications = await Notification.find({ department });

    res.json({ multas: formattedMultas, notifications });
  } catch (error) {
    console.error('Error al obtener las multas y notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener las multas y notificaciones' });
  }
});

module.exports = router;
