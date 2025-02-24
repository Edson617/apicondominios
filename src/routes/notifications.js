const express = require('express');
const router = express.Router();
const Notification = require('../models/notification'); // Modelo de notificaciones
const authMiddleware = require('../middleware/auth'); // Middleware de autenticación

// Ruta para obtener notificaciones
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    console.log('Usuario autenticado en middleware:', req.user);


    // Si el usuario es admin, obtiene todas las notificaciones
    if (req.user.role === 'admin') {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      return res.json(notifications);
    }

    const userDepartment = req.user.department;
    if (!userDepartment) {
      return res.status(400).json({ message: 'El usuario no tiene un departamento asignado' });
    }

    console.log('Departamento del usuario:', userDepartment);

    // Buscar solo las notificaciones del departamento del usuario
    const notifications = await Notification.find({ department: userDepartment }).sort({ createdAt: -1 });

    if (!notifications.length) {
      return res.status(404).json({ message: 'No hay notificaciones para este departamento' });
    }

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
    const userDepartment = req.user.department;

    // Validar si se recibió el ID de la notificación
    if (!id) {
      return res.status(400).json({ message: 'El parámetro "id" es obligatorio' });
    }

    // Buscar la notificación
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar si el departamento de la notificación coincide con el del usuario
    if (notification.department !== userDepartment) {
      return res.status(403).json({ message: 'Acceso no permitido a esta notificación' });
    }

    // Marcar la notificación como leída
    notification.isRead = true;
    await notification.save();

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
    const userDepartment = req.user.department;

    // Validar si se recibió el ID de la notificación
    if (!id) {
      return res.status(400).json({ message: 'El parámetro "id" es obligatorio' });
    }

    // Buscar la notificación
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar si el departamento de la notificación coincide con el del usuario
    if (notification.department !== userDepartment) {
      return res.status(403).json({ message: 'Acceso no permitido a esta notificación' });
    }

    // Eliminar la notificación
    await Notification.findByIdAndDelete(id);

    res.json({ message: 'Notificación eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la notificación:', error);
    res.status(500).json({ message: 'Error al eliminar la notificación' });
  }
});

module.exports = router;
