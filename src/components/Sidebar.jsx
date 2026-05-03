import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Sidebar() {
  return (
    <div style={{
      width: "220px",
      background: "#2c3e50",
      color: "white",
      height: "100vh",
      padding: "20px"
    }}>

      {/* LOGO + NOMBRE */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px"
      }}>
        <img 
          src={logo} 
          alt="Logo Cordillera" 
          style={{ width: "40px" }}
        />
        <h2 style={{ margin: 0 }}>Cordillera</h2>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/dashboard" style={link}>Home</Link></li>
        <li><Link to="/ventas" style={link}>Ventas</Link></li>
        <li><Link to="/inventario" style={link}>Inventario</Link></li>
        <li><Link to="/clientes" style={link}>Clientes</Link></li>
      </ul>

    </div>
  );
}

const link = {
  color: "white",
  textDecoration: "none",
  display: "block",
  margin: "10px 0"
};

export default Sidebar;