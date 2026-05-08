require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json());
app.use('/api/references', require('./routes/references'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/production', require('./routes/production'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PlastiPack API funcionando ✅' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });