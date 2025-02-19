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
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api", multas);

app.use("/api", notificationRoutes);

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
