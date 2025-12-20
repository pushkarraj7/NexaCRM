import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import AdminDashboard from "./components/pages/admin/pages/Dashboard";
import CustomerDashboard from "./components/pages/customer/Dashboard";
import FinanceDashboard from "./components/pages/finance/Dashboard";
import AdminCustomers from "./components/pages/admin/pages/Customers";
import Items from "./components/pages/admin/pages/Items";
import Agreements from "./components/pages/admin/pages/Agreements";
import Orders from "./components/pages/admin/pages/Orders";
import Analytics from "./components/pages/admin/pages/Analytics";

// ProtectedRoute Component
const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("role");

  if (!userRole) return <Navigate to="/" replace />; // Not logged in
  if (userRole !== role) return <Navigate to="/" replace />; // Wrong role

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute role="admin">
              <AdminCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items"
          element={
            <ProtectedRoute role="admin">
              <Items />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agreements"
          element={
            <ProtectedRoute role="admin">
              <Agreements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute role="admin">
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Customer Route */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Finance Route */}
        <Route
          path="/finance/dashboard"
          element={
            <ProtectedRoute role="finance">
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
