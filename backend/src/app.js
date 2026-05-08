require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/references', require('./routes/references'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PlastiPack API funcionando ✅' });
});
app.use('/api/references', require('./routes/references'));
app.use('/api/orders', require('./routes/orders'));
// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando MongoDB:', err.message);
    process.exit(1);
  });