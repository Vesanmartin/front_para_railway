// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gestion from "./pages/Gestion";
import Importacion from "./pages/Importacion";
import Admin from "./pages/Admin";
import Kpi from "./pages/Kpi";
import Chatbot from "./pages/Chatbot";

// Componente de rutas
// Verifica que el usuario tenga el rol requerido para acceder.
// Si no tiene token redirige al login.
// Si tiene token pero no el rol correcto redirige al dashboard.
function RutaProtegida({ children, rolRequerido }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (rolRequerido && payload.rol !== rolRequerido) {
      return <Navigate to="/dashboard" />;
    }
  } catch {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login sin Navbar */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas — cualquier usuario autenticado */}
        <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/gestion" element={<RutaProtegida><Gestion /></RutaProtegida>} />
        <Route path="/importacion" element={<RutaProtegida><Importacion /></RutaProtegida>} />
        <Route path="/kpi" element={<RutaProtegida><Kpi /></RutaProtegida>} />

        {/* Ruta exclusiva para admin */}
        <Route path="/admin" element={
          <RutaProtegida rolRequerido="admin">
            <Admin />
          </RutaProtegida>
        } />
        <Route path="/chatbot" element={<RutaProtegida><Chatbot /></RutaProtegida>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;