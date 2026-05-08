import { useState, useEffect } from 'react';
import API from '../api/axios';

const TIPOS_PRODUCTO = ['B-Bolsa', 'R-Rollo', 'L-Lamina', 'M-Manga', 'T-Tubo'];
const MATERIAS_PRIMAS = ['AD-Polietileno Alta Densidad', 'BD-Polietileno Baja Densidad', 'PP-Polipropileno', 'PVC-Policloruro de Vinilo'];
const COLORES = ['BL-Blanco', 'TR-Transparente', 'NG-Negro', 'RJ-Rojo', 'AZ-Azul', 'VD-Verde', 'AM-Amarillo'];
const TROQUELADOS = ['', 'FR-Franela', 'CA-Camiseta', 'PU-Punzonado'];
const SELLADOS = ['F-Sellado Fondo', 'L-Sellado Lateral', 'D-Doble Sellado', 'S-Sin Sellado'];
const TRATADOS = ['0-Ninguno', 'C-Corona', 'S-Solvente'];
const MEDIDAS = ['PUL-PULGADAS', 'CM-CENTIMETROS', 'MM-MILIMETROS'];

const emptyForm = {
  referencia: '', referencia_corta: '', nombre: '', grupo: 'BABL',
  estado: 'Activo', codigo_barras: '', impuesto: 0,
  tipo_producto: 'B-Bolsa', materia_prima: 'AD-Polietileno Alta Densidad',
  color: 'BL-Blanco', troquelado: '',
  ancho: '', fuelle_izquierdo: '', fuelle_derecho: '',
  alto: '', fuelle_superior: '', fuelle_fondo: '',
  calibre: '', medida: 'PUL-PULGADAS',
  impresion: false, colores_impresion: 0, tipo_cliente: '', tipo_impresion: '',
  sellado: 'F-Sellado Fondo', tratado_cara: '0-Ninguno',
  costo: '', precio_mayorista: '', precio_local: '',
  presentacion: '', unidad_medida: 'Unidades', descripcion: '',
};

export default function References() {
  const [references, setReferences] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { fetchReferences(); }, [search, page]);

  const fetchReferences = async () => {
    setLoading(true);
    try {
      const res = await API.get('/references', { params: { search, page, limit: 50 } });
      setReferences(res.data.references);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      showMsg('Error cargando referencias', 'error');
    }
    setLoading(false);
  };

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleSelect = (ref) => {
    setSelected(ref);
    setForm(ref);
  };

  const handleNew = () => {
    setSelected(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = () => {
    if (!selected) return showMsg('Selecciona una referencia primero', 'error');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const generateDesc = (f) => {
    return `Bolsa ${f.materia_prima} ${f.color} ${f.troquelado} Ancho ${f.ancho} Fuelle Izquierdo ${f.fuelle_izquierdo} Fuelle Derecho ${f.fuelle_derecho} Alto ${f.alto} Calibre ${f.calibre} ${f.medida} ${f.sellado}`.trim();
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, descripcion: generateDesc(form) };
      if (selected && selected._id) {
        await API.put(`/references/${selected._id}`, payload);
        showMsg('✅ Referencia actualizada', 'success');
      } else {
        await API.post('/references', payload);
        showMsg('✅ Referencia creada', 'success');
      }
      setShowModal(false);
      fetchReferences();
    } catch (e) {
      showMsg(e.response?.data?.error || 'Error guardando', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selected) return showMsg('Selecciona una referencia primero', 'error');
    if (!confirm(`¿Eliminar ${selected.referencia}?`)) return;
    await API.delete(`/references/${selected._id}`);
    showMsg('Referencia eliminada', 'success');
    setSelected(null);
    fetchReferences();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* PANEL IZQUIERDO */}
      <div className="w-72 bg-white border-r border-gray-300 flex flex-col">
        <div className="bg-blue-700 text-white px-3 py-2 font-bold text-sm">
          Elementos de Inventario
        </div>
        <div className="p-2">
          <select className="w-full border text-xs px-2 py-1 rounded mb-2">
            <option>{'<Inventario>'}</option>
          </select>
          <input
            className="w-full border text-xs px-2 py-1 rounded"
            placeholder="Buscar referencia..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b">Elemento</div>
          {loading ? (
            <div className="p-3 text-center text-gray-400">Cargando...</div>
          ) : references.map(ref => (
            <div
              key={ref._id}
              onClick={() => handleSelect(ref)}
              className={`px-2 py-1 cursor-pointer border-b hover:bg-blue-50 truncate ${selected?._id === ref._id ? 'bg-blue-600 text-white' : ''}`}
            >
              {ref.referencia}
            </div>
          ))}
        </div>
        <div className="flex gap-1 p-2 border-t">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded disabled:opacity-40">◀</button>
          <span className="text-xs self-center">{page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded disabled:opacity-40">▶</button>
        </div>
      </div>

      {/* PANEL CENTRAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-200 px-4 py-2 flex gap-2 border-b">
          <button onClick={handleNew} className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700">+ Nuevo</button>
          <button onClick={handleEdit} className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700">✏️ Editar</button>
          <button onClick={handleDelete} className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">🗑️ Eliminar</button>
          {msg.text && (
            <span className={`text-xs self-center px-3 py-1 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg.text}
            </span>
          )}
        </div>

        {selected ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white border rounded p-4 mb-3">
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <label className="text-gray-500">Referencia</label>
                  <div className="font-mono font-bold text-sm">{selected.referencia}</div>
                </div>
                <div>
                  <label className="text-gray-500">Nombre</label>
                  <div className="font-semibold">{selected.nombre}</div>
                </div>
                <div>
                  <label className="text-gray-500">Referencia Corta</label>
                  <div>{selected.referencia_corta}</div>
                </div>
                <div>
                  <label className="text-gray-500">Grupo</label>
                  <div>{selected.grupo}</div>
                </div>
                <div>
                  <label className="text-gray-500">Código Barras</label>
                  <div>{selected.codigo_barras}</div>
                </div>
                <div>
                  <label className="text-gray-500">Estado</label>
                  <span className={`px-2 py-0.5 rounded text-xs ${selected.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selected.estado}
                  </span>
                </div>
              </div>
              <div className="border-t pt-2">
                <label className="text-xs text-gray-500">Descripción</label>
                <p className="text-xs mt-1">{selected.descripcion}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border rounded p-3 text-xs">
                <div className="font-semibold text-blue-700 mb-2">📐 Especificaciones</div>
                <div className="grid grid-cols-2 gap-1">
                  {[['Tipo Producto', selected.tipo_producto], ['Materia Prima', selected.materia_prima],
                    ['Color', selected.color], ['Sellado', selected.sellado],
                    ['Medida', selected.medida], ['Calibre', selected.calibre]].map(([k, v]) => (
                    <div key={k}><span className="text-gray-500">{k}:</span> <span className="font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded p-3 text-xs">
                <div className="font-semibold text-blue-700 mb-2">📏 Medidas</div>
                <div className="grid grid-cols-2 gap-1">
                  {[['Ancho', selected.ancho], ['Alto', selected.alto],
                    ['Fuelle Izq', selected.fuelle_izquierdo], ['Fuelle Der', selected.fuelle_derecho],
                    ['Fuelle Sup', selected.fuelle_superior], ['Fuelle Fondo', selected.fuelle_fondo]].map(([k, v]) => (
                    <div key={k}><span className="text-gray-500">{k}:</span> <span className="font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded p-3 text-xs col-span-2">
                <div className="font-semibold text-blue-700 mb-2">💰 Precios</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="text-gray-500">Costo</div>
                    <div className="font-bold text-lg">${Number(selected.costo).toFixed(2)}</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2 text-center">
                    <div className="text-blue-600">Precio Mayorista</div>
                    <div className="font-bold text-lg text-blue-700">${Number(selected.precio_mayorista).toFixed(2)}</div>
                  </div>
                  <div className="bg-green-50 rounded p-2 text-center">
                    <div className="text-green-600">Precio Local</div>
                    <div className="font-bold text-lg text-green-700">${Number(selected.precio_local).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-3">📦</div>
              <div>Selecciona una referencia o crea una nueva</div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
              <h2 className="font-bold">Referencia - {selected ? 'Editar' : 'Nueva'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-xl">✕</button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-xs">
              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Referencia *</label>
                  <input name="referencia" value={form.referencia} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5 font-mono" placeholder="BADBLFRA010..." />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Referencia Corta</label>
                  <input name="referencia_corta" value={form.referencia_corta} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Nombre *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5" placeholder="10 KG BANCA NUEVA..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Grupo</label>
                    <input name="grupo" value={form.grupo} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Código Barras</label>
                    <input name="codigo_barras" value={form.codigo_barras} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Costo</label>
                    <input name="costo" type="number" value={form.costo} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Impuesto %</label>
                    <input name="impuesto" type="number" value={form.impuesto} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">💰 Precio Mayorista</label>
                    <input name="precio_mayorista" type="number" value={form.precio_mayorista} onChange={handleChange}
                      className="w-full border-2 border-blue-400 rounded px-2 py-1.5 bg-blue-50" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">💰 Precio Local</label>
                    <input name="precio_local" type="number" value={form.precio_local} onChange={handleChange}
                      className="w-full border-2 border-green-400 rounded px-2 py-1.5 bg-green-50" />
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Tipo de Producto</label>
                  <select name="tipo_producto" value={form.tipo_producto} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5">
                    {TIPOS_PRODUCTO.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Materia Prima</label>
                  <select name="materia_prima" value={form.materia_prima} onChange={handleChange}
                    className="w-full border rounded px-2 py-1.5">
                    {MATERIAS_PRIMAS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Color</label>
                    <select name="color" value={form.color} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5">
                      {COLORES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Troquelado</label>
                    <select name="troquelado" value={form.troquelado} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5">
                      {TROQUELADOS.map(t => <option key={t} value={t}>{t || '(ninguno)'}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Ancho</label>
                    <input name="ancho" type="number" value={form.ancho} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Alto</label>
                    <input name="alto" type="number" value={form.alto} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Calibre</label>
                    <input name="calibre" type="number" value={form.calibre} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Fuelle Izquierdo</label>
                    <input name="fuelle_izquierdo" type="number" value={form.fuelle_izquierdo} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Fuelle Derecho</label>
                    <input name="fuelle_derecho" type="number" value={form.fuelle_derecho} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Fuelle Superior</label>
                    <input name="fuelle_superior" type="number" value={form.fuelle_superior} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Fuelle Fondo</label>
                    <input name="fuelle_fondo" type="number" value={form.fuelle_fondo} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Sellado</label>
                    <select name="sellado" value={form.sellado} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5">
                      {SELLADOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Tratado Cara</label>
                    <select name="tratado_cara" value={form.tratado_cara} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5">
                      {TRATADOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Medida</label>
                    <select name="medida" value={form.medida} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5">
                      {MEDIDAS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange}
                      className="w-full border rounded px-2 py-1.5">
                      <option>Activo</option>
                      <option>Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="impresion" checked={form.impresion} onChange={handleChange}
                    className="w-4 h-4" id="impresion" />
                  <label htmlFor="impresion" className="text-gray-600">Impresión</label>
                  {form.impresion && (
                    <input name="colores_impresion" type="number" value={form.colores_impresion} onChange={handleChange}
                      className="w-20 border rounded px-2 py-1 ml-2" placeholder="# Colores" />
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}
                className="px-6 py-2 border rounded text-sm hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSave}
                className="px-6 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}