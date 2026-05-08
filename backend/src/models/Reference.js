const mongoose = require('mongoose');

const ReferenceSchema = new mongoose.Schema({
  // ─── Código de referencia ───────────────────────────
  referencia: { type: String, required: true, unique: true, trim: true },
  referencia_corta: { type: String, trim: true },
  nombre: { type: String, required: true, trim: true },
  grupo: { type: String, default: 'BABL' },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  codigo_barras: { type: String, trim: true },
  impuesto: { type: Number, default: 0 },

  // ─── Clasificación ──────────────────────────────────
  tipo_producto: { type: String, default: 'B-Bolsa' },
  materia_prima: { type: String, default: 'AD-Polietileno Alta Densidad' },
  color: { type: String, default: 'BL-Blanco' },
  troquelado: { type: String, default: '' },

  // ─── Medidas ────────────────────────────────────────
  ancho: { type: Number, default: 0 },
  fuelle_izquierdo: { type: Number, default: 0 },
  fuelle_derecho: { type: Number, default: 0 },
  alto: { type: Number, default: 0 },
  fuelle_superior: { type: Number, default: 0 },
  fuelle_fondo: { type: Number, default: 0 },
  calibre: { type: Number, default: 0 },
  medida: { type: String, default: 'PUL-PULGADAS' },

  // ─── Acabados ───────────────────────────────────────
  impresion: { type: Boolean, default: false },
  colores_impresion: { type: Number, default: 0 },
  tipo_cliente: { type: String, default: '' },
  tipo_impresion: { type: String, default: '' },
  sellado: { type: String, default: 'F-Sellado Fondo' },
  tratado_cara: { type: String, default: '0-Ninguno' },

  // ─── Precios ────────────────────────────────────────
  costo: { type: Number, default: 0 },
  precio_mayorista: { type: Number, default: 0 },
  precio_local: { type: Number, default: 0 },

  // ─── Presentación ───────────────────────────────────
  presentacion: { type: String, default: '' },
  unidad_medida: { type: String, default: 'Unidades' },

  // ─── Descripción ────────────────────────────────────
  descripcion: { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Reference', ReferenceSchema);