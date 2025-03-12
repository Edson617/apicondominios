const crypto = require("crypto");
const User = require("../models/user");

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // Obtener el ID del usuario desde el token

  try {
    // Buscar al usuario en la base de datos
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña actual (oldPassword) con la almacenada en la base de datos
    const hashedOldPassword = crypto
      .createHash("sha256")
      .update(oldPassword)
      .digest("hex");

    if (hashedOldPassword !== user.password) {
      return res.status(400).json({ message: "La contraseña actual no es correcta" });
    }

    // Si la contraseña actual es correcta, proceder a cambiarla
    const hashedNewPassword = crypto
      .createHash("sha256")
      .update(newPassword)
      .digest("hex");

    user.password = hashedNewPassword; // Actualizamos la contraseña en la base de datos

    // Guardar el nuevo password en la base de datos
    await user.save();

    return res.status(200).json({ message: "Contraseña cambiada exitosamente" });

  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
};

module.exports = { changePassword };
