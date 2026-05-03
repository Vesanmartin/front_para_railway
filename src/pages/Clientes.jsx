import { useState } from "react";
import "../styles/clientes.css";

function Clientes() {

  const [clientes, setClientes] = useState([
    { id: 1, nombre: "Juan Pérez", email: "juan@mail.com", telefono: "912345678", activo: true },
    { id: 2, nombre: "María López", email: "maria@mail.com", telefono: "987654321", activo: true }
  ]);

  const [busqueda, setBusqueda] = useState("");

  const [nuevo, setNuevo] = useState({
    nombre: "",
    email: "",
    telefono: ""
  });

  // KPIs
  const total = clientes.length;
  const activos = clientes.filter(c => c.activo).length;

  // Crear cliente
  const agregarCliente = () => {
    if (!nuevo.nombre) return;

    const nuevoCliente = {
      id: clientes.length + 1,
      ...nuevo,
      activo: true
    };

    setClientes([...clientes, nuevoCliente]);
    setNuevo({ nombre: "", email: "", telefono: "" });
  };

  // Eliminar
  const eliminarCliente = (id) => {
    setClientes(clientes.filter(c => c.id !== id));
  };

  // Activar / desactivar
  const toggleActivo = (id) => {
    setClientes(clientes.map(c =>
      c.id === id ? { ...c, activo: !c.activo } : c
    ));
  };

  // Filtro
  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="clientes-container">

      <h1>👥 Gestión de Clientes</h1>

      {/* KPIs */}
      <div className="clientes-kpis">

        <div className="card-kpi">
          <h3>Total Clientes</h3>
          <h1>{total}</h1>
        </div>

        <div className="card-kpi">
          <h3>Clientes Activos</h3>
          <h1>{activos}</h1>
        </div>

      </div>

      {/* Buscador */}
      <input
        className="buscador"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Formulario ADMIN */}
      <div className="form-admin">
        <h3>Agregar Cliente</h3>

        <input
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />

        <input
          placeholder="Email"
          value={nuevo.email}
          onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
        />

        <input
          placeholder="Teléfono"
          value={nuevo.telefono}
          onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
        />

        <button onClick={agregarCliente}>Agregar</button>
      </div>

      {/* Tabla */}
      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.email}</td>
              <td>{c.telefono}</td>

              <td>
                <span style={{
                  color: c.activo ? "green" : "red",
                  fontWeight: "bold"
                }}>
                  {c.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <button onClick={() => toggleActivo(c.id)}>
                  {c.activo ? "Desactivar" : "Activar"}
                </button>

                <button
                  style={{ background: "#e74c3c", color: "white", marginLeft: "5px" }}
                  onClick={() => eliminarCliente(c.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Clientes;