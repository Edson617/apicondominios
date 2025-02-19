const express = require('express');
const router = express.Router();
const Notification = require('../models/notification'); // Modelo de notificaciones
const authMiddleware = require('../middleware/auth'); 

/// Ruta para obtener notificaciones por departamento
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userDepartment = req.user.department; // Se obtiene del token de autenticación

    if (!userDepartment) {
      return res.status(400).json({ message: 'El usuario no tiene un departamento asignado' });
    }

    console.log('Departamento del usuario:', userDepartment);

    // Buscar las notificaciones relacionadas con el departamento del usuario
    const notifications = await Notification.find({ department: userDepartment }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener las notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener las notificaciones' });
  }
});
// Ruta para marcar una notificación como leída
router.put('/notificaciones/:id/marcar_leida', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar si se recibió el ID de la notificación
    if (!id) {
      return res.status(400).json({ message: 'El parámetro "id" es obligatorio' });
    }

    // Buscar la notificación y marcarla como leída
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true } // Retorna el documento actualizado
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación marcada como leída', notification });
  } catch (error) {
    console.error('Error al marcar la notificación como leída:', error);
    res.status(500).json({ message: 'Error al actualizar la notificación' });
  }
});

// Ruta para crear una notificación cuando se inserta una multa
router.post('/notificaciones/crear', authMiddleware, async (req, res) => {
  try {
    const { multaId, department, message } = req.body;

    // Validar los datos necesarios
    if (!multaId || !department || !message) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Crear una nueva notificación
    const newNotification = new Notification({ multaId, department, message });
    await newNotification.save();

    res.status(201).json({ message: 'Notificación creada exitosamente', notification: newNotification });
  } catch (error) {
    console.error('Error al crear la notificación:', error);
    res.status(500).json({ message: 'Error al crear la notificación' });
  }
});

// Ruta para eliminar una notificación por su ID
router.delete('/notificaciones/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar si se recibió el ID de la notificación
    if (!id) {
      return res.status(400).json({ message: 'El parámetro "id" es obligatorio' });
    }

    // Buscar y eliminar la notificación
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la notificación:', error);
    res.status(500).json({ message: 'Error al eliminar la notificación' });
  }
});

module.exports = router;
