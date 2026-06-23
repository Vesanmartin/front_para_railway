function KpiCard({ titulo, valor }) {
  return (
    <div style={{
      background: "white",
      padding: "25px",
      borderRadius: "12px",
      width: "220px",
      textAlign: "center",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
    }}>
      <h3 style={{ color: "#666" }}>{titulo}</h3>
      <h1 style={{ color: "#2c3e50" }}>{valor}</h1>
    </div>
  );
}

export default KpiCard;
