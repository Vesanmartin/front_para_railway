// src/pages/Importacion.jsx
// Vista del operador para importar datos desde fuentes externas
// Soporta importaciÃ³n automÃ¡tica (simulada) y manual via CSV

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const MODULOS = [
  { id: "erp_transacciones",   nombre: "ERP â€” Transacciones",        icono: "ðŸ­", fuente: "ERP" },
  { id: "rrhh_empleados",      nombre: "RRHH â€” Empleados",           icono: "ðŸ‘¤", fuente: "RRHH" },
  { id: "rrhh_remuneraciones", nombre: "RRHH â€” Remuneraciones",      icono: "ðŸ’°", fuente: "RRHH" },
  { id: "rrhh_asistencia",     nombre: "RRHH â€” Asistencia",          icono: "ðŸ“…", fuente: "RRHH" },
  { id: "crm_terceros",        nombre: "CRM â€” Clientes/Proveedores", icono: "ðŸ‘¥", fuente: "CRM" },
  { id: "crm_interacciones",   nombre: "CRM â€” Interacciones",        icono: "ðŸ’¬", fuente: "CRM" },
  { id: "crm_procesos_venta",  nombre: "CRM â€” Procesos Venta",       icono: "ðŸ“Š", fuente: "CRM" },
  { id: "pos_ventas",          nombre: "POS â€” Ventas",               icono: "ðŸ›’", fuente: "POS" },
  { id: "analytics_visitas", nombre: "Analytics â€” Visitas Web", icono: "ðŸ“ˆ", fuente: "Analytics" }
];

function Importacion() {
  const [historial, setHistorial]   = useState([]);
  const [modulo, setModulo]         = useState("erp_transacciones");
  const [archivo, setArchivo]       = useState(null);
  const [cargando, setCargando]     = useState(false);
  const [progreso, setProgreso]     = useState(0);
  const [mensaje, setMensaje]       = useState({ texto: "", tipo: "" });
  const [modoImport, setModoImport] = useState("csv"); // "csv" o "auto";
  const [frecuencia, setFrecuencia] = useState("diaria"); // para tener frecuencia de descargar datos + boton que llame serverless

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const respuesta = await fetch("/api/import/historial", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await respuesta.json();
      if (Array.isArray(data)) setHistorial(data);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  const importarCSV = async () => {
    if (!archivo) {
      setMensaje({ texto: "Debes seleccionar un archivo CSV", tipo: "error" });
      return;
    }

    setCargando(true);
    setMensaje({ texto: "", tipo: "" });
    setProgreso(0);

    const intervalo = setInterval(() => {
      setProgreso(p => { if (p >= 90) { clearInterval(intervalo); return 90; } return p + 10; });
    }, 300);

    try {
      const moduloData = MODULOS.find(m => m.id === modulo);
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("modulo", modulo);
      formData.append("fuente", moduloData?.fuente || "ERP");

      const respuesta = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      clearInterval(intervalo);
      setProgreso(100);

      const data = await respuesta.json();

      if (data.success) {
        setMensaje({
          texto: ` ${data.mensaje} (${data.errores} errores)`,
          tipo: "exito"
        });
        setArchivo(null);
        document.getElementById("inputArchivo").value = "";
        await cargarHistorial();
      } else {
        setMensaje({ texto: `${data.error}`, tipo: "error" });
      }

    } catch (err) {
      clearInterval(intervalo);
      setProgreso(100);
      setMensaje({ texto: "Error conectando con el servicio", tipo: "error" });
    } finally {
      setCargando(false);
      setTimeout(() => setProgreso(0), 2000);
    }
  };

  const importarAuto = async () => {
  const moduloData = MODULOS.find(m => m.id === modulo);
  const fuente = moduloData?.fuente || "ERP";

  setCargando(true);
  setMensaje({ texto: "", tipo: "" });

  try {
    // Llama al endpoint Serverless local (puerto 4000/dev)
    const respuesta = await fetch("PLACEHOLDER/dev/importar-automatico", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        fuente: fuente,
        modulo: modulo,
        frecuencia: frecuencia,
        sucursal: "Todas"
      })
    });

    const data = await respuesta.json();
    if (data.success) {
      setMensaje({
        texto: `Importacion automatica ${frecuencia} programada para ${fuente}`,
        tipo: "exito"
      });
      await cargarHistorial();
    } else {
      setMensaje({ texto: data.error || "Error en importacion automatica", tipo: "error" });
    }
  } catch (err) {
    setMensaje({ texto: "Error conectando con el servicio Serverless", tipo: "error" });
  } finally {
    setCargando(false);
  }
};

  const badgeEstado = (estado) => ({
    padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
    background: ["exitoso","completado"].includes(estado) ? "#d1fae5" : "#fee2e2",
    color: ["exitoso","completado"].includes(estado) ? "#065f46" : "#991b1b"
  });

  const exitosos = historial.filter(h => ["exitoso","completado"].includes(h.estado)).length;
  const fallidos = historial.filter(h => h.estado === "fallido").length;
  const totalRegistros = historial.reduce((acc, h) => acc + (h.registros || 0), 0);

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1 style={{ marginBottom: "5px" }}>ImportaciÃ³n de Datos</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>IntegraciÃ³n con sistemas ERP, RRHH, CRM y POS</p>

        {/* Tarjetas resumen */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <TarjetaResumen titulo="Importaciones Exitosas" valor={exitosos} color="#059669" />
          <TarjetaResumen titulo="Importaciones Fallidas" valor={fallidos} color="#dc2626" />
          <TarjetaResumen titulo="Total Registros" valor={totalRegistros.toLocaleString()} color="#0077b6" />
          <TarjetaResumen titulo="Total Importaciones" valor={historial.length} color="#7c3aed" />
        </div>

        {/* Panel de importaciÃ³n */}
        <div style={{ background: "white", borderRadius: "12px", padding: "30px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "20px" }}>Nueva ImportaciÃ³n</h3>

          {/* Selector modo */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <button onClick={() => setModoImport("csv")}
              style={{
                padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: modoImport === "csv" ? "#0077b6" : "#f1f5f9",
                color: modoImport === "csv" ? "white" : "#555", fontWeight: "600"
              }}>
              Subir archivo CSV
            </button>
            <button onClick={() => setModoImport("auto")}
              style={{
                padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: modoImport === "auto" ? "#0077b6" : "#f1f5f9",
                color: modoImport === "auto" ? "white" : "#555", fontWeight: "600"
              }}>
              ImportaciÃ³n automÃ¡tica
            </button>
          </div>

          {/* Selector de mÃ³dulo */}
          <p style={{ color: "#555", marginBottom: "12px", fontWeight: "500" }}>Seleccionar mÃ³dulo:</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
            {MODULOS.map(m => (
              <div key={m.id} onClick={() => setModulo(m.id)}
                style={{
                  padding: "12px 18px", borderRadius: "10px", cursor: "pointer",
                  border: modulo === m.id ? "2px solid #0077b6" : "2px solid #e2e8f0",
                  background: modulo === m.id ? "#eff6ff" : "white",
                  transition: "all 0.2s", minWidth: "140px"
                }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{m.icono}</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: modulo === m.id ? "#0077b6" : "#333" }}>
                  {m.nombre}
                </div>
              </div>
            ))}
          </div>

          {/* Modo CSV */}
          {modoImport === "csv" && (
            <div>
              <p style={{ color: "#555", marginBottom: "8px", fontWeight: "500" }}>Archivo CSV:</p>
              <input
                id="inputArchivo"
                type="file"
                accept=".csv"
                onChange={(e) => setArchivo(e.target.files[0])}
                style={{ display: "block", marginBottom: "16px", padding: "8px", border: "1px dashed #0077b6", borderRadius: "8px", width: "100%", cursor: "pointer" }}
              />
              {archivo && (
                <p style={{ color: "#059669", fontSize: "13px", marginBottom: "16px" }}>
                  {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

          {/* Modo automÃ¡tico */}
          {modoImport === "auto" && (
  <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
    <p style={{ color: "#555", fontSize: "14px", marginBottom: "16px" }}>
      Selecciona el modulo y la frecuencia, luego presiona <strong>Importar Automatico</strong> para programar la importacion.
    </p>
    <p style={{ color: "#555", fontWeight: "500", marginBottom: "8px" }}>Frecuencia:</p>
    <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
      {["diaria", "semanal", "mensual"].map(f => (
        <button key={f} onClick={() => setFrecuencia(f)}
          style={{
            padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: frecuencia === f ? "#7c3aed" : "#e2e8f0",
            color: frecuencia === f ? "white" : "#555",
            fontWeight: "600", textTransform: "capitalize"
          }}>
          {f}
        </button>
      ))}
    </div>
    <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px" }}>
      Modulo seleccionado: <strong>{MODULOS.find(m => m.id === modulo)?.nombre}</strong> â€” frecuencia: <strong>{frecuencia}</strong>
    </p>
  </div>
)}

          {/* Barra progreso */}
          {progreso > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ background: "#e2e8f0", borderRadius: "99px", height: "8px" }}>
                <div style={{ background: "#0077b6", height: "8px", borderRadius: "99px", width: `${progreso}%`, transition: "width 0.3s" }} />
              </div>
              <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{progreso}% completado</p>
            </div>
          )}

          {/* Mensaje */}
          {mensaje.texto && (
            <div style={{
              padding: "12px 16px", borderRadius: "8px", marginBottom: "16px",
              background: mensaje.tipo === "exito" ? "#d1fae5" : "#fee2e2",
              color: mensaje.tipo === "exito" ? "#065f46" : "#991b1b"
            }}>
              {mensaje.texto}
            </div>
          )}

          <button
            onClick={modoImport === "csv" ? importarCSV : importarAuto}
            disabled={cargando}
            style={{
              padding: "12px 32px", background: cargando ? "#94a3b8" : "#0077b6",
              color: "white", border: "none", borderRadius: "8px",
              cursor: cargando ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "600"
            }}>
            {cargando ? "â³ Importando..." : modoImport === "csv" ? "â–¶ Importar CSV" : "Importar AutomÃ¡tico"}
          </button>
        </div>

        {/* Historial */}
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0 }}>Historial de Importaciones</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>#</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Fuente</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Sucursal</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Registros</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Estado</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 && (
                <tr><td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#999" }}>No hay importaciones registradas</td></tr>
              )}
              {historial.map((h) => (
                <tr key={h.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{h.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "600" }}>{h.fuente}</td>
                  <td style={{ padding: "12px 16px" }}>{h.sucursal}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "600" }}>{(h.registros || 0).toLocaleString()}</td>
                  <td style={{ padding: "12px 16px" }}><span style={badgeEstado(h.estado)}>{h.estado}</span></td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>{new Date(h.created_at).toLocaleString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TarjetaResumen({ titulo, valor, color }) {
  return (
    <div style={{
      background: "white", borderRadius: "12px", padding: "20px 30px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`, minWidth: "150px"
    }}>
      <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{titulo}</p>
      <p style={{ color, fontSize: "32px", fontWeight: "bold", margin: "5px 0 0" }}>{valor}</p>
    </div>
  );
}

export default Importacion;
