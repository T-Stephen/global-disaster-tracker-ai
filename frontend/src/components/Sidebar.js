import React from "react";

const Sidebar = ({ disasters, searchTerm, setSearchTerm }) => {
  // Count disasters by risk
  const total = disasters.length;
  const high = disasters.filter(d => d.risk === "High").length;
  const medium = disasters.filter(d => d.risk === "Medium").length;
  const low = disasters.filter(d => d.risk === "Low").length;

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.header}>📊 Disaster Stats</h2>

      <div style={styles.statsBox}>
        <p><strong>Total Disasters:</strong> {total}</p>
        <p style={{ color: "red" }}>High Risk: {high}</p>
        <p style={{ color: "orange" }}>Medium Risk: {medium}</p>
        <p style={{ color: "green" }}>Low Risk: {low}</p>
      </div>

      <div style={styles.searchBox}>
        <h3>🔍 Search by Location</h3>
        <input
          type="text"
          placeholder="Enter location name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
        />
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "300px",
    background: "#1e1e2f",
    color: "white",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "80vh",
    borderRadius: "10px",
    margin: "10px",
  },
  header: {
    textAlign: "center",
    marginBottom: "15px",
  },
  statsBox: {
    background: "#2c2c3e",
    padding: "10px",
    borderRadius: "8px",
  },
  searchBox: {
    marginTop: "20px",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
  },
};

export default Sidebar;
