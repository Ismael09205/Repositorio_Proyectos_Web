require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Tus rutas base modulares bien estructuradas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Tu perfil responderá en /api/users/profile

module.exports = app;