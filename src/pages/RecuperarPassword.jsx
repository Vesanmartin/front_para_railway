import { useState } from "react";

function RecuperarPassword() {
  const [email, setEmail] = useState("");

  const enviarSolicitud = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      alert(data.message);
    } catch (error) {
      alert("Error al enviar solicitud");
    }
  };
return (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f5f5f5"
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}
    >
      <h2>Recuperar Contraseña</h2>

      <input
        type="email"
        placeholder="Ingrese su correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "250px",
          padding: "10px",
          marginBottom: "15px"
        }}
      />

      <br />

      <button onClick={enviarSolicitud}>
        Enviar
      </button>
    </div>
  </div>
);
}

export default RecuperarPassword;