import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Files, PenTool, Users, Settings,
    LogOut, Menu, X, Bell, Search, Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { cn } from "../libs/utils";

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link to={path}>
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            active ? "bg-primary/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/5"
        )}>
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_#6366f1]" />}
            <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary" : "group-hover:text-primary")} />
            <span className="font-medium">{label}</span>
            {active && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />}
        </div>
    </Link>
);

export default function MainLayout() {
    const { user, logout } = useAuth();
    const { lastMessage, notifications, markAllAsRead } = useSocket();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notification UI State
    const [showNotifMenu, setShowNotifMenu] = useState(false);

    // Notification Toast State
    const [toast, setToast] = useState(null);

    // Watch for new socket messages
    useEffect(() => {
        if (lastMessage) {
            setToast(lastMessage);
            // Auto hide after 5s
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [lastMessage]);

    // Protect Route
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Define navigation items based on Role
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Files, label: "Documents", path: "/documents" },
        ...(user?.role === "ADMIN" ? [
            { icon: Users, label: "User Management", path: "/users" },
            { icon: Shield, label: "System Health", path: "/system" }
        ] : []),
        ...(user?.role === "MANAGER" ? [
            { icon: PenTool, label: "Signing Queue", path: "/signing-queue" }
        ] : []),
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    return (
        <div className="flex min-h-screen bg-background text-white selection:bg-primary/30">

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Glassmorphism */}
            <motion.aside
                className={cn(
                    "fixed md:sticky top-0 h-screen w-72 glass border-r border-white/5 z-50 flex flex-col transition-transform duration-300",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Files className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Smart E-DMS
                        </h1>
                        <p className="text-xs text-primary/80 font-mono">v2.0.0 • CYBER</p>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <div className="glass-input flex items-center gap-2 px-3 py-2 text-sm">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input type="text" placeholder="Quick search..." className="bg-transparent border-none outline-none text-white placeholder-gray-600 w-full" />
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <img src={user?.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-primary/50" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                        <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-400">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                        <span>Workspace</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-white">{location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}</span>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <button
                            onClick={() => {
                                setShowNotifMenu(!showNotifMenu);
                                if (!showNotifMenu && notifications.some(n => !n.read)) markAllAsRead();
                            }}
                            className="relative p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {notifications.some(n => !n.read) && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        <AnimatePresence>
                            {showNotifMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-12 right-0 w-80 glass-card bg-[#1a1f2e] border border-white/10 shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                                        <span className="text-xs text-gray-500">{notifications.length} recent</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {notifications.map(notif => (
                                                    <div key={notif.id} className={`p-4 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-success' :
                                                                    notif.type === 'warning' ? 'bg-warning' : 'bg-primary'
                                                                }`} />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-200">{notif.title}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{notif.msg}</p>
                                                                <p className="text-[10px] text-gray-600 mt-2">{notif.timestamp}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-white/5 bg-black/20 text-center">
                                        <button className="text-xs text-primary hover:text-white transition-colors">View All Activities</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-7xl mx-auto"
                    >
                        <Outlet />
                    </motion.div>
                </div>
                {/* Real-time Notification Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="fixed top-24 right-6 z-50 pointer-events-auto"
                        >
                            <div className="glass-card bg-[#1a1f2e] border-l-4 border-l-primary p-4 shadow-2xl min-w-[300px] flex items-start gap-3">
                                <div className="p-2 bg-primary/20 rounded-full text-primary mt-1">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white text-sm">{toast.title}</h4>
                                        <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white text-xs">&times;</button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{toast.msg}</p>
                                    <span className="text-[10px] text-gray-600 mt-2 block">{toast.timestamp}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
