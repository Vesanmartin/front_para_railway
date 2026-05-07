// src/pages/Chatbot.jsx
// Chatbot powered by Ollama llama3.2 via informes-service (puerto 3004)
// Patrón Circuit Breaker — el informes-service maneja fallos de Ollama

// src/pages/Chatbot.jsx
import gatoImg from "../assets/gatomeme.png";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";

function Chatbot() {
  const [mensajes, setMensajes] = useState([
    { rol: "sistema", texto: "Hola, soy el asistente de Grupo Cordillera. Puedo ayudarte con consultas sobre KPIs, ventas e informes." }
  ]);
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async () => {
    if (!pregunta.trim() || cargando) return;
    const textoPregunta = pregunta.trim();
    setPregunta("");
    setMensajes(prev => [...prev, { rol: "usuario", texto: textoPregunta }]);
    setCargando(true);
    try {
      const respuesta = await fetch("http://localhost:3004/api/informes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: textoPregunta })
      });
      const data = await respuesta.json();
      if (data.success) {
        setMensajes(prev => [...prev, { rol: "asistente", texto: data.respuesta }]);
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

  const estiloMensaje = (rol) => {
    if (rol === "usuario") return {
      alignSelf: "flex-end", background: "#0077b6", color: "white",
      padding: "10px 16px", borderRadius: "18px 18px 4px 18px",
      maxWidth: "70%", fontSize: "14px"
    };
    if (rol === "error") return {
      alignSelf: "flex-start", background: "#fee2e2", color: "#991b1b",
      padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
      maxWidth: "70%", fontSize: "14px"
    };
    return {
      alignSelf: "flex-start", background: "white", color: "#333",
      padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
      maxWidth: "70%", fontSize: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    };
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "5px" }}>Chatbot Cordillera</h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Asistente inteligente powered by <strong>Ollama llama3.2</strong> via Circuit Breaker
        </p>

        <div style={{
          background: "#f8fafc", borderRadius: "12px", padding: "20px",
          height: "450px", overflowY: "auto", display: "flex",
          flexDirection: "column", gap: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          {mensajes.map((m, i) => (
            <div key={i} style={estiloMensaje(m.rol)}>
              {m.rol !== "usuario" && (
                <div style={{ fontSize: "11px", color: m.rol === "error" ? "#991b1b" : "#0077b6", marginBottom: "4px", fontWeight: "600" }}>
                  {m.rol === "asistente" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={gatoImg} style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }} alt="asistente" />
                      Asistente
                    </span>
                  ) : m.rol === "sistema" ? "ℹ️ Sistema" : "⚠️ Error"}
                </div>
              )}
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{m.texto}</div>
            </div>
          ))}

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
              padding: "12px 24px", background: cargando || !pregunta.trim() ? "#94a3b8" : "#0077b6",
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
    </div>
  );
}

export default Chatbot;