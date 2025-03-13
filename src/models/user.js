const mongoose = require("mongoose");
const argon2 = require("argon2");  // Importamos argon2

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

// Encriptar la contraseña antes de guardarla
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {  // Solo encriptar si la contraseña ha cambiado
    try {
      const hashedPassword = await argon2.hash(this.password);  // Hashing de la contraseña
      this.password = hashedPassword;  // Guardamos la contraseña hasheada
      next();
    } catch (err) {
      next(err);  // En caso de error, pasamos el error a next
    }
  } else {
    next();
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await argon2.verify(this.password, password);  // Comparar la contraseña
    return isMatch;
  } catch (err) {
    throw new Error("Error al comparar las contraseñas");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
