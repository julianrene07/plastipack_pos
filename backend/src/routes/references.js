const express = require('express');
const router = express.Router();
const Reference = require('../models/Reference');

// GET - Listar todas las referencias
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = search
      ? {
          $or: [
            { referencia: { $regex: search, $options: 'i' } },
            { nombre: { $regex: search, $options: 'i' } },
            { referencia_corta: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await Reference.countDocuments(query);
    const references = await Reference.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ references, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener una referencia por ID
router.get('/:id', async (req, res) => {
  try {
    const ref = await Reference.findById(req.params.id);
    if (!ref) return res.status(404).json({ error: 'Referencia no encontrada' });
    res.json(ref);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear referencia
router.post('/', async (req, res) => {
  try {
    const ref = new Reference(req.body);
    await ref.save();
    res.status(201).json(ref);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'La referencia ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar referencia
router.put('/:id', async (req, res) => {
  try {
    const ref = await Reference.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ref) return res.status(404).json({ error: 'Referencia no encontrada' });
    res.json(ref);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Eliminar referencia
router.delete('/:id', async (req, res) => {
  try {
    await Reference.findByIdAndDelete(req.params.id);
    res.json({ message: 'Referencia eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;