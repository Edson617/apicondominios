const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, default: "user" },
  token: { type: String, default: null },  // Campo para el token JWT
  tokensHash: { type: String, default: null },  // Campo para el hash del token
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Eliminar la encriptación de la contraseña antes de guardarla
userSchema.pre("save", function (next) {
  // Ya no vamos a encriptar la contraseña
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = function (password) {
  // Comparar directamente las contraseñas
  return password === this.password;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
