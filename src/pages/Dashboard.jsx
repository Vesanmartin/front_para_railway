// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

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
    const res = await fetch("http://localhost:3004/api/informes/resumen-sistema");
    const data = await res.json();
    if (data.success) setResumen(data);
  } catch (err) {
    console.error("Error cargando resumen:", err);
  }
};

  const rol = usuario?.rol || "";

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
        <h1 style={{ marginBottom: "5px" }}>Dashboard</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Bienvenido{usuario?.email ? `, ${usuario.email}` : ""} — Rol: <strong>{rol}</strong>
        </p>

        {/* Tarjetas métricas */}
        {resumen && (
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
            <Tarjeta titulo="Usuarios del Sistema" valor={resumen.totalUsuarios} color="#0077b6" />
            <Tarjeta titulo="Importaciones Realizadas" valor={resumen.totalImportaciones} color="#00b4d8" />
            <Tarjeta titulo="Registros Importados" valor={parseInt(resumen.registrosTotales).toLocaleString()} color="#48cae4" />
          </div>
        )}

        {/* Tabla últimas importaciones */}
        {resumen && (
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: "16px", color: "#333" }}>Últimas Importaciones</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Fuente</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Sucursal</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Registros</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Estado</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {resumen.ultimasImportaciones.map((imp, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: "600" }}>{imp.fuente}</td>
                    <td style={{ padding: "12px", color: "#666" }}>{imp.sucursal}</td>
                    <td style={{ padding: "12px", color: "#0077b6", fontWeight: "600" }}>{imp.registros?.toLocaleString()}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        background: imp.estado === "exitoso" ? "#d1fae5" : "#fef3c7",
                        color: imp.estado === "exitoso" ? "#065f46" : "#92400e",
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600"
                      }}>
                        {imp.estado}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#666", fontSize: "13px" }}>{formatearFecha(imp.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vista Admin */}
        {rol === "admin" && (
          <div style={{ background: "white", borderRadius: "12px", padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: "500px" }}>
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

        {/* Vista Gerente */}
        {rol === "gerente" && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <TarjetaAcceso titulo="Indicadores KPI" descripcion="Ver métricas operacionales" color="#0077b6" url="/kpi" />
            <TarjetaAcceso titulo="Informes" descripcion="Análisis de ventas por período" color="#00b4d8" url="/informes" />
            <TarjetaAcceso titulo="Chatbot" descripcion="Consulta inteligente de datos" color="#48cae4" url="/chatbot" />
          </div>
        )}

        {/* Vista Operador */}
        {rol === "operador" && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <TarjetaAcceso titulo="Importación" descripcion="Importar datos desde ERP/CRM/POS" color="#0096c7" url="/importacion" />
          </div>
        )}

        {/* Vista SuperSaiyajin — acceso total */}
        {rol === "supersaiyajin" && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <TarjetaAcceso titulo="Panel Admin" descripcion="Gestión de usuarios y roles" color="#023e8a" url="/admin" />
            <TarjetaAcceso titulo="Indicadores KPI" descripcion="Ver métricas operacionales" color="#0077b6" url="/kpi" />
            <TarjetaAcceso titulo="Informes" descripcion="Análisis de ventas por período" color="#00b4d8" url="/informes" />
            <TarjetaAcceso titulo="Chatbot" descripcion="Consulta inteligente de datos" color="#48cae4" url="/chatbot" />
            <TarjetaAcceso titulo="Importación" descripcion="Importar datos desde ERP/CRM/POS" color="#0096c7" url="/importacion" />
            <TarjetaAcceso titulo="Gestión" descripcion="Gestión de datos organizacionales" color="#00b4d8" url="/gestion" />
          </div>
        )}

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