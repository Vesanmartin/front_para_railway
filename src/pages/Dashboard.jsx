// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

// Decodifica el token JWT sin librería externa
function decodificarToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function Dashboard() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const datos = decodificarToken(token);
      setUsuario(datos);
    }
  }, []);

  const rol = usuario?.rol || "gerente";

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1 style={{ marginBottom: "10px" }}>Dashboard</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Bienvenido{usuario?.email ? `, ${usuario.email}` : ""} — Rol: <strong>{rol}</strong>
        </p>

        {/* Vista Gerente — solo gerente ve estas tarjetas, no el admin */}
          {rol === "gerente" && (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <Tarjeta titulo="Indicadores Cordillera" color="#0077b6" />
              <Tarjeta titulo="Informes Cordillera" color="#00b4d8" />
              <Tarjeta titulo="Chatbot Cordillera" color="#48cae4" />
            </div>
)}

        {/* Vista Admin — acceso directo al panel de administración */}
        {rol === "admin" && (
          <div style={{ marginTop: "30px", background: "white", borderRadius: "12px", padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: "500px" }}>
              <h3 style={{ color: "#023e8a", marginBottom: "8px" }}>Panel de Administración</h3>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
                  Gestiona usuarios, roles, permisos y doble autenticación del sistema.
              </p>
          <button
              onClick={() => window.location.href = "/admin"}
            style={{ padding: "12px 28px", background: "#023e8a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>
            Ir al Panel Admin
          </button>
      </div>
)}

        {/* Vista Operador */}
        {rol === "operador" && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Tarjeta titulo="Importación" descripcion="Importar datos desde ERP/CRM/POS" color="#0096c7" />
          </div>
        )}
      </div>
    </div>
  );
}

function Tarjeta({ titulo, descripcion, color }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "30px",
      width: "200px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderTop: `4px solid ${color}`
    }}>
      <h3 style={{ color, marginBottom: "8px" }}>{titulo}</h3>
      <p style={{ color: "#666", fontSize: "14px" }}>{descripcion}</p>
    </div>
  );
}

export default Dashboard;