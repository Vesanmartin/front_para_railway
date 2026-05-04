// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

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
        <button onClick={() => navigate("/dashboard")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
          Dashboard
        </button>
        <button onClick={() => navigate("/gestion")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
          Gestión
        </button>
        <button onClick={() => navigate("/importacion")}
          style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}>
          Importación
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