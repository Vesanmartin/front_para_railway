// src/pages/Gestion.jsx
// Vista del administrador "” panel de gestión del sistema

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function Gestion() {
  const [pestana, setPestana] = useState("usuarios");
  const [sucursales, setSucursales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [nueva, setNueva] = useState({ nombre: "", descripcion: "", direccion: "", region: "" });

  // Estados para el módulo Serverless 
  // reporteResultado: Guarda la respuesta que devuelve la función Lambda
  // reporteCargando: Controla el estado del botón mientras espera la respuesta
  // reporteForm: Los parámetros que el usuario elige antes de disparar la Lambda
  const [reporteResultado, setReporteResultado] = useState(null);
  const [reporteCargando, setReporteCargando] = useState(false);
  const [reporteForm, setReporteForm] = useState({ sucursal: "Santiago Centro", tipo: "ventas", periodo: "2026-05" });

  const token = localStorage.getItem("token");

  // Datos simulados
  // En producción estos datos vendrí­an del auth-service (puerto 3001)
  // Se reemplazarí­an por un fetch real cuando el endpoint esté disponible
  const usuariosConectados = [
    { id: 1, email: "gerente@cordillera.cl", rol: "gerente", sucursal: "Santiago Centro", conexion: "Hace 5 min", estado: "activo" },
    { id: 2, email: "operador1@cordillera.cl", rol: "operador", sucursal: "Valparaí­so", conexion: "Hace 12 min", estado: "activo" },
    { id: 3, email: "operador2@cordillera.cl", rol: "operador", sucursal: "Concepción", conexion: "Hace 1 hora", estado: "inactivo" },
    { id: 4, email: "admin@test.cl", rol: "admin", sucursal: "Casa Matriz", conexion: "Ahora", estado: "activo" },
  ];

  // En producción vendrí­a de un microservicio de auditorí­a o logs
  const archivosDescargados = [
    { id: 1, nombre: "informe_kpi_abril.pdf", usuario: "gerente@cordillera.cl", fecha: "2026-05-03 09:15", tamanio: "245 KB" },
    { id: 2, nombre: "reporte_ventas_q1.xlsx", usuario: "gerente@cordillera.cl", fecha: "2026-05-02 16:30", tamanio: "1.2 MB" },
    { id: 3, nombre: "datos_importacion.csv", usuario: "operador1@cordillera.cl", fecha: "2026-05-02 11:00", tamanio: "88 KB" },
    { id: 4, nombre: "informe_mensual.pdf", usuario: "gerente@cordillera.cl", fecha: "2026-05-01 14:20", tamanio: "310 KB" },
  ];

  // Sucursales (sí­ vienen de la BD real) (gestion-service puerto 3003)
  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch("PLACEHOLDER/api/sucursales");
        const data = await respuesta.json();
        if (Array.isArray(data)) setSucursales(data);
      } catch (err) {
        console.error("Error cargando sucursales:", err);
      }
    };
    cargar();
  }, []);

  // Carga usuarios reales desde el auth-service
useEffect(() => {
  const cargarUsuarios = async () => {
    try {
      const respuesta = await fetch("PLACEHOLDER/api/auth/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await respuesta.json();
      if (Array.isArray(data)) setUsuarios(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };
  cargarUsuarios();
}, []);



  const crearSucursal = async () => {
    try {
      await fetch("PLACEHOLDER/api/gestion/gestion", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...nueva, estado: "activo" })
      });
      setNueva({ nombre: "", descripcion: "", direccion: "", region: "" });
    } catch (err) {
      console.error("Error creando sucursal:", err);
    }
  };

  const eliminarSucursal = async (id) => {
    try {
      await fetch(`PLACEHOLDER/api/gestion/gestion/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setSucursales(sucursales.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  // Elimina un usuario llamando al auth-service
// Elimina un usuario llamando al auth-service
const eliminarUsuario = async (id) => {
  try {
    await fetch(`PLACEHOLDER/api/auth/usuarios/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    // Actualiza la lista removiendo el usuario eliminado
    setUsuarios(usuarios.filter(u => u.id !== id));
  } catch (err) {
    console.error("Error eliminando usuario:", err);
  }
};

  // FUNCIí“N LAMBDA 1: Reporte bajo demanda
  // Concepto Serverless: esta función NO corre en un servidor permanente.
  // En AWS, se despliega como Lambda y solo se ejecuta cuando alguien la llama.
  // Localmente la simulamos con serverless-offline en puerto 4000.
  //
  // Flujo:
  // 1. El usuario elige sucursal, tipo y perí­odo en el formulario
  // 2. El frontend hace POST a /dev/reportes/generar con esos parámetros
  // 3. La función Lambda recibe el eventO, lo procesa y devuelve el reporte
  // 4. El frontend muestra el resultado en tarjetas
  //
  // En producción: consultarí­a el kpi-service para obtener datos reales de BD
  const generarReporte = async () => {
    setReporteCargando(true);
    setReporteResultado(null);
    try {
      const respuesta = await fetch("PLACEHOLDER/dev/reportes/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reporteForm) // Enví­a sucursal, tipo y periodo
      });
      const data = await respuesta.json();
      if (data.success) setReporteResultado(data.reporte);
    } catch (err) {
      console.error("Error Lambda generarReporte:", err);
    } finally {
      setReporteCargando(false);
    }
  };

  // FUNCIí“N LAMBDA 2: Reporte mensual automático
  // Concepto Serverless: en AWS esta función se dispararí­a con un schedule (cron).
  // Ejemplo: "todos los lunes a las 8am genera reportes de todas las sucursales"
  // No necesita que nadie la llame manualmente( se ejecuta sola).
  //
  // Localmente la simulamos con un botón que hace GET a /dev/reportes/mensual.
  // La función genera reportes para las 4 sucursales en paralelo
  // y devuelve un resumen consolidado.
  const reporteMensual = async () => {
    setReporteCargando(true);
    setReporteResultado(null);
    try {
      const respuesta = await fetch("PLACEHOLDER/dev/reportes/mensual");
      const data = await respuesta.json();
      if (data.success) setReporteResultado(data);
    } catch (err) {
      console.error("Error Lambda reporteMensual:", err);
    } finally {
      setReporteCargando(false);
    }
  };

  const estiloPestana = (nombre) => ({
    padding: "10px 24px",
    border: "none",
    borderBottom: pestana === nombre ? "3px solid #0077b6" : "3px solid transparent",
    background: "transparent",
    color: pestana === nombre ? "#0077b6" : "#666",
    fontWeight: pestana === nombre ? "bold" : "normal",
    cursor: "pointer",
    fontSize: "15px"
  });

  const badgeEstado = (estado) => ({
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    background: estado === "activo" ? "#d1fae5" : "#fee2e2",
    color: estado === "activo" ? "#065f46" : "#991b1b"
  });

  const badgeRol = (rol) => {
    const colores = {
      admin: { bg: "#dbeafe", color: "#1e40af" },
      gerente: { bg: "#ede9fe", color: "#5b21b6" },
      operador: { bg: "#fef9c3", color: "#854d0e" }
    };
    const c = colores[rol] || colores.operador;
    return { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", background: c.bg, color: c.color };
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1 style={{ marginBottom: "5px" }}>Panel de Administración</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>Gestión del sistema Grupo Cordillera</p>

        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <TarjetaResumen titulo="Usuarios Activos" valor={usuariosConectados.filter(u => u.estado === "activo").length} color="#0077b6" />
          <TarjetaResumen titulo="Total Usuarios" valor={usuariosConectados.length} color="#00b4d8" />
          <TarjetaResumen titulo="Archivos Descargados" valor={archivosDescargados.length} color="#48cae4" />
          <TarjetaResumen titulo="Sucursales" valor={sucursales.length} color="#023e8a" />
        </div>

        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #eee", padding: "0 20px" }}>
            <button style={estiloPestana("usuarios")} onClick={() => setPestana("usuarios")}>Usuarios Conectados</button>
            <button style={estiloPestana("archivos")} onClick={() => setPestana("archivos")}>Archivos Descargados</button>
            <button style={estiloPestana("sucursales")} onClick={() => setPestana("sucursales")}>Sucursales</button>
            <button style={estiloPestana("reportes")} onClick={() => setPestana("reportes")}>Reportes Lambda</button>
          </div>

          <div style={{ padding: "20px" }}>

            {/* PESTAí‘A USUARIOS */}
            {pestana === "usuarios" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
          <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Rol</th>
              <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Acciones</th>
             </tr>
            </thead>
        <tbody>
          {usuarios.length === 0 && (
              <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#999" }}>No hay usuarios</td></tr>
          )}
        {usuarios.map(u => (
          <tr key={u.id} style={{ borderTop: "1px solid #f1f5f9" }}>
            <td style={{ padding: "12px" }}>{u.email}</td>
              <td style={{ padding: "12px" }}><span style={badgeRol(u.rol)}>{u.rol}</span></td>
              <td style={{ padding: "12px" }}><span style={badgeEstado(u.estado || "activo")}>{u.estado || "activo"}</span></td>
              <td style={{ padding: "12px" }}>
                <button onClick={() => eliminarUsuario(u.id)}
                    style={{ padding: "5px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
         </table>
                )}

            {/* PESTAí‘A ARCHIVOS */}
            {pestana === "archivos" && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Archivo</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Usuario</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Fecha</th>
                    <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Tamaño</th>
                  </tr>
                </thead>
                <tbody>
                  {archivosDescargados.map(a => (
                    <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px" }}>ðŸ“„ {a.nombre}</td>
                      <td style={{ padding: "12px", color: "#666" }}>{a.usuario}</td>
                      <td style={{ padding: "12px", color: "#666" }}>{a.fecha}</td>
                      <td style={{ padding: "12px", color: "#666" }}>{a.tamanio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* PESTAí‘A SUCURSALES */}
            {pestana === "sucursales" && (
              <div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                  <input placeholder="Nombre" value={nueva.nombre}
                    onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }} />
                  <input placeholder="Descripción" value={nueva.descripcion}
                    onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }} />
                  <input placeholder="Dirección" value={nueva.direccion}
                    onChange={(e) => setNueva({ ...nueva, direccion: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }} />
                  <input placeholder="Región" value={nueva.region}
                    onChange={(e) => setNueva({ ...nueva, region: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }} />
                  <button onClick={crearSucursal}
                    style={{ padding: "8px 20px", background: "#0077b6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    + Agregar
                  </button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Nombre</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Descripción</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Dirección</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Región</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Estado</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sucursales.length === 0 && (
                      <tr><td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#999" }}>No hay sucursales registradas</td></tr>
                    )}
                    {sucursales.map(s => (
                      <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px" }}>{s.nombre}</td>
                        <td style={{ padding: "12px", color: "#666" }}>{s.descripcion}</td>
                        <td style={{ padding: "12px", color: "#666" }}>{s.direccion}</td>
                        <td style={{ padding: "12px", color: "#666" }}>{s.region}</td>
                        <td style={{ padding: "12px" }}><span style={badgeEstado(s.estado)}>{s.estado}</span></td>
                        <td style={{ padding: "12px" }}>
                          <button onClick={() => eliminarSucursal(s.id)}
                            style={{ padding: "5px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PESTAí‘A REPORTES LAMBDA
                Aquí­ se demuestran las funciones Serverless del proyecto.
                El frontend se comunica con serverless-offline (puerto 4000)
                que simula el entorno AWS Lambda localmente.
                Cada botón dispara una función Lambda diferente. */}
            {pestana === "reportes" && (
              <div>
                <p style={{ color: "#555", marginBottom: "20px", fontSize: "14px" }}>
                  Genera reportes usando funciones <strong>AWS Lambda</strong> via Serverless offline.
                  En produccion estas funciones consultarian el <strong>kpi-service</strong>.
                </p>

                {/* Formulario "” el usuario elige los parámetros antes de llamar a la Lambda */}
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "16px", color: "#333" }}>Reporte bajo demanda</h4>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {/* Parámetro 1: sucursal "” se enví­a al body de la Lambda */}
                    <select value={reporteForm.sucursal} onChange={(e) => setReporteForm({ ...reporteForm, sucursal: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }}>
                      <option>Santiago Centro</option>
                      <option>Providencia</option>
                      <option>Maipíº</option>
                      <option>Las Condes</option>
                    </select>
                    {/* Parámetro 2: tipo de reporte */}
                    <select value={reporteForm.tipo} onChange={(e) => setReporteForm({ ...reporteForm, tipo: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }}>
                      <option value="ventas">Ventas</option>
                      <option value="transacciones">Transacciones</option>
                      <option value="kpi">KPI</option>
                    </select>
                    {/* Parámetro 3: perí­odo del reporte */}
                    <input type="month" value={reporteForm.periodo}
                      onChange={(e) => setReporteForm({ ...reporteForm, periodo: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* Botón 1: dispara Lambda generarReporte "” POST /dev/reportes/generar */}
                    <button onClick={generarReporte} disabled={reporteCargando}
                      style={{ padding: "10px 24px", background: reporteCargando ? "#94a3b8" : "#0077b6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      {reporteCargando ? "Generando..." : "Generar Reporte"}
                    </button>
                    {/* Botón 2: dispara Lambda reporteMensual "” GET /dev/reportes/mensual
                        En AWS esto se ejecutarí­a automáticamente con un cron schedule */}
                    <button onClick={reporteMensual} disabled={reporteCargando}
                      style={{ padding: "10px 24px", background: reporteCargando ? "#94a3b8" : "#7c3aed", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      {reporteCargando ? "Generando..." : "Reporte Mensual Todas las Sucursales"}
                    </button>
                  </div>
                </div>

                {/* Resultado de la Lambda "” se muestra cuando reporteResultado tiene datos */}
                {reporteResultado && (
                  <div style={{ background: "#d1fae5", borderRadius: "10px", padding: "20px" }}>
                    <h4 style={{ color: "#065f46", marginBottom: "4px" }}>Reporte generado por Lambda</h4>
                    <p style={{ color: "#065f46", fontSize: "12px", marginBottom: "16px" }}>
                      Simulacion "” en produccion esta funcion Lambda consultaria el kpi-service
                    </p>

                    {/* Resultado de generarReporte: un reporte individual con métricas */}
                    {reporteResultado.id && (
                      <div>
                        <p style={{ color: "#065f46", marginBottom: "12px" }}>
                          <strong>{reporteResultado.id}</strong> "” {reporteResultado.sucursal} "” {reporteResultado.periodo}
                        </p>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                          <TarjetaLambda titulo="Ventas Totales" valor={`$${reporteResultado.datos.ventasTotales.toLocaleString()}`} />
                          <TarjetaLambda titulo="Transacciones" valor={reporteResultado.datos.transacciones.toLocaleString()} />
                          <TarjetaLambda titulo="Ticket Promedio" valor={`$${reporteResultado.datos.ticketPromedio.toLocaleString()}`} />
                          <TarjetaLambda titulo="Crecimiento" valor={reporteResultado.datos.crecimiento} />
                        </div>
                      </div>
                    )}

                    {/* Resultado de reporteMensual: un card por cada sucursal */}
                    {reporteResultado.reportes && (
                      <div>
                        <p style={{ color: "#065f46", marginBottom: "12px" }}>
                          <strong>Periodo:</strong> {reporteResultado.periodo} "” {reporteResultado.total} sucursales
                        </p>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                          {reporteResultado.reportes.map((r, i) => (
                            <div key={i} style={{ background: "white", borderRadius: "8px", padding: "14px 18px", minWidth: "160px" }}>
                              <p style={{ color: "#065f46", fontWeight: "bold", margin: "0 0 6px" }}>{r.sucursal}</p>
                              <p style={{ color: "#333", fontSize: "13px", margin: 0 }}>Ventas: <strong>${r.ventas.toLocaleString()}</strong></p>
                              <p style={{ color: "#059669", fontSize: "12px", margin: "4px 0 0" }}>{r.estado}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function TarjetaResumen({ titulo, valor, color }) {
  return (
    <div style={{
      background: "white", borderRadius: "12px", padding: "20px 30px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`,
      minWidth: "150px"
    }}>
      <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{titulo}</p>
      <p style={{ color, fontSize: "32px", fontWeight: "bold", margin: "5px 0 0" }}>{valor}</p>
    </div>
  );
}

// Componente para mostrar cada métrica del resultado Lambda
// Se reutiliza para ventas, transacciones, ticket promedio y crecimiento
function TarjetaLambda({ titulo, valor }) {
  return (
    <div style={{ background: "white", borderRadius: "8px", padding: "14px 18px", minWidth: "140px" }}>
      <p style={{ color: "#666", fontSize: "12px", margin: "0 0 4px" }}>{titulo}</p>
      <p style={{ color: "#065f46", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{valor}</p>
    </div>
  );
}

export default Gestion;
