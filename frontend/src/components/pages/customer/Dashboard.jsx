const CustomerDashboard = () => {
  return (
    <div style={styles.container}>
      <h1>Customer Dashboard</h1>

      <div style={styles.card}>Place Order</div>
      <div style={styles.card}>My Agreements</div>
      <div style={styles.card}>Order History</div>
      <div style={styles.card}>Invoices</div>
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
    background: "#ecfeff",
    borderRadius: "6px",
  },
};

export default CustomerDashboard;
