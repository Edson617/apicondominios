const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Importar modelo de usuario

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Extraer token del header

    if (!token) {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }

    const decoded = jwt.verify(token, "tu_secreto_jwt"); // Verifica el token
    req.user = await User.findById(decoded.id).select("-password"); // Obtener usuario autenticado

    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = authMiddleware;
