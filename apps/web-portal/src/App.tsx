import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

import { Login } from "./pages/Login";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
// Import các trang cần thiết
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Settings } from "./pages/Settings";
import { Approvals } from "./pages/Approvals";
const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/dashboard",
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: null, // Routed in MainLayout
                    },
                    {
                        path: "files",
                        element: null, // Dành riêng spotlight cho task EDMS-50
                    },
                    {
                        path: "department",
                        element: <PlaceholderPage title="Quản lý Phòng ban" />,
                    },
                    {
                        path: "recycle-bin",
                        element: <PlaceholderPage title="Thùng rác" />,
                    },
                    {
                        path: "audit-logs",
                        element: <PlaceholderPage title="Nhật ký Hệ thống (Audit Logs)" />,
                    },
                    {
                        path: "approvals",
                        element: <Approvals />,
                    },
                    {
                        path: "signatures",
                        element: <PlaceholderPage title="Quản lý Chữ ký" />,
                    },
                    {
                        path: "users",
                        element: <PlaceholderPage title="Quản lý Người dùng" />,
                    },
                    {
                        path: "storage",
                        element: <PlaceholderPage title="Quản lý Lưu trữ" />,
                    },
                    {
                        path: "settings",
                        element: <Settings />,
                    },
                ]
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    }
]);

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <GooeyToaster 
                position="bottom-right"
                toastOptions={{
                    className: "glass-panel bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(99,102,241,0.15)] font-bold",
                    style: {
                        borderRadius: "24px",
                    }
                }}
            />
        </>
    );
}
export default App;
