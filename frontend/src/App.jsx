import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import References from './pages/References';
import Orders from './pages/Orders';
import Production from './pages/Production';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-blue-800 text-white px-4 py-2 flex items-center gap-6 shadow-md">
          <div className="font-bold text-lg">🏭 PlastiPack POS</div>
          <NavLink to="/referencias"
            className={({ isActive }) => `text-sm px-3 py-1 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
            📦 Referencias
          </NavLink>
          <NavLink to="/pedidos"
            className={({ isActive }) => `text-sm px-3 py-1 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
            📋 Pedidos
          </NavLink>
          <NavLink to="/produccion"
            className={({ isActive }) => `text-sm px-3 py-1 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
            ⚙️ Producción
          </NavLink>
        </nav>
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">🏭</div>
                <h1 className="text-2xl font-bold text-gray-700">PlastiPack - Sistema POS</h1>
                <p className="mt-2">Selecciona una opción del menú</p>
              </div>
            } />
            <Route path="/referencias" element={<References />} />
            <Route path="/pedidos" element={<Orders />} />
           <Route path="/produccion" element={<Production />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}