require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./database");
const authRoutes = require("./src/routes/auth.js");
const multasRoutes = require("./src/routes/multas.js");
const notificationRoutes = require("./src/routes/notifications.js");

const app = express();

// Conectar a MongoDB Atlas
connectDB()
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((error) => {
    console.error("❌ Error al conectar a MongoDB Atlas:", error);
    process.exit(1); // Detener el servidor si no se conecta a la base de datos
  });

// Configuración de CORS para permitir solicitudes desde localhost y el dominio de producción
const allowedOrigins = [
  'https://condominios-j9k1.vercel.app',  // Dominio de producción
  'http://localhost:4000'                 // Dominio de desarrollo (localhost)
];

// Middleware CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Rutas públicas (No requieren autenticación)
app.use("/api", authRoutes); // Ruta pública de autenticación

// Rutas protegidas (Requieren autenticación)
app.use("/api/multas", multasRoutes); // Ruta de multas
app.use("/api/notifications", notificationRoutes); // Ruta de notificaciones

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
