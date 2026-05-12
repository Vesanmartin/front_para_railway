// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gestion from "./pages/Gestion";
import Importacion from "./pages/Importacion";
import Admin from "./pages/Admin";
import Kpi from "./pages/Kpi";
import Chatbot from "./pages/Chatbot";
import Informes from "./pages/Informes";

function RutaProtegida({ children, rolesRequeridos }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (rolesRequeridos && !rolesRequeridos.includes(payload.rol)) {
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
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <RutaProtegida rolesRequeridos={["admin", "gerente", "operador", "supersaiyajin"]}>
            <Dashboard />
          </RutaProtegida>
        } />

        <Route path="/gestion" element={
          <RutaProtegida rolesRequeridos={["admin", "operador", "supersaiyajin"]}>
            <Gestion />
          </RutaProtegida>
        } />

        <Route path="/importacion" element={
          <RutaProtegida rolesRequeridos={["operador", "supersaiyajin"]}>
            <Importacion />
          </RutaProtegida>
        } />

        <Route path="/kpi" element={
          <RutaProtegida rolesRequeridos={["gerente", "supersaiyajin"]}>
            <Kpi />
          </RutaProtegida>
        } />

        <Route path="/admin" element={
          <RutaProtegida rolesRequeridos={["admin", "supersaiyajin"]}>
            <Admin />
          </RutaProtegida>
        } />

        <Route path="/chatbot" element={
          <RutaProtegida rolesRequeridos={["gerente", "supersaiyajin"]}>
            <Chatbot />
          </RutaProtegida>
        } />

        <Route path="/informes" element={
          <RutaProtegida rolesRequeridos={["gerente", "supersaiyajin"]}>
            <Informes />
          </RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;