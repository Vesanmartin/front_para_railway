import { useState } from "react";
import "../styles/inventario.css";

function Inventario() {

  const [productos, setProductos] = useState([
    { id: 1, nombre: "Laptop", stock: 10, precio: 550000 },
    { id: 2, nombre: "Mouse", stock: 50, precio: 8000 },
    { id: 3, nombre: "Teclado", stock: 30, precio: 15000 }
  ]);

  const [busqueda, setBusqueda] = useState("");

  const [nuevo, setNuevo] = useState({
    nombre: "",
    stock: "",
    precio: ""
  });

  // KPIs
  const totalProductos = productos.length;
  const totalStock = productos.reduce((acc, p) => acc + Number(p.stock), 0);
  const valorInventario = productos.reduce(
    (acc, p) => acc + p.stock * p.precio, 0
  );

  // Crear producto
  const agregarProducto = () => {
    if (!nuevo.nombre) return;

    const nuevoProd = {
      id: productos.length + 1,
      ...nuevo
    };

    setProductos([...productos, nuevoProd]);
    setNuevo({ nombre: "", stock: "", precio: "" });
  };

  // Eliminar
  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  // Filtro
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="inventario-container">

      <h1>📦 Gestión de Inventario</h1>

      {/* KPIs */}
      <div className="inventario-kpis">

        <div className="card-kpi">
          <h3>Productos</h3>
          <h1>{totalProductos}</h1>
        </div>

        <div className="card-kpi">
          <h3>Stock Total</h3>
          <h1>{totalStock}</h1>
        </div>

        <div className="card-kpi">
          <h3>Valor Inventario</h3>
          <h1>${valorInventario.toLocaleString()}</h1>
        </div>

      </div>

      {/* Buscador */}
      <input
        className="buscador"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Formulario ADMIN */}
      <div className="form-admin">
        <h3>Agregar Producto</h3>

        <input
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock"
          value={nuevo.stock}
          onChange={(e) => setNuevo({ ...nuevo, stock: e.target.value })}
        />

        <input
          type="number"
          placeholder="Precio"
          value={nuevo.precio}
          onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
        />

        <button onClick={agregarProducto}>Agregar</button>
      </div>

      {/* Tabla */}
      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td>${Number(p.precio).toLocaleString()}</td>
              <td>
                <button
                  style={{ background: "#e74c3c", color: "white" }}
                  onClick={() => eliminarProducto(p.id)}
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

export default Inventario;