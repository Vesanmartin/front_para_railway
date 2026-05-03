import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/logo.png";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (usuario === "admin" && password === "1234") {
      navigate("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">

      {/* TEXTO BIENVENIDA */}
      <h1 style={{ color: "white", marginBottom: "20px" }}>
        Bienvenidos a Grupo Cordillera
      </h1>

      <form onSubmit={handleLogin} className="login-box">
        
        <img src={logo} alt="Logo Cordillera" className="logo" />

        <h2>Ingreso Sistema</h2>

        <input
          type="text"
          placeholder="Usuario"
          className="input"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button">Ingresar</button>
      </form>

      {/* Footer */}
      <div className="footer">
        Grupo Cordillera © 2026 | Tel: +56 9 1234 5678 | Fundada 2010
      </div>

    </div>
  );
}

export default Login;