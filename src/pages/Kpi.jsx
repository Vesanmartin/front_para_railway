// src/pages/Kpi.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const GATEWAY_URL = "https://backparaprobarrailway-production.up.railway.app";
const COLORES = ["#0077b6", "#00b4d8", "#48cae4", "#90e0ef", "#023e8a"];

function Kpi() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const respuesta = await fetch(`${GATEWAY_URL}/api/kpis/dashboard`);
      const data = await respuesta.json();
      if (data.success) setDatos(data);
    } catch (err) {
      console.error("Error cargando KPIs:", err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Cargando KPIs...</div>
    </div>
  );

  const dataCategorias = datos?.categorias?.map(c => ({
    name: c.categoria,
    valor: parseFloat(c.total)
  })) || [];

  const dataPie = datos?.categorias?.map(c => ({
    name: c.categoria,
    value: parseInt(c.cantidad)
  })) || [];

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1 style={{ marginBottom: "5px" }}>Indicadores KPI</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Datos reales de los dos últimos meses (cargados en sistema) vía Factory Method
        </p>

        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <TarjetaKPI titulo="Total Transacciones" valor={datos?.ventas?.totalVentas?.toLocaleString()} color="#0077b6" />
          <TarjetaKPI titulo="Volumen total operaciones" valor={`$${parseInt(datos?.ventas?.ingresoTotal).toLocaleString()}`} color="#00b4d8" />
          <TarjetaKPI titulo="Ticket Promedio" valor={`$${parseInt(datos?.ventas?.ticketPromedio).toLocaleString()}`} color="#48cae4" />
          <TarjetaKPI titulo="Margen Rentabilidad" valor={datos?.rentabilidad?.margen} color="#023e8a" />
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", flex: 2, minWidth: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>Ventas por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
                <Bar dataKey="valor" fill="#0077b6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "24px", flex: 1, minWidth: "280px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>Distribución por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {dataPie.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginTop: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", color: "#333" }}>Top Categorías</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Categoría</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Transacciones</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              {datos?.categorias?.map((c, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{c.categoria}</td>
                  <td style={{ padding: "12px", color: "#666" }}>{parseInt(c.cantidad).toLocaleString()}</td>
                  <td style={{ padding: "12px", color: "#0077b6", fontWeight: "600" }}>${parseInt(c.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TarjetaKPI({ titulo, valor, color }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`, minWidth: "180px" }}>
      <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{titulo}</p>
      <p style={{ color, fontSize: "28px", fontWeight: "bold", margin: "5px 0 0" }}>{valor}</p>
    </div>
  );
}

export default Kpi;