import { useState, useEffect } from 'react';
import API from '../api/axios';

const ESTADOS = ['En Proceso', 'Finalizado', 'Pausado'];
const ESTADO_COLORS = {
  'En Proceso': 'bg-blue-100 text-blue-700',
  'Finalizado': 'bg-green-100 text-green-700',
  'Pausado': 'bg-yellow-100 text-yellow-700',
};

const emptyForm = {
  numero_rollo: '',
  referencia: '',
  nombre_producto: '',
  operario: '',
  maquina: '',
  hora_inicio: '',
  hora_fin: '',
  estado: 'En Proceso',
  cantidad_bolsas: '',
  peso_producido: '',
  desperdicio_kg: '',
  tipo_desperdicio: '',
  peso_rollo_inicial: '',
  peso_rollo_final: '',
  notas: '',
};

export default function Production() {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [refSearch, setRefSearch] = useState('');
  const [refResults, setRefResults] = useState([]);

  useEffect(() => { fetchRecords(); }, [search, filtroEstado]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get('/production', { params: { search, estado: filtroEstado, limit: 50 } });
      setRecords(res.data.records);
    } catch (e) {
      showMsg('Error cargando registros', 'error');
    }
    setLoading(false);
  };

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleNew = () => {
    setForm({
      ...emptyForm,
      hora_inicio: new Date().toISOString().slice(0, 16),
    });
    setSelected(null);
    setShowModal(true);
  };

  const handleEdit = () => {
    if (!selected) return showMsg('Selecciona un registro primero', 'error');
    setForm({
      ...selected,
      hora_inicio: selected.hora_inicio ? new Date(selected.hora_inicio).toISOString().slice(0, 16) : '',
      hora_fin: selected.hora_fin ? new Date(selected.hora_fin).toISOString().slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const searchRefs = async (q) => {
    setRefSearch(q);
    if (q.length < 2) return setRefResults([]);
    try {
      const res = await API.get('/references', { params: { search: q, limit: 8 } });
      setRefResults(res.data.references);
    } catch (e) {}
  };

  const selectRef = (ref) => {
    setForm(prev => ({
      ...prev,
      referencia: ref.referencia,
      nombre_producto: ref.nombre,
    }));
    setRefSearch('');
    setRefResults([]);
  };

  const handleSave = async () => {
    if (!form.numero_rollo) return showMsg('Ingresa el número de rollo', 'error');
    if (!form.operario) return showMsg('Ingresa el nombre del operario', 'error');
    if (!form.hora_inicio) return showMsg('Ingresa la hora de inicio', 'error');
    try {
      if (selected && selected._id) {
        await API.put(`/production/${selected._id}`, form);
        showMsg('✅ Registro actualizado', 'success');
      } else {
        await API.post('/production', form);
        showMsg('✅ Registro creado', 'success');
      }
      setShowModal(false);
      fetchRecords();
    } catch (e) {
      showMsg(e.response?.data?.error || 'Error guardando', 'error');
    }
  };

  const handleFinalizar = async () => {
    if (!selected) return showMsg('Selecciona un registro primero', 'error');
    if (!confirm(`¿Finalizar producción del rollo ${selected.numero_rollo}?`)) return;
    try {
      await API.patch(`/production/${selected._id}/finalizar`, {
        cantidad_bolsas: selected.cantidad_bolsas,
        peso_producido: selected.peso_producido,
        desperdicio_kg: selected.desperdicio_kg,
      });
      showMsg('✅ Producción finalizada', 'success');
      fetchRecords();
      setSelected(null);
    } catch (e) {
      showMsg('Error finalizando', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selected) return showMsg('Selecciona un registro primero', 'error');
    if (!confirm(`¿Eliminar rollo ${selected.numero_rollo}?`)) return;
    await API.delete(`/production/${selected._id}`);
    showMsg('Registro eliminado', 'success');
    setSelected(null);
    fetchRecords();
  };

  const getDuracion = (inicio, fin) => {
    if (!inicio) return '-';
    const start = new Date(inicio);
    const end = fin ? new Date(fin) : new Date();
    const diff = Math.floor((end - start) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* PANEL IZQUIERDO */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="bg-blue-700 text-white px-3 py-2 font-bold text-sm">
          ⚙️ Control de Producción
        </div>
        <div className="p-2 space-y-1">
          <input
            className="w-full border text-xs px-2 py-1 rounded"
            placeholder="Buscar rollo, operario..."
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
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b">Registros</div>
          {loading ? (
            <div className="p-3 text-center text-gray-400">Cargando...</div>
          ) : records.length === 0 ? (
            <div className="p-3 text-center text-gray-400">No hay registros</div>
          ) : records.map(rec => (
            <div
              key={rec._id}
              onClick={() => setSelected(rec)}
              className={`px-2 py-2 cursor-pointer border-b hover:bg-blue-50 ${selected?._id === rec._id ? 'bg-blue-600 text-white' : ''}`}
            >
              <div className="font-bold">Rollo #{rec.numero_rollo}</div>
              <div className="truncate text-xs">{rec.referencia || 'Sin referencia'}</div>
              <div className="flex justify-between mt-0.5">
                <span>{rec.operario}</span>
                <span className={`px-1 rounded text-xs ${selected?._id === rec._id ? 'bg-blue-500' : ESTADO_COLORS[rec.estado]}`}>
                  {rec.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t flex gap-1">
          <button onClick={handleNew} className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded hover:bg-green-700">
            + Nuevo Rollo
          </button>
          <button onClick={handleEdit} className="bg-blue-500 text-white text-xs px-2 py-1.5 rounded hover:bg-blue-600">✏️</button>
          <button onClick={handleDelete} className="bg-red-500 text-white text-xs px-2 py-1.5 rounded hover:bg-red-600">🗑️</button>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-200 px-4 py-2 flex gap-2 border-b items-center">
          <span className="text-sm font-semibold text-gray-600">Detalle de Producción</span>
          {selected && selected.estado !== 'Finalizado' && (
            <button onClick={handleFinalizar} className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700">
              ✅ Finalizar Producción
            </button>
          )}
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
                  <h2 className="text-xl font-bold text-blue-700">Rollo #{selected.numero_rollo}</h2>
                  <p className="text-sm text-gray-500">Operario: {selected.operario}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ESTADO_COLORS[selected.estado]}`}>
                  {selected.estado}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500">Referencia:</span> <span className="font-medium">{selected.referencia || '-'}</span></div>
                <div><span className="text-gray-500">Producto:</span> <span className="font-medium">{selected.nombre_producto || '-'}</span></div>
                <div><span className="text-gray-500">Máquina:</span> <span className="font-medium">{selected.maquina || '-'}</span></div>
                <div><span className="text-gray-500">Hora Inicio:</span> <span className="font-medium">{selected.hora_inicio ? new Date(selected.hora_inicio).toLocaleString() : '-'}</span></div>
                <div><span className="text-gray-500">Hora Fin:</span> <span className="font-medium">{selected.hora_fin ? new Date(selected.hora_fin).toLocaleString() : 'En proceso...'}</span></div>
                <div><span className="text-gray-500">Duración:</span> <span className="font-medium">{getDuracion(selected.hora_inicio, selected.hora_fin)}</span></div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded border p-4">
                <h3 className="font-semibold text-sm text-blue-700 mb-3">📦 Producción</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{Number(selected.cantidad_bolsas).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Bolsas producidas</div>
                  </div>
                  <div className="bg-green-50 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{selected.peso_producido} kg</div>
                    <div className="text-xs text-gray-500">Peso producido</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded border p-4">
                <h3 className="font-semibold text-sm text-red-600 mb-3">🗑️ Desperdicio</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{selected.desperdicio_kg} kg</div>
                    <div className="text-xs text-gray-500">Desperdicio</div>
                  </div>
                  <div className="bg-orange-50 rounded p-3 text-center">
                    <div className="text-sm font-bold text-orange-600">{selected.tipo_desperdicio || '-'}</div>
                    <div className="text-xs text-gray-500">Tipo desperdicio</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded border p-4 col-span-2">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">⚖️ Peso del Rollo</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xl font-bold">{selected.peso_rollo_inicial} kg</div>
                    <div className="text-xs text-gray-500">Peso inicial</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xl font-bold">{selected.peso_rollo_final} kg</div>
                    <div className="text-xs text-gray-500">Peso final</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xl font-bold">{(selected.peso_rollo_inicial - selected.peso_rollo_final).toFixed(2)} kg</div>
                    <div className="text-xs text-gray-500">Diferencia</div>
                  </div>
                </div>
              </div>
            </div>

            {selected.notas && (
              <div className="bg-white rounded border p-3 text-sm">
                <span className="text-gray-500">Notas:</span> {selected.notas}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-3">⚙️</div>
              <div>Selecciona un registro o crea uno nuevo</div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
              <h2 className="font-bold">⚙️ {selected ? 'Editar' : 'Nuevo'} Registro de Producción</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-xl">✕</button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Número de Rollo *</label>
                  <input name="numero_rollo" value={form.numero_rollo} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="Ej: R-001" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Operario *</label>
                  <input name="operario" value={form.operario} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="Nombre del operario" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Máquina</label>
                  <input name="maquina" value={form.maquina} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="Ej: Máquina 1" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Estado</label>
                  <select name="estado" value={form.estado} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5">
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Hora Inicio *</label>
                  <input name="hora_inicio" type="datetime-local" value={form.hora_inicio} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Hora Fin</label>
                  <input name="hora_fin" type="datetime-local" value={form.hora_fin} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" />
                </div>
              </div>

              {/* Buscar referencia */}
              <div>
                <label className="block font-medium mb-1">Referencia (opcional)</label>
                <div className="relative">
                  <input
                    value={refSearch || form.referencia}
                    onChange={e => { setRefSearch(e.target.value); searchRefs(e.target.value); }}
                    className="w-full border rounded px-2 py-1.5"
                    placeholder="Buscar referencia..." />
                  {refResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {refResults.map(ref => (
                        <div key={ref._id} onClick={() => selectRef(ref)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b text-xs">
                          <div className="font-mono font-bold">{ref.referencia}</div>
                          <div className="text-gray-600">{ref.nombre}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Producción */}
              <div className="border rounded p-3 space-y-2">
                <div className="font-semibold text-blue-700">📦 Datos de Producción</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Cantidad de Bolsas</label>
                    <input name="cantidad_bolsas" type="number" value={form.cantidad_bolsas} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Peso Producido (kg)</label>
                    <input name="peso_producido" type="number" value={form.peso_producido} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                </div>
              </div>

              {/* Desperdicio */}
              <div className="border rounded p-3 space-y-2">
                <div className="font-semibold text-red-600">🗑️ Desperdicio</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Desperdicio (kg)</label>
                    <input name="desperdicio_kg" type="number" value={form.desperdicio_kg} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Tipo de Desperdicio</label>
                    <input name="tipo_desperdicio" value={form.tipo_desperdicio} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" placeholder="Ej: Rebaba, Recorte..." />
                  </div>
                </div>
              </div>

              {/* Peso rollo */}
              <div className="border rounded p-3 space-y-2">
                <div className="font-semibold text-gray-700">⚖️ Peso del Rollo</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Peso Inicial (kg)</label>
                    <input name="peso_rollo_inicial" type="number" value={form.peso_rollo_inicial} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Peso Final (kg)</label>
                    <input name="peso_rollo_final" type="number" value={form.peso_rollo_final} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Notas</label>
                <textarea name="notas" value={form.notas} onChange={handleChange}
                  className="w-full border rounded px-2 py-1.5 h-16 resize-none"
                  placeholder="Observaciones..." />
              </div>
            </div>

            <div className="px-4 pb-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}
                className="px-6 py-2 border rounded text-sm hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSave}
                className="px-6 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800">
                {selected ? 'Actualizar' : 'Crear Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}