require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./database");
const authMiddleware = require("./src/middleware/auth"); // Importar middleware de autenticación
const allowedOrigins = ['https://condominios-j9k1.vercel.app'];
// Importar rutas
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

// Middleware
app.use(cors());

app.use(express.json());

// Rutas públicas (No requieren autenticación)
app.use("/api/auth", authRoutes);

// Rutas protegidas (Requieren autenticación)
app.use("/api/multas", authMiddleware, multasRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.use((req, res, next) => {
   const origin = req.headers.origin;
   if (allowedOrigins.includes(origin)) {
        next();
    } else {
        res.status(403).json({ error: 'Acceso no permitido' });
    }
 });

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
