// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "../styles/login.css";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    console.log("handleLogin ejecutado", email, password);
    setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">
      <h1 style={{ color: "white", marginBottom: "20px" }}>
        Bienvenidos a Grupo Cordillera
      </h1>

      <form onSubmit={handleLogin} className="login-box">
        <img src={logo} alt="Logo Cordillera" className="logo" />
        <h2>Ingreso Sistema</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          type="button"
          className="button"
          onClick={handleLogin}
      >
      Ingresar
</button>
      </form>

      <div className="footer">
        Grupo Cordillera © 2026 | Cocq-Gallegos-San Martin- Vasquez
      </div>
    </div>
  );
}

export default Login;