import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Ventas from "./pages/Ventas";
import Inventario from "./pages/Inventario";
import Clientes from "./pages/Clientes";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        
        <Sidebar />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;