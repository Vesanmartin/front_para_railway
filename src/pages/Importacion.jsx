// src/pages/Importacion.jsx
// Vista del operador para importar datos desde fuentes externas

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function Importacion() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fuente, setFuente] = useState("ERP");
  const [sucursal, setSucursal] = useState("");
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  // Cargar historial de importaciones
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const respuesta = await fetch("http://localhost:3003/api/import/historial", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await respuesta.json();
        setHistorial(data);
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };
    cargarHistorial();
  }, []);

  // Importar datos
  const importarDatos = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const respuesta = await fetch("http://localhost:3003/api/import/datos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sourceType: fuente, sucursal })
      });
      const data = await respuesta.json();
      if (data.success) {
        setMensaje(`Importación desde ${fuente} completada`);
        const h = await fetch("http://localhost:3003/api/import/historial", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        setHistorial(await h.json());
      }
    } catch (err) {
      setMensaje("Error en la importación");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1>Importación de Datos</h1>

        <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "30px" }}>
          <h3>Importar desde fuente externa</h3>

          <select
            value={fuente}
            onChange={(e) => setFuente(e.target.value)}
            style={{ margin: "5px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
          >
            <option value="ERP">ERP</option>
            <option value="CRM">CRM</option>
            <option value="POS">POS</option>
          </select>

          <input
            placeholder="Sucursal"
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
            style={{ margin: "5px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <button
            onClick={importarDatos}
            disabled={cargando}
            style={{ margin: "5px", padding: "8px 16px", background: "#0066cc", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            {cargando ? "Importando..." : "Importar"}
          </button>

          {mensaje && <p style={{ marginTop: "10px", fontWeight: "bold" }}>{mensaje}</p>}
        </div>

        <h2>Historial de Importaciones</h2>
        <table style={{ width: "100%", background: "white", borderRadius: "12px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0066cc", color: "white" }}>
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Fuente</th>
              <th style={{ padding: "12px" }}>Sucursal</th>
              <th style={{ padding: "12px" }}>Registros</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px", textAlign: "center" }}>{h.id}</td>
                <td style={{ padding: "12px" }}>{h.fuente}</td>
                <td style={{ padding: "12px" }}>{h.sucursal}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{h.registros}</td>
                <td style={{ padding: "12px" }}>{h.estado}</td>
                <td style={{ padding: "12px" }}>{new Date(h.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Importacion;