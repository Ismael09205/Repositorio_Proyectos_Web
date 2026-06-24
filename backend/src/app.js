require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const authLogsRoutes = require('./routes/authLogs.routes');
const adminUsersRoutes = require('./routes/adminUsers.routes');
const projectRoutes = require('./routes/project.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

app.use(cors());
app.use(express.json());

//endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/authLogs", authLogsRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;