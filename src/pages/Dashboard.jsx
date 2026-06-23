// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const GATEWAY_URL = "https://backparaprobarrailway-production.up.railway.app";

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
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const datos = decodificarToken(token);
      setUsuario(datos);
    }
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/informes/resumen-sistema`);
      const data = await res.json();
      if (data.success) setResumen(data);
    } catch (err) {
      console.error("Error cargando resumen:", err);
    }
  };

  const rol = usuario?.rol || "";

  console.log("Usuario:", usuario);
  console.log("Rol:", rol);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1 style={{ marginBottom: "5px" }}>Grupo Cordillera</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Bienvenido{usuario?.email ? `, ${usuario.email}` : ""} — Rol: <strong>{rol}</strong>
        </p>

        {/* Vista de accesos según rol */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

          {(rol === "admin" || rol === "supersaiyajin") && (
            <TarjetaAcceso titulo="Administración" descripcion="Gestión de usuarios y roles" color="#023e8a" url="/admin" />
          )}

          {(rol === "admin" || rol === "gerente" || rol === "supersaiyajin") && (
            <TarjetaAcceso titulo="KPIs" descripcion="Indicadores del negocio" color="#0077b6" url="/kpi" />
          )}

          {(rol === "admin" || rol === "gerente" || rol === "supersaiyajin") && (
            <TarjetaAcceso titulo="Informes" descripcion="Informes ejecutivos" color="#00b4d8" url="/informes" />
          )}

          {(rol === "admin" || rol === "operador" || rol === "supersaiyajin") && (
            <TarjetaAcceso titulo="Importaciones" descripcion="Carga de archivos" color="#0096c7" url="/importacion" />
          )}

          {(rol === "admin" || rol === "supersaiyajin") && (
            <TarjetaAcceso titulo="Gestión" descripcion="Gestión empresarial" color="#48cae4" url="/gestion" />
          )}

          {(rol === "gerente" || rol === "supersaiyajin") && (
            <TarjetaAcceso titulo="Chatbot" descripcion="Consultas inteligentes" color="#90e0ef" url="/chatbot" />
          )}

        </div>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor, color }) {
  return (
    <div style={{
      background: "white", borderRadius: "12px", padding: "20px 30px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`,
      minWidth: "180px"
    }}>
      <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{titulo}</p>
      <p style={{ color, fontSize: "28px", fontWeight: "bold", margin: "5px 0 0" }}>{valor}</p>
    </div>
  );
}

function TarjetaAcceso({ titulo, descripcion, color, url }) {
  return (
    <div
      onClick={() => window.location.href = url}
      style={{
        background: "white", borderRadius: "12px", padding: "30px", width: "200px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderTop: `4px solid ${color}`,
        cursor: "pointer"
      }}>
      <h3 style={{ color, marginBottom: "8px" }}>{titulo}</h3>
      <p style={{ color: "#666", fontSize: "14px" }}>{descripcion}</p>
    </div>
  );
}

export default Dashboard;