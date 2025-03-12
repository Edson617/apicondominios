const checRole = (requiredRole) => (req, res, next) => {
    console.log(`Verificando rol para el usuario con rol: ${req.user.role}`);
  
    if (req.user.role !== requiredRole) {
      console.log("Acceso denegado. Rol no permitido.");
      return res.status(403).json({ message: "Acceso denegado: Rol insuficiente" });
    }
    
    console.log("Acceso permitido para el rol adecuado.");
    next();
  };
  
  module.exports = checRole;
  