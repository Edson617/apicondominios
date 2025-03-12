const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Ruta de registro (sin cambios)
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
    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
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

    // Usar MD5 para comparar la contraseña
    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
    if (hashedPassword !== user.password) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar un nuevo token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, department: user.department, role: user.role },
      "tu_secreto_jwt", // Usa la clave secreta que has configurado
      { expiresIn: "1h" }
    );

    // Guardar el hash del token en la base de datos
    await user.updateTokenHash(token);

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
    if (!user.comparePassword(oldPassword)) {
      return res.status(400).json({ message: "La contraseña actual no es correcta" });
    }
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
    // Solo administradores podrán acceder aquí
    res.json({ message: "Acción realizada por un administrador" });
  } catch (error) {
    console.error("Error en la acción del admin:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
