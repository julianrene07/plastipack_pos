import { useState, useEffect } from 'react';
import API from '../api/axios';

const ESTADOS = ['Pendiente', 'En Produccion', 'En Entrega', 'Finalizado', 'Cancelado'];

const ESTADO_COLORS = {
  'Pendiente': 'bg-yellow-100 text-yellow-700',
  'En Produccion': 'bg-blue-100 text-blue-700',
  'En Entrega': 'bg-purple-100 text-purple-700',
  'Finalizado': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-red-100 text-red-700',
};

const emptyForm = {
  tipo_cliente: 'Mayorista',
  vendedor: '',
  cliente: '',
  telefono_cliente: '',
  fecha_pactada: '',
  notas: '',
  items: [],
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Para buscar referencias
  const [refSearch, setRefSearch] = useState('');
  const [refResults, setRefResults] = useState([]);
  const [refLoading, setRefLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, [search, filtroEstado]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders', { params: { search, estado: filtroEstado, limit: 50 } });
      setOrders(res.data.orders);
    } catch (e) {
      showMsg('Error cargando pedidos', 'error');
    }
    setLoading(false);
  };

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setSelected(null);
    setRefSearch('');
    setRefResults([]);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Buscar referencias
  const searchRefs = async (q) => {
    setRefSearch(q);
    if (q.length < 2) return setRefResults([]);
    setRefLoading(true);
    try {
      const res = await API.get('/references', { params: { search: q, limit: 10 } });
      setRefResults(res.data.references);
    } catch (e) {}
    setRefLoading(false);
  };

  // Agregar referencia al pedido
  const addItem = (ref) => {
    const precio = form.tipo_cliente === 'Mayorista' ? ref.precio_mayorista : ref.precio_local;
    const exists = form.items.find(i => i.referencia_id === ref._id);
    if (exists) {
      setForm(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.referencia_id === ref._id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario }
            : i
        )
      }));
    } else {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, {
          referencia_id: ref._id,
          referencia: ref.referencia,
          nombre: ref.nombre,
          cantidad: 1,
          precio_unitario: precio,
          subtotal: precio,
        }]
      }));
    }
    setRefSearch('');
    setRefResults([]);
  };

  const updateCantidad = (idx, cantidad) => {
    if (cantidad < 1) return;
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === idx ? { ...item, cantidad, subtotal: cantidad * item.precio_unitario } : item
      )
    }));
  };

  const removeItem = (idx) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const getTotal = () => form.items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleSave = async () => {
    if (!form.vendedor) return showMsg('Ingresa el nombre del vendedor', 'error');
    if (!form.cliente) return showMsg('Ingresa el nombre del cliente', 'error');
    if (!form.fecha_pactada) return showMsg('Selecciona la fecha pactada', 'error');
    if (form.items.length === 0) return showMsg('Agrega al menos una referencia', 'error');
    try {
      const payload = { ...form, total: getTotal() };
      await API.post('/orders', payload);
      showMsg('✅ Pedido creado exitosamente', 'success');
      setShowModal(false);
      fetchOrders();
    } catch (e) {
      showMsg(e.response?.data?.error || 'Error guardando pedido', 'error');
    }
  };

  const handleEstado = async (order, nuevoEstado) => {
    try {
      await API.patch(`/orders/${order._id}/estado`, { estado: nuevoEstado });
      showMsg(`✅ Estado actualizado a: ${nuevoEstado}`, 'success');
      fetchOrders();
      if (selected?._id === order._id) {
        setSelected({ ...order, estado: nuevoEstado });
      }
    } catch (e) {
      showMsg('Error actualizando estado', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selected) return showMsg('Selecciona un pedido primero', 'error');
    if (!confirm(`¿Eliminar pedido ${selected.numero_pedido}?`)) return;
    await API.delete(`/orders/${selected._id}`);
    showMsg('Pedido eliminado', 'success');
    setSelected(null);
    fetchOrders();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* PANEL IZQUIERDO - Lista */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="bg-blue-700 text-white px-3 py-2 font-bold text-sm">
          Gestión de Pedidos
        </div>
        <div className="p-2 space-y-1">
          <input
            className="w-full border text-xs px-2 py-1 rounded"
            placeholder="Buscar pedido, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="w-full border text-xs px-2 py-1 rounded"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b">Pedidos</div>
          {loading ? (
            <div className="p-3 text-center text-gray-400">Cargando...</div>
          ) : orders.length === 0 ? (
            <div className="p-3 text-center text-gray-400">No hay pedidos</div>
          ) : orders.map(order => (
            <div
              key={order._id}
              onClick={() => setSelected(order)}
              className={`px-2 py-2 cursor-pointer border-b hover:bg-blue-50 ${selected?._id === order._id ? 'bg-blue-600 text-white' : ''}`}
            >
              <div className="font-bold">{order.numero_pedido}</div>
              <div className="truncate">{order.cliente}</div>
              <div className="flex justify-between mt-0.5">
                <span>{order.tipo_cliente}</span>
                <span className={`px-1 rounded text-xs ${selected?._id === order._id ? 'bg-blue-500' : ESTADO_COLORS[order.estado]}`}>
                  {order.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t flex gap-1">
          <button onClick={handleNew} className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded hover:bg-green-700">
            + Nuevo Pedido
          </button>
          <button onClick={handleDelete} className="bg-red-500 text-white text-xs px-2 py-1.5 rounded hover:bg-red-600">
            🗑️
          </button>
        </div>
      </div>

      {/* PANEL DERECHO - Detalle */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-200 px-4 py-2 flex gap-2 border-b items-center">
          <span className="text-sm font-semibold text-gray-600">Detalle del Pedido</span>
          {msg.text && (
            <span className={`text-xs px-3 py-1 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg.text}
            </span>
          )}
        </div>

        {selected ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Info principal */}
            <div className="bg-white rounded border p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-bold text-blue-700">{selected.numero_pedido}</h2>
                  <p className="text-sm text-gray-500">
                    Creado: {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ESTADO_COLORS[selected.estado]}`}>
                  {selected.estado}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{selected.cliente}</span></div>
                <div><span className="text-gray-500">Teléfono:</span> <span className="font-medium">{selected.telefono_cliente}</span></div>
                <div><span className="text-gray-500">Vendedor:</span> <span className="font-medium">{selected.vendedor}</span></div>
                <div><span className="text-gray-500">Tipo:</span>
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${selected.tipo_cliente === 'Mayorista' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {selected.tipo_cliente}
                  </span>
                </div>
                <div><span className="text-gray-500">Fecha Pactada:</span> <span className="font-medium">{new Date(selected.fecha_pactada).toLocaleDateString()}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="font-bold text-lg text-green-700">${Number(selected.total).toLocaleString()}</span></div>
              </div>
              {selected.notas && (
                <div className="mt-2 text-sm"><span className="text-gray-500">Notas:</span> {selected.notas}</div>
              )}
            </div>

            {/* Cambiar estado */}
            <div className="bg-white rounded border p-4">
              <h3 className="font-semibold text-sm mb-3">🔄 Cambiar Estado del Pedido</h3>
              <div className="flex gap-2 flex-wrap">
                {ESTADOS.map(estado => (
                  <button
                    key={estado}
                    onClick={() => handleEstado(selected, estado)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border-2 transition-all ${
                      selected.estado === estado
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 hover:border-blue-400 text-gray-600'
                    }`}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>

            {/* Items del pedido */}
            <div className="bg-white rounded border p-4">
              <h3 className="font-semibold text-sm mb-3">📦 Referencias del Pedido</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-2 py-1">Referencia</th>
                    <th className="text-left px-2 py-1">Nombre</th>
                    <th className="text-right px-2 py-1">Cantidad</th>
                    <th className="text-right px-2 py-1">Precio Unit.</th>
                    <th className="text-right px-2 py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1 font-mono">{item.referencia}</td>
                      <td className="px-2 py-1">{item.nombre}</td>
                      <td className="px-2 py-1 text-right">{item.cantidad}</td>
                      <td className="px-2 py-1 text-right">${Number(item.precio_unitario).toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-semibold">${Number(item.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-400">
                    <td colSpan="4" className="px-2 py-2 text-right font-bold">TOTAL:</td>
                    <td className="px-2 py-2 text-right font-bold text-green-700 text-sm">
                      ${Number(selected.total).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-3">📋</div>
              <div>Selecciona un pedido o crea uno nuevo</div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL - Nuevo Pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
              <h2 className="font-bold">Nuevo Pedido</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-xl">✕</button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {/* Tipo de cliente */}
              <div>
                <label className="block font-medium mb-2">Tipo de Cliente *</label>
                <div className="flex gap-3">
                  {['Mayorista', 'Local'].map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => setForm(prev => ({ ...prev, tipo_cliente: tipo }))}
                      className={`px-6 py-2 rounded-lg border-2 font-semibold transition-all ${
                        form.tipo_cliente === tipo
                          ? tipo === 'Mayorista'
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {tipo === 'Mayorista' ? '🏭 Mayorista' : '🏪 Cliente Local'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos básicos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Vendedor *</label>
                  <input name="vendedor" value={form.vendedor} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="Nombre del vendedor" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Cliente *</label>
                  <input name="cliente" value={form.cliente} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Teléfono Cliente</label>
                  <input name="telefono_cliente" value={form.telefono_cliente} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="Teléfono" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Fecha Pactada *</label>
                  <input name="fecha_pactada" type="date" value={form.fecha_pactada} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" />
                </div>
              </div>

              {/* Buscar referencias */}
              <div>
                <label className="block font-medium mb-1">Buscar y Agregar Referencias</label>
                <div className="relative">
                  <input
                    value={refSearch}
                    onChange={e => searchRefs(e.target.value)}
                    className="w-full border rounded px-2 py-1.5"
                    placeholder="Escribe el nombre o código de la referencia..."
                  />
                  {refLoading && (
                    <div className="absolute right-2 top-2 text-gray-400 text-xs">Buscando...</div>
                  )}
                  {refResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {refResults.map(ref => (
                        <div
                          key={ref._id}
                          onClick={() => addItem(ref)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b text-xs"
                        >
                          <div className="font-mono font-bold">{ref.referencia}</div>
                          <div className="text-gray-600">{ref.nombre}</div>
                          <div className="flex gap-3 mt-0.5">
                            <span className="text-blue-600">Mayorista: ${Number(ref.precio_mayorista).toLocaleString()}</span>
                            <span className="text-green-600">Local: ${Number(ref.precio_local).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items agregados */}
              {form.items.length > 0 && (
                <div>
                  <label className="block font-medium mb-1">Referencias Agregadas</label>
                  <table className="w-full text-xs border rounded">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-2 py-1">Referencia</th>
                        <th className="text-left px-2 py-1">Nombre</th>
                        <th className="text-right px-2 py-1">Precio</th>
                        <th className="text-center px-2 py-1">Cantidad</th>
                        <th className="text-right px-2 py-1">Subtotal</th>
                        <th className="px-2 py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-1 font-mono">{item.referencia}</td>
                          <td className="px-2 py-1">{item.nombre}</td>
                          <td className="px-2 py-1 text-right">${Number(item.precio_unitario).toLocaleString()}</td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={e => updateCantidad(idx, parseInt(e.target.value))}
                              className="w-16 border rounded px-1 py-0.5 text-center"
                              min="1"
                            />
                          </td>
                          <td className="px-2 py-1 text-right font-semibold">${Number(item.subtotal).toLocaleString()}</td>
                          <td className="px-2 py-1">
                            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td colSpan="4" className="px-2 py-2 text-right font-bold">TOTAL:</td>
                        <td className="px-2 py-2 text-right font-bold text-green-700">
                          ${getTotal().toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block font-medium mb-1">Notas</label>
                <textarea name="notas" value={form.notas} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 h-16 resize-none"
                  placeholder="Observaciones del pedido..." />
              </div>
            </div>

            <div className="px-4 pb-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}
                className="px-6 py-2 border rounded text-sm hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSave}
                className="px-6 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800">
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}