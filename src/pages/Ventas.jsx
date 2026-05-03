import { useState } from "react";
import "../styles/ventas.css";

function Ventas() {

  const [ventas, setVentas] = useState([
    { id: 1, cliente: "Juan Pérez", monto: 120000, fecha: "2026-06-01" },
    { id: 2, cliente: "María López", monto: 85000, fecha: "2026-06-02" }
  ]);

  const [busqueda, setBusqueda] = useState("");

  const [nuevaVenta, setNuevaVenta] = useState({
    cliente: "",
    monto: "",
    fecha: ""
  });

  // Crear venta
  const agregarVenta = () => {
    const nueva = {
      id: ventas.length + 1,
      ...nuevaVenta
    };
    setVentas([...ventas, nueva]);
    setNuevaVenta({ cliente: "", monto: "", fecha: "" });
  };

  // Eliminar venta
  const eliminarVenta = (id) => {
    setVentas(ventas.filter(v => v.id !== id));
  };

  // Filtro
  const filtradas = ventas.filter(v =>
    v.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  // KPI
  const total = ventas.reduce((acc, v) => acc + Number(v.monto), 0);

  return (
    <div className="ventas-container">

      <h1>📊 Panel Administrativo de Ventas</h1>

      {/* KPIs */}
        <div className="ventas-kpis">

    <div className="card-kpi">
      <h3>Total Ventas</h3>
      <h1>${total.toLocaleString()}</h1>
    </div>

    <div className="card-kpi">
      <h3>Cantidad de Ventas</h3>
      <h1>{ventas.length}</h1>
    </div>

  </div>
      

      {/* BUSCADOR */}
      <input
        className="buscador"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* FORMULARIO ADMIN */}
      <div className="form-admin">
        <h3>Agregar Venta</h3>

        <input
          placeholder="Cliente"
          value={nuevaVenta.cliente}
          onChange={(e) =>
            setNuevaVenta({ ...nuevaVenta, cliente: e.target.value })
          }
        />

        <input
          placeholder="Monto"
          type="number"
          value={nuevaVenta.monto}
          onChange={(e) =>
            setNuevaVenta({ ...nuevaVenta, monto: e.target.value })
          }
        />

        <input
          type="date"
          value={nuevaVenta.fecha}
          onChange={(e) =>
            setNuevaVenta({ ...nuevaVenta, fecha: e.target.value })
          }
        />

        <button onClick={agregarVenta}>Agregar</button>
      </div>

      {/* TABLA */}
      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtradas.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.cliente}</td>
              <td>${Number(v.monto).toLocaleString()}</td>
              <td>{v.fecha}</td>
              <td>
                <button onClick={() => eliminarVenta(v.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1 style={{ marginBottom: "20px" }}>
   
</h1>
<div className="ventas-kpis">...</div>
<div className="filtros">...</div>
<div className="tabla-container">...</div>

    </div>
  );
}

export default Ventas;