// src/pages/Chatbot.jsx
// Chatbot CORDI powered by Ollama llama3.2
// Muestra grÃ¡ficos automÃ¡ticamente cuando la respuesta tiene datos numÃ©ricos
// Usa Recharts para las visualizaciones

import gatoImg from "../assets/gatomeme.png";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from "recharts";

// Colores para los grÃ¡ficos
const COLORES = ["#0077b6", "#00b4d8", "#48cae4", "#90e0ef", "#023e8a"];

// Nombres de los meses para mostrar en los grÃ¡ficos
const MESES = {
  1:"Ene", 2:"Feb", 3:"Mar", 4:"Abr", 5:"May", 6:"Jun",
  7:"Jul", 8:"Ago", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Dic"
};

function Chatbot() {
  // Estado del chat
  const [mensajes, setMensajes] = useState([
    { rol: "sistema", texto: "Hola, soy CORDI, el analista de Grupo Cordillera. PregÃºntame sobre ventas, KPIs o informes... si te atreves." }
  ]);
  const [pregunta, setPregunta]       = useState("");
  const [cargando, setCargando]       = useState(false);

  // Estado para los grÃ¡ficos â€” guarda los datos del Ãºltimo mensaje
  const [datosGrafico, setDatosGrafico] = useState(null);

  // Tipo de grÃ¡fico activo (para el selector de pestaÃ±as)
  const [tipoGrafico, setTipoGrafico] = useState("ventas_mes");

  const finRef = useRef(null);

  // Scroll automÃ¡tico al Ãºltimo mensaje
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // FunciÃ³n para enviar la pregunta al backend
  const enviar = async () => {
    if (!pregunta.trim() || cargando) return;

    const textoPregunta = pregunta.trim();
    setPregunta("");
    setMensajes(prev => [...prev, { rol: "usuario", texto: textoPregunta }]);
    setCargando(true);

    try {
      const respuesta = await fetch("PLACEHOLDER/api/informes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: textoPregunta })
      });

      const data = await respuesta.json();

      if (data.success) {
        // Guardamos el mensaje de texto
        setMensajes(prev => [...prev, { rol: "asistente", texto: data.respuesta }]);

        // Si vienen datos estructurados, los guardamos para graficar
        if (data.datos_grafico) {
          setDatosGrafico(data.datos_grafico);
        }
      } else {
        setMensajes(prev => [...prev, { rol: "error", texto: "Error: " + data.error }]);
      }
    } catch (err) {
      setMensajes(prev => [...prev, { rol: "error", texto: "Error conectando con el servicio de informes" }]);
    } finally {
      setCargando(false);
    }
  };

  const manejarTecla = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // Estilos de los mensajes segÃºn el rol
  const estiloMensaje = (rol) => {
    if (rol === "usuario") return {
      alignSelf: "flex-end", background: "#0077b6", color: "white",
      padding: "10px 16px", borderRadius: "18px 18px 4px 18px",
      maxWidth: "70%", fontSize: "14px"
    };
    if (rol === "error") return {
      alignSelf: "flex-start", background: "#fee2e2", color: "#370a83",
      padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
      maxWidth: "70%", fontSize: "14px"
    };
    return {
      alignSelf: "flex-start", background: "white", color: "#333",
      padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
      maxWidth: "70%", fontSize: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    };
  };

  // Prepara los datos de ventas por mes para Recharts
  const dataVentasMes = (datosGrafico?.ventas_por_mes || [])
    .map(v => ({
      periodo: `${MESES[v.mes]} ${v.aÃ±o}`,
      ventas:  parseFloat(v.total_ventas)
    }))
    .reverse();

  // Prepara los datos de ventas por sucursal para Recharts
  const dataSucursales = (datosGrafico?.ventas_por_sucursal || [])
    .map(s => ({
      name:  s.sucursal,
      value: parseFloat(s.total_ventas)
    }));

  // Prepara los datos de top productos para Recharts
  const dataProductos = (datosGrafico?.top_productos || [])
    .map(p => ({
      nombre: p.nombre_producto,
      total:  parseFloat(p.total_generado)
    }));

  // Prepara los datos de compras por mes para Recharts
  const dataComprasMes = (datosGrafico?.compras_por_mes || [])
    .map(c => ({
      periodo: `${MESES[c.mes]} ${c.aÃ±o}`,
      compras: parseFloat(c.total_compras)
    }))
    .reverse();

  // Verifica si hay datos disponibles para mostrar el panel
  const hayDatos = datosGrafico && (
    dataVentasMes.length > 0 ||
    dataSucursales.length > 0 ||
    dataProductos.length > 0 ||
    dataComprasMes.length > 0
  );

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />

      {/* Layout principal â€” chat + grÃ¡fico lado a lado */}
      <div style={{
        padding: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        gap: "24px",
        alignItems: "flex-start"
      }}>

        {/* Panel izquierdo â€” Chat */}
        <div style={{ flex: hayDatos ? "0 0 480px" : "1" }}>
          <h1 style={{ marginBottom: "5px" }}>Chatbot Cordillera</h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Asistente inteligente powered by <strong>Ollama llama3.2</strong> via Circuit Breaker
          </p>

          {/* Ãrea de mensajes */}
          <div style={{
            background: "#f8fafc", borderRadius: "12px", padding: "20px",
            height: "450px", overflowY: "auto", display: "flex",
            flexDirection: "column", gap: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            {mensajes.map((m, i) => (
              <div key={i} style={estiloMensaje(m.rol)}>
                {m.rol !== "usuario" && (
                  <div style={{ fontSize: "11px", color: m.rol === "error" ? "#421285" : "#0077b6", marginBottom: "4px", fontWeight: "600" }}>
                    {m.rol === "asistente" ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <img src={gatoImg} style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }} alt="asistente" />
                        Asistente
                      </span>
                    ) : m.rol === "sistema" ? "â„¹ï¸ Sistema" : "âš ï¸ Error"}
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{m.texto}</div>
              </div>
            ))}

            {/* Indicador de carga */}
            {cargando && (
              <div style={{ alignSelf: "flex-start", background: "white", padding: "10px 16px", borderRadius: "18px 18px 18px 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: "11px", color: "#0077b6", marginBottom: "4px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  <img src={gatoImg} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} alt="asistente" />
                  Asistente
                </div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>Pensando...</div>
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Input para escribir */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <input
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={manejarTecla}
              placeholder="Escribe tu pregunta sobre KPIs, ventas o informes..."
              disabled={cargando}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: "10px",
                border: "1px solid #ddd", fontSize: "14px",
                outline: "none", background: cargando ? "#f8fafc" : "white"
              }}
            />
            <button onClick={enviar} disabled={cargando || !pregunta.trim()}
              style={{
                padding: "12px 24px",
                background: cargando || !pregunta.trim() ? "#94a3b8" : "#0077b6",
                color: "white", border: "none", borderRadius: "10px",
                cursor: cargando || !pregunta.trim() ? "not-allowed" : "pointer",
                fontWeight: "600", fontSize: "14px"
              }}>
              {cargando ? "..." : "Enviar"}
            </button>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px" }}>
            Presiona Enter para enviar
          </p>
        </div>

        {/* Panel derecho â€” GrÃ¡ficos (solo aparece cuando hay datos) */}
        {hayDatos && (
          <div style={{
            flex: 1,
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            minWidth: 0
          }}>
            <h3 style={{ marginBottom: "16px", color: "#333" }}>
              ðŸ“Š VisualizaciÃ³n de datos
            </h3>

            {/* PestaÃ±as para cambiar el tipo de grÃ¡fico */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {dataVentasMes.length > 0 && (
                <button onClick={() => setTipoGrafico("ventas_mes")}
                  style={{
                    padding: "6px 14px", borderRadius: "20px", border: "none",
                    cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    background: tipoGrafico === "ventas_mes" ? "#0077b6" : "#f1f5f9",
                    color: tipoGrafico === "ventas_mes" ? "white" : "#555"
                  }}>
                  Ventas por Mes
                </button>
              )}
              {dataSucursales.length > 0 && (
                <button onClick={() => setTipoGrafico("sucursales")}
                  style={{
                    padding: "6px 14px", borderRadius: "20px", border: "none",
                    cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    background: tipoGrafico === "sucursales" ? "#0077b6" : "#f1f5f9",
                    color: tipoGrafico === "sucursales" ? "white" : "#555"
                  }}>
                  Por Sucursal
                </button>
              )}
              {dataProductos.length > 0 && (
                <button onClick={() => setTipoGrafico("productos")}
                  style={{
                    padding: "6px 14px", borderRadius: "20px", border: "none",
                    cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    background: tipoGrafico === "productos" ? "#0077b6" : "#f1f5f9",
                    color: tipoGrafico === "productos" ? "white" : "#555"
                  }}>
                  Top Productos
                </button>
              )}
              {dataComprasMes.length > 0 && (
                <button onClick={() => setTipoGrafico("compras_mes")}
                  style={{
                    padding: "6px 14px", borderRadius: "20px", border: "none",
                    cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    background: tipoGrafico === "compras_mes" ? "#0077b6" : "#f1f5f9",
                    color: tipoGrafico === "compras_mes" ? "white" : "#555"
                  }}>
                  Compras por Mes
                </button>
              )}
            </div>

            {/* GrÃ¡fico de ventas por mes â€” lÃ­nea */}
            {tipoGrafico === "ventas_mes" && dataVentasMes.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataVentasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => `$${parseInt(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="ventas" stroke="#0077b6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* GrÃ¡fico de ventas por sucursal â€” torta */}
            {tipoGrafico === "sucursales" && dataSucursales.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dataSucursales} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {dataSucursales.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `$${parseInt(v).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* GrÃ¡fico de top productos â€” barras horizontales */}
            {tipoGrafico === "productos" && dataProductos.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataProductos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip formatter={v => `$${parseInt(v).toLocaleString()}`} />
                  <Bar dataKey="total" fill="#0077b6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* GrÃ¡fico de compras por mes â€” barras */}
            {tipoGrafico === "compras_mes" && dataComprasMes.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataComprasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => `$${parseInt(v).toLocaleString()}`} />
                  <Bar dataKey="compras" fill="#e63946" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
