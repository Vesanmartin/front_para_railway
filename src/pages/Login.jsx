// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "../styles/login.css";
import logo from "../assets/logo.png";

const GATEWAY_URL = "https://backparaprobarrailway-production.up.railway.app";

function Login() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode]                 = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data.twoFactor) {
        alert("El código ha sido enviado a su correo");
        setShowCodeInput(true);
        return;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Credenciales incorrectas");
    }
  };

  const verifyCode = async () => {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        navigate("/dashboard");
      } else {
        setError("Código incorrecto");
      }
    } catch (error) {
      setError("Error verificando código");
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
        <button type="submit" className="button">Ingresar</button>
        <p
          style={{ color: "#007bff", cursor: "pointer", marginTop: "10px", textAlign: "center" }}
          onClick={() => navigate("/recuperar-password")}
        >
          ¿Olvidaste tu contraseña?
        </p>
        {showCodeInput && (
          <div>
            <input
              type="text"
              placeholder="Ingrese código 2FA"
              className="input"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="button" className="button" onClick={verifyCode}>
              Verificar Código
            </button>
          </div>
        )}
      </form>
      <div className="footer">
        Grupo Cordillera © 2026 | Cocq-Gallegos-San Martin-Vasquez
      </div>
    </div>
  );
}

export default Login;