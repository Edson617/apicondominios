const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Obtener el token del header 'Authorization'

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Token de autenticación requerido" });
  }

  try {
    // Verificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_secreto_jwt");
    console.log("Token verificado, usuario autenticado:", decoded);

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Asignar el usuario a la request con toda la información necesaria
    req.user = {
      id: user.id,
      phone: user.phone,
      department: user.department, // Asegurar que el departamento esté disponible
      role: user.role,
    };

    console.log("Usuario con datos completos en req.user:", req.user);
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
