const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header y asegurarse de que sigue el formato "Bearer token"
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario exista en la base de datos
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Agregar la información del usuario a req.user para su uso en las rutas protegidas
    req.user = { id: user._id, role: user.role, department: user.department };

    next(); // Continuar con la siguiente función
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado, inicia sesión nuevamente" });
    }
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = authMiddleware;
