// src/pages/Informes.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell, Legend
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const GATEWAY_URL = "https://backparaprobarrailway-production.up.railway.app";

const COLORES = ["#0077b6", "#00b4d8", "#48cae4", "#90e0ef", "#023e8a"];

const MESES = {
  1:"Ene", 2:"Feb", 3:"Mar", 4:"Abr", 5:"May", 6:"Jun",
  7:"Jul", 8:"Ago", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Dic"
};

function Informes() {
  const [datos, setDatos]                     = useState(null);
  const [cargando, setCargando]               = useState(true);
  const [error, setError]                     = useState(null);
  const [filtroAnio, setFiltroAnio]           = useState("");
  const [filtroMesInicio, setFiltroMesInicio] = useState("");
  const [filtroMesFin, setFiltroMesFin]       = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarDatos("", "", "");
  }, []);

  const cargarDatos = async (anio, mes_inicio, mes_fin) => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (anio)       params.append("año", anio);
      if (mes_inicio) params.append("mes_inicio", mes_inicio);
      if (mes_fin)    params.append("mes_fin", mes_fin);
      const url = `${GATEWAY_URL}/api/informes/datos-dashboard?${params.toString()}`;
      const respuesta = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await respuesta.json();
      if (json.success) {
        setDatos(json.datos);
      } else {
        setError("Error obteniendo datos");
      }
    } catch (err) {
      setError("No se pudo conectar con informes-service");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Cargando informes...</div>
    </div>
  );

  if (error) return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px", textAlign: "center", color: "#e63946" }}>{error}</div>
    </div>
  );

  const dataVentasMes = (datos.ventas_erp || []).map(v => ({
    periodo: `${MESES[v.mes]} ${v.año}`,
    ventas:  parseFloat(v.total_ventas),
  })).reverse();

  const dataProductos = (datos.top_productos || []).map(p => ({
    nombre: p.nombre_producto,
    total:  parseFloat(p.total_generado),
  }));

  const dataSucursales = (datos.ventas_por_sucursal || []).map(s => ({
    name:  s.sucursal,
    value: parseFloat(s.total_ventas)
  }));

  const dataComprasMes = (datos.compras_erp || []).map(v => ({
    periodo: `${MESES[v.mes]} ${v.año}`,
    compras: parseFloat(v.total_compras),
  })).reverse();

  const dataComparativo = dataVentasMes.map(v => {
    const compra = dataComprasMes.find(c => c.periodo === v.periodo);
    return { periodo: v.periodo, ventas: v.ventas, compras: compra ? compra.compras : 0 };
  });

  const totalVentas      = datos.ventas_erp?.reduce((acc, v) => acc + parseFloat(v.total_ventas), 0) || 0;
  const totalCompras     = datos.compras_erp?.reduce((acc, v) => acc + parseFloat(v.total_compras), 0) || 0;
  const porcentajeMargen = totalVentas > 0 ? (((totalVentas - totalCompras) / totalVentas) * 100).toFixed(1) : 0;

  const exportarPDF = async () => {
    const elemento = document.getElementById("contenido-informe");
    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const ancho = pdf.internal.pageSize.getWidth();
    const alto  = (canvas.height * ancho) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, ancho, alto);
    pdf.save(`informe_cordillera_${filtroAnio || "todos"}.pdf`);
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div id="contenido-informe" style={{ padding: "40px" }}>

        <h1 style={{ marginBottom: "5px" }}>Informes Cordillera</h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Datos reales desde MySQL via <strong>informes-service</strong> — Circuit Breaker activo
        </p>

        <div style={{ background: "white", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Año</label>
            <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", minWidth: "100px" }}>
              <option value="">Todos</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Mes inicio</label>
            <select value={filtroMesInicio} onChange={(e) => setFiltroMesInicio(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", minWidth: "120px" }}>
              <option value="">Todos</option>
              {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>Mes fin</label>
            <select value={filtroMesFin} onChange={(e) => setFiltroMesFin(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", minWidth: "120px" }}>
              <option value="">Todos</option>
              {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <button onClick={() => cargarDatos(filtroAnio, filtroMesInicio, filtroMesFin)}
            style={{ padding: "8px 20px", background: "#0077b6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", height: "36px" }}>
            Aplicar filtros
          </button>
          <button onClick={() => { setFiltroAnio(""); setFiltroMesInicio(""); setFiltroMesFin(""); cargarDatos("","",""); }}
            style={{ padding: "8px 20px", background: "#f1f5f9", color: "#555", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px", height: "36px" }}>
            Limpiar
          </button>
          <button onClick={exportarPDF}
            style={{ padding: "8px 20px", background: "#2a9d8f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", height: "36px", marginLeft: "auto" }}>
            Exportar PDF
          </button>
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <TarjetaResumen titulo="Total Transacciones ERP"
            valor={datos.ventas_erp?.reduce((acc, v) => acc + parseInt(v.cantidad_transacciones), 0).toLocaleString()}
            color="#0077b6" />
          <TarjetaResumen titulo="Ventas Totales ERP" valor={`$${parseInt(totalVentas).toLocaleString()}`} color="#00b4d8" />
          <TarjetaResumen titulo="Total Compras ERP" valor={`$${parseInt(totalCompras).toLocaleString()}`} color="#e63946" />
          <TarjetaResumen titulo="Margen Bruto" valor={`${porcentajeMargen}%`} color="#2a9d8f" />
          <TarjetaResumen titulo="Sucursales Activas" valor={dataSucursales.length} color="#48cae4" />
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", flex: 2, minWidth: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>Evolución de Ventas ERP</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dataVentasMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="ventas" stroke="#0077b6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", flex: 1, minWidth: "280px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>Ventas por Sucursal</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dataSucursales} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {dataSucursales.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>Ventas vs Compras por Mes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataComparativo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="ventas"  name="Ventas"  fill="#000d60" radius={[4,4,0,0]} />
              <Bar dataKey="compras" name="Compras" fill="#0891b2" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>Top 5 Productos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataProductos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12 }} width={160} />
              <Tooltip formatter={(v) => `$${parseInt(v).toLocaleString()}`} />
              <Bar dataKey="total" fill="#136a93" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

function TarjetaResumen({ titulo, valor, color }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "20px 30px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`, minWidth: "180px" }}>
      <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{titulo}</p>
      <p style={{ color, fontSize: "26px", fontWeight: "bold", margin: "5px 0 0" }}>{valor}</p>
    </div>
  );
}

export default Informes;