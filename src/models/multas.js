const mongoose = require('mongoose');

const MultaSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true }, // Razón de la multa
    amount: { type: Number, required: true }, // Monto de la multa
    date: { type: Date, required: true }, // Fecha de la multa
    user: { type: String, required: true }, // Nuevo campo para el usuario
    department: { type: String, required: true }, // Nuevo campo para el departamento
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

module.exports = mongoose.model('Multa', MultaSchema);
