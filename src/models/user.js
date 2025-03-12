const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Otros campos que puedas necesitar (por ejemplo, nombre, fecha de creación, etc.)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cifrar la contraseña antes de guardarla
userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = crypto.createHash("sha256").update(this.password).digest("hex");
  }
  next();
});

// Comparar la contraseña proporcionada con la almacenada
userSchema.methods.comparePassword = function (password) {
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  return hashedPassword === this.password;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
