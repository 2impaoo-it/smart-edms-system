import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { MainLayout } from "./components/layout/MainLayout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/dashboard",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: null, // MainLayout will handle the role-based dashboard if path is /dashboard
            },
            {
                path: "files",
                element: null, // Handled in MainLayout renderContent
            },
            {
                path: "department",
                element: null, // Handled in MainLayout renderContent
            },
            {
                path: "recycle-bin",
                element: null,
            },
            {
                path: "audit-logs",
                element: null, // Handled in MainLayout renderContent
            },
            {
                path: "approvals",
                element: null, 
            },
            {
                path: "signatures",
                element: null,
            },
            {
                path: "users",
                element: null,
            },
            {
                path: "storage",
                element: null,
            },
            {
                path: "settings",
                element: null,
            },
        ]
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
