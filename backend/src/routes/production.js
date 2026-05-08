const express = require('express');
const router = express.Router();
const Production = require('../models/Production');

// GET - Listar registros
router.get('/', async (req, res) => {
  try {
    const { search, estado, page = 1, limit = 20 } = req.query;
    const query = {};
    if (estado) query.estado = estado;
    if (search) {
      query.$or = [
        { numero_rollo: { $regex: search, $options: 'i' } },
        { operario: { $regex: search, $options: 'i' } },
        { referencia: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Production.countDocuments(query);
    const records = await Production.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.json({ records, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener un registro
router.get('/:id', async (req, res) => {
  try {
    const record = await Production.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear registro
router.post('/', async (req, res) => {
  try {
    const record = new Production(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'El número de rollo ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar registro
router.put('/:id', async (req, res) => {
  try {
    const record = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Finalizar producción
router.patch('/:id/finalizar', async (req, res) => {
  try {
    const record = await Production.findByIdAndUpdate(
      req.params.id,
      { ...req.body, estado: 'Finalizado', hora_fin: new Date() },
      { new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Production.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;