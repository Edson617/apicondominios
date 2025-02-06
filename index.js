require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const connectDB = require("./database");

const multas = require("./src/routes/multas.js"); 
const authRoutes = require("./src/routes/auth.js"); 
const notificationRoutes = require("./src/routes/notifications.js"); 


const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json());

// Rutas
app.use("/api", multas);
app.use("/api", authRoutes);
app.use("/api", notificationRoutes);
app.use('/api', authRoutes);  // Asegúrate de que el prefijo '/api' esté presente

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
