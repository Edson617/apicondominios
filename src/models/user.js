const mongoose = require("mongoose");
const crypto = require("crypto");

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

// Cifrar la contraseña antes de guardarla utilizando MD5
userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = crypto.createHash("md5").update(this.password).digest("hex");
  }
  next();
});

// Método para comparar contraseñas utilizando MD5
userSchema.methods.comparePassword = function (password) {
  const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
  return hashedPassword === this.password;
};

// Método para actualizar el hash del token
userSchema.methods.updateTokenHash = async function (token) {
  this.tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;
