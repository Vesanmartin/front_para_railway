// src/pages/Admin.jsx
// Panel exclusivo para el administrador del sistema
// Permite gestionar usuarios, roles, perfiles y doble autenticación
// PATRÓN: Strategy — los permisos de cada usuario se obtienen desde
// el auth-service según su rol (EstrategiaAdmin, EstrategiaGerente, EstrategiaOperador)

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const GATEWAY_URL = "https://backparaprobarrailway-production.up.railway.app";

function Admin() {
  //Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState({});
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: "", password: "", rol: "operador" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem("token");

  // Cargar usuarios reales desde auth-service
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const respuesta = await fetch(`${GATEWAY_URL}/api/auth/users`);
      const data = await respuesta.json();
      if (Array.isArray(data)) {
        setUsuarios(data);
        data.forEach(u => cargarPermisos(u.email, u.rol || "operador"));
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  const cargarPermisos = async (email, rol) => {
    try {
      const respuesta = await fetch(`${GATEWAY_URL}/api/auth/permisos?rol=${rol}`);
      const data = await respuesta.json();
      setPerfiles(prev => ({
        ...prev,
        [email]: {
          ...data,
          dobleAuth: false,
          rol
        }
      }));
    } catch (err) {
      console.error("Error cargando permisos:", err);
    }
  };

  const crearUsuario = async () => {
    if (!nuevoUsuario.email || !nuevoUsuario.password) {
      setMensaje({ texto: "Email y password son obligatorios", tipo: "error" });
      return;
    }
    setCargando(true);
    try {
      const respuesta = await fetch(`${GATEWAY_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nuevoUsuario.email, password: nuevoUsuario.password })
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        setMensaje({ texto: `Usuario ${nuevoUsuario.email} creado correctamente`, tipo: "exito" });
        const dataUsuarios = await fetch(`${GATEWAY_URL}/api/auth/users`);
        const listaUsuarios = await dataUsuarios.json();
        const usuarioNuevo = listaUsuarios.find(u => u.email === nuevoUsuario.email);
        if (usuarioNuevo) {
          await fetch(`${GATEWAY_URL}/api/auth/usuarios/${usuarioNuevo.id}/rol`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rol: nuevoUsuario.rol })
          });
        }
        await cargarUsuarios();
        setNuevoUsuario({ email: "", password: "", rol: "operador" });
      } else {
        setMensaje({ texto: data.error || "Error al crear usuario", tipo: "error" });
      }
    } catch (err) {
      setMensaje({ texto: "Error conectando con auth-service", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const cambiarRol = async (id, email, nuevoRol) => {
    try {
      const respuesta = await fetch(`${GATEWAY_URL}/api/auth/usuarios/${id}/rol`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol: nuevoRol })
      });
      const data = await respuesta.json();
      if (data.success) {
        await cargarPermisos(email, nuevoRol);
      } else {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Error actualizando rol:", err);
    }
  };

  const toggleDobleAuth = (email) => {
    setPerfiles(prev => ({
      ...prev,
      [email]: { ...prev[email], dobleAuth: !prev[email]?.dobleAuth }
    }));
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1 style={{ marginBottom: "5px" }}>Panel de Administración</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Gestión de usuarios, roles y permisos — Solo accesible para administradores
        </p>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px" }}>Crear nuevo usuario</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            <input placeholder="Email" value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", flex: 2 }} />
            <input placeholder="Password" type="password" value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", flex: 2 }} />
            <select value={nuevoUsuario.rol}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 }}>
              <option value="operador">Operador</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={crearUsuario} disabled={cargando}
              style={{ padding: "10px 24px", background: cargando ? "#94a3b8" : "#0077b6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
              {cargando ? "Creando..." : "+ Crear Usuario"}
            </button>
          </div>
          {mensaje.texto && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
              background: mensaje.tipo === "exito" ? "#d1fae5" : "#fee2e2",
              color: mensaje.tipo === "exito" ? "#065f46" : "#991b1b"
            }}>
              {mensaje.texto}
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0 }}>Usuarios del sistema</h3>
            <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0" }}>
              Los módulos se asignan automáticamente según el rol via Strategy Pattern
            </p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Email</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Rol</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Doble Auth</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#555" }}>Módulos permitidos</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr><td colSpan="4" style={{ padding: "30px", textAlign: "center", color: "#999" }}>Cargando usuarios...</td></tr>
              )}
              {usuarios.map((u, i) => {
                const perfil = perfiles[u.email];
                return (
                  <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: "500" }}>{u.email}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={perfil?.rol || u.rol || "operador"}
                        onChange={(e) => cambiarRol(u.id, u.email, e.target.value)}
                        style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}>
                        <option value="operador">Operador</option>
                        <option value="gerente">Gerente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => toggleDobleAuth(u.email)}
                        style={{
                          padding: "5px 16px", borderRadius: "20px", border: "none", cursor: "pointer",
                          fontSize: "12px", fontWeight: "600",
                          background: perfil?.dobleAuth ? "#d1fae5" : "#f1f5f9",
                          color: perfil?.dobleAuth ? "#065f46" : "#94a3b8"
                        }}>
                        {perfil?.dobleAuth ? "✓ Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {perfil?.modulos && Object.entries(perfil.modulos).map(([mod, activo]) => (
                          <span key={mod} style={{
                            padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                            background: activo ? "#dbeafe" : "#f1f5f9",
                            color: activo ? "#1e40af" : "#94a3b8",
                            fontWeight: activo ? "600" : "normal"
                          }}>
                            {mod}
                          </span>
                        ))}
                        {!perfil && <span style={{ color: "#94a3b8", fontSize: "13px" }}>Cargando...</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;