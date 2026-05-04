// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gestion from "./pages/Gestion";
import Importacion from "./pages/Importacion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login sin Navbar */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gestion" element={<Gestion />} />
        <Route path="/importacion" element={<Importacion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;