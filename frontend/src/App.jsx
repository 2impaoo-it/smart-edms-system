import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import DocumentExplorer from "./pages/DocumentExplorer";
import UserManagement from "./pages/UserManagement";
import { DocumentsPage, UsersPage } from './pages/Placeholders';
import SigningQueuePage from './pages/SigningQueue';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes (Wrapped in MainLayout) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="documents" element={<DocumentExplorer />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="signing-queue" element={<SigningQueuePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
