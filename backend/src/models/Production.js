const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
  numero_rollo: { type: String, required: true, unique: true },
  referencia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference' },
  referencia: { type: String, default: '' },
  nombre_producto: { type: String, default: '' },
  operario: { type: String, required: true },
  maquina: { type: String, default: '' },
  hora_inicio: { type: Date, required: true },
  hora_fin: { type: Date },
  estado: {
    type: String,
    enum: ['En Proceso', 'Finalizado', 'Pausado'],
    default: 'En Proceso'
  },
  // Producción
  cantidad_bolsas: { type: Number, default: 0 },
  peso_producido: { type: Number, default: 0 },
  // Desperdicio
  desperdicio_kg: { type: Number, default: 0 },
  tipo_desperdicio: { type: String, default: '' },
  // Rollo
  peso_rollo_inicial: { type: Number, default: 0 },
  peso_rollo_final: { type: Number, default: 0 },
  notas: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Production', ProductionSchema);