// frontend-template/vite/src/ui-component/cards/KPIBox.jsx
export default function KPIBox({ title, value, color = "#2381C0" }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}33, ${color}66)`,
        padding: 20,
        borderRadius: 12,
        minWidth: 140,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
    >
      <h4 style={{ color: "#16496E", marginBottom: 8 }}>{title}</h4>
      <p style={{ fontSize: 24, fontWeight: "bold", color: "#16496E", margin: 0 }}>{value}</p>
    </div>
  );
}