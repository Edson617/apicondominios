const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

    const newUser = new User({ phone, email, password, name, department, role: userRole });
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

    const isMatch = await user.comparePassword(password); // Compara la contraseña encriptada
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, department: user.department, role: user.role },
      "tu_secreto_jwt",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      role: user.role,
      phone: user.phone,
      department: user.department,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
