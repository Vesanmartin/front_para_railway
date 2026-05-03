import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import KpiCard from "../components/KpiCard";
import { obtenerKPIs } from "../services/api";

function Dashboard() {

  const data = obtenerKPIs();
  const navigate = useNavigate();

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>
      
      <Navbar />

      <div style={{
        padding: "40px",
        display: "flex",
        gap: "30px",
        justifyContent: "center",
        flexWrap: "wrap"
      }}>

        <div onClick={() => navigate("/ventas")}>
          <KpiCard titulo="Ventas" valor={data.ventas} />
        </div>

        <div onClick={() => navigate("/inventario")}>
          <KpiCard titulo="Inventario" valor={data.inventario} />
        </div>

        <div onClick={() => navigate("/clientes")}>
          <KpiCard titulo="Clientes" valor={data.clientes} />
        </div>

      </div>

    </div>
  );
}

export default Dashboard;