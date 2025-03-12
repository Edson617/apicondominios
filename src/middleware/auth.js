const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Obtener el token del header 'Authorization'

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Token de autenticación requerido" });
  }

  try {
    const decoded = jwt.verify(token, "tu_secreto_jwt"); // Usar la misma clave secreta que usas para firmar el JWT
    console.log("Token verificado, usuario autenticado:", decoded);

    // Buscar el usuario por el ID del token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el hash del token coincida con el almacenado en la base de datos
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (tokenHash !== user.tokensHash) {
      return res.status(401).json({ message: "Token inválido o ha sido revocado" });
    }

    req.user = decoded; // Agregar los datos del usuario al objeto request
    next(); // Continuar con la ejecución del siguiente middleware o ruta
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
