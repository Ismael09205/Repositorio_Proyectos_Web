require('dotenv').config(); 
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});


process.on('SIGINT', () => {
  server.close(() => {
    console.log('Servidor apagado manualmente');
    process.exit(0);
  });
});