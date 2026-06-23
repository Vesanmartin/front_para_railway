// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "../styles/login.css";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode]             = useState("");
  const navigate = useNavigate();

  // PASO 1: LOGIN â€” valida credenciales y activa 2FA
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data.twoFactor) {
        alert("El cÃ³digo ha sido enviado a su correo");
        setShowCodeInput(true);
        return;
      }
    } catch (error) {
      setError("Credenciales incorrectas");
    }
  };

  // PASO 2: VERIFICAR CÃ“DIGO 2FA
  const verifyCode = async () => {
    try {
      const response = await fetch(
        "/api/auth/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        }
      );
      const data = await response.json();

      if (data.success) {
        // Guardar token JWT para requests autenticados
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        navigate("/dashboard");
      } else {
        setError("CÃ³digo incorrecto");
      }
    } catch (error) {
      setError("Error verificando cÃ³digo");
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
          placeholder="ContraseÃ±a"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="button">
          Ingresar
        </button>
        <p
  style={{
    color: "#007bff",
    cursor: "pointer",
    marginTop: "10px",
    textAlign: "center"
  }}
  onClick={() => navigate("/recuperar-password")}
>
  Â¿Olvidaste tu contraseÃ±a?
</p>
        {showCodeInput && (
          <div>
            <input
              type="text"
              placeholder="Ingrese cÃ³digo 2FA"
              className="input"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="button" className="button" onClick={verifyCode}>
              Verificar CÃ³digo
            </button>
          </div>
          
        )}
      </form>
      <div className="footer">
        Grupo Cordillera Â© 2026 | Cocq-Gallegos-San Martin-Vasquez
      </div>
    </div>
  );
}

export default Login;
