const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    multaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Multa', required: true }, // Referencia a la multa
    department: { type: String, required: true }, // Departamento ligado a la multa
    message: { type: String, required: true }, // Mensaje de notificación
    isRead: { type: Boolean, default: false }, // Indica si la notificación ha sido leída
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
