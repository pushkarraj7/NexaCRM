const FinanceDashboard = () => {
  return (
    <div style={styles.container}>
      <h1>Finance Dashboard</h1>

      <div style={styles.card}>Generate Agreement</div>
      <div style={styles.card}>Generate Invoice</div>
      <div style={styles.card}>Invoice List</div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  card: {
    padding: "15px",
    margin: "10px 0",
    background: "#fef3c7",
    borderRadius: "6px",
  },
};

export default FinanceDashboard;
