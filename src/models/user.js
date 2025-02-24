const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // Número de teléfono único
    email: { type: String, required: true, unique: true }, // Correo electrónico único
    password: { type: String, required: true }, // Contraseña
    name: { type: String, required: true }, // Nombre del usuario
    department: { type: String, required: true }, // Departamento al que pertenece
    role: { type: String, enum: ["admin", "user"], default: "user" }, // Nuevo campo de rol
  },
  {
    timestamps: true, // Se añade automáticamente 'createdAt' y 'updatedAt'
  }
);

// Hashear contraseña antes de guardarla en la base de datos
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  console.log("Contraseña antes de ser cifrada:", this.password); // Imprimir la contraseña original
  this.password = await bcrypt.hash(this.password, 10);
  console.log("Contraseña cifrada:", this.password); // Imprimir la contraseña cifrada
  
  next();
});

// Método para comparar la contraseña proporcionada con la almacenada en la base de datos
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password); // Compara la contraseña con el hash
};

module.exports = mongoose.model("User", UserSchema);
