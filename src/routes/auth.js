const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Ruta de registro (la encriptación se realiza en el pre-save del modelo)
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

    // Comparar la contraseña ingresada usando comparePassword (que usa argon2.verify internamente)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { id: user._id, phone: user.phone, department: user.department, role: user.role },
      "tu_secreto_jwt", // Asegúrate de usar tu clave secreta configurada o una variable de entorno
      { expiresIn: "1h" }
    );

    // Si tienes implementado updateTokenHash en el modelo, se puede llamar aquí
    if (typeof user.updateTokenHash === "function") {
      await user.updateTokenHash(token);
    }

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

// Ruta para cambiar la contraseña (solo para el usuario autenticado)
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Ambas contraseñas son requeridas" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña actual usando comparePassword
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual no es correcta" });
    }

    // Asignar la nueva contraseña. Al guardar, el hook pre-save la encriptará automáticamente.
    user.password = newPassword;
    await user.save();

    res.json({ message: "Contraseña cambiada con éxito. Inicia sesión nuevamente." });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ejemplo de ruta que solo los administradores pueden acceder
router.post("/admin-action", authMiddleware, checkRole(["admin"]), async (req, res) => {
  try {
    // Solo los administradores podrán acceder a esta ruta
    res.json({ message: "Acción realizada por un administrador" });
  } catch (error) {
    console.error("Error en la acción del admin:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
