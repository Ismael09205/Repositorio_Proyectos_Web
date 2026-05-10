require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabaseAdmin } = require('./supabaseClients');
const verificarSupabaseToken = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ mensaje: 'API Supabase funcionando' }));

app.get('/api/perfil', verificarSupabaseToken, (req, res) => {
  res.json({ id: req.usuario.id, email: req.usuario.email });
});

app.listen(PORT, () => console.log(`API Supabase en http://localhost:${PORT}`));
