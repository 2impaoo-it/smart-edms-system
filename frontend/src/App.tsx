import { Routes, Route, Navigate } from "react-router-dom";
import AuthRoute from "./auth/AuthRoute";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Route công khai - Trang đăng nhập */}
      <Route path="/login" element={<Login />} />

      {/* Route được bảo vệ - Dashboard */}
      <Route
        path="/dashboard"
        element={
          <AuthRoute>
            <Dashboard />
          </AuthRoute>
        }
      />

      {/* Redirect mặc định: / -> /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all routes - redirect về login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
