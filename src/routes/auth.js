const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config(); // Cargar variables de entorno

const router = express.Router();

// Ruta de registro
router.post("/register", async (req, res) => {
  try {
    const { phone, email, password, name, department, role } = req.body;

    if (!phone || !email || !password || !name || !department) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Validar que el rol sea "admin" o "user"
    const validRoles = ["admin", "user"];
    const userRole = validRoles.includes(role) ? role : "user";

    // Hashear la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ phone, email, password: hashedPassword, name, department, role: userRole });
    await newUser.save();

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { phone: newUser.phone, email: newUser.email, department: newUser.department, role: newUser.role },
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
});

// Ruta de login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "El teléfono y la contraseña son obligatorios" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, department: user.department, role: user.role },
      process.env.JWT_SECRET, // Se usa una variable de entorno
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token, role: user.role });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
