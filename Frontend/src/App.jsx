// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import CreateUser from "./components/CreateUser";
import QRPage from "./components/QRPage";
import ScanPage from "./components/QRScanner";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CreateUser />
            </ProtectedRoute>
          }
        />

        {/* Cashier routes */}
        <Route
          path="/scan"
          element={
            <ProtectedRoute roles={["cashier"]}>
              <ScanPage />
            </ProtectedRoute>
          }
        />

        {/* Member routes */}
        <Route
          path="/qr"
          element={
            <ProtectedRoute roles={["user"]}>
              <QRPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
