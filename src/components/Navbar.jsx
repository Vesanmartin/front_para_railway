// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";

function obtenerRol() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.rol;
  } catch {
    return null;
  }
}

function Navbar() {
  const navigate = useNavigate();
  const rol = obtenerRol();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{
      background: "#2c3e50",
      color: "white",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>
        Grupo Cordillera
      </span>

      <div style={{ display: "flex", gap: "20px" }}>

        {/* ADMIN — solo ve Admin en celeste */}
        {rol === "admin" && (
          <button onClick={() => navigate("/admin")}
            style={{ background: "transparent", color: "#48cae4", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
            Admin
          </button>
        )}

        {/* SUPERSAYAYIN — ve todos los módulos */}
        {rol === "supersayayin" && (
        <>
          <button onClick={() => navigate("/admin")}
            style={{ background: "transparent", color: "#48cae4", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
            Admin
         </button>
          <button onClick={() => navigate("/dashboard")}
            style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
            Dashboard
        </button>
          <button onClick={() => navigate("/kpi")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
           KPI
          </button>
          <button onClick={() => navigate("/chatbot")}
            style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
          Chatbot
          </button>
            <button onClick={() => navigate("/gestion")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
            Gestión
          </button>
          <button onClick={() => navigate("/importacion")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
            Importación
          </button>           
          <button onClick={() => navigate("/informes")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
          Informes
        </button>
          </>
          )}

        {/* GERENTE — ve Dashboard, KPI y Chatbot */}
        {rol === "gerente" && (
        <>
          <button onClick={() => navigate("/dashboard")}
            style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
            Dashboard
          </button>
          <button onClick={() => navigate("/kpi")}
            style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
            KPI
          </button>
          <button onClick={() => navigate("/chatbot")}
            style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
            Chatbot
          </button>
          <button onClick={() => navigate("/informes")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
          Informes
          </button>
           </>
          )}

        {/* OPERADOR — ve Gestión e Importación */}
        {rol === "operador" && (
          <>
            <button onClick={() => navigate("/gestion")}
              style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
              Gestión
            </button>
            <button onClick={() => navigate("/importacion")}
              style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
              Importación
            </button>
          </>
        )}
        <button
  onClick={() => navigate("/dashboard")}
  style={{
    background: "#3498db",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "6px 14px",
    borderRadius: "8px"
  }}
>
  🏠 Home
</button>

        <button onClick={cerrarSesion}
          style={{ background: "#e74c3c", color: "white", border: "none", cursor: "pointer", fontSize: "16px", padding: "6px 14px", borderRadius: "8px" }}>
          Cerrar Sesión
        </button>

      </div>
    </nav>
  );
}

export default Navbar;