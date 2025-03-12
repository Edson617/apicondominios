require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

// Importar rutas
const multas = require("./src/routes/multas.js");
const authRoutes = require("./src/routes/auth.js");
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
app.use(
  cors({
    origin: 'https://condominios-m3p7.vercel.app',  // Permitir solicitudes solo desde este dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Ajusta los métodos que desees permitir
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir cabeceras necesarias para autenticación
  })
);
app.use(express.json());

// Rutas
app.use("/api", multas);
app.use("/api", authRoutes);
app.use("/api", notificationRoutes);

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
