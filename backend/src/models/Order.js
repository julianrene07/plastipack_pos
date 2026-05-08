const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  referencia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference', required: true },
  referencia: { type: String, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precio_unitario: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  numero_pedido: { type: String, unique: true },
  tipo_cliente: { type: String, enum: ['Mayorista', 'Local'], required: true },
  vendedor: { type: String, required: true },
  cliente: { type: String, required: true },
  telefono_cliente: { type: String, default: '' },
  fecha_pedido: { type: Date, default: Date.now },
  fecha_pactada: { type: Date, required: true },
  estado: {
    type: String,
    enum: ['Pendiente', 'En Produccion', 'En Entrega', 'Finalizado', 'Cancelado'],
    default: 'Pendiente'
  },
  items: [OrderItemSchema],
  total: { type: Number, default: 0 },
  notas: { type: String, default: '' },
}, { timestamps: true });

// Auto-generar número de pedido
OrderSchema.pre('save', async function (next) {
  if (!this.numero_pedido) {
    const count = await mongoose.model('Order').countDocuments();
    this.numero_pedido = `PED-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);