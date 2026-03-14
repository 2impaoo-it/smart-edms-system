import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "../../lib/types";
import { FileExplorer } from "../../pages/FileExplorer";
import { PlaceholderPage } from "../../pages/PlaceholderPage";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    time: string;
    isRead: boolean;
}

export function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize from localStorage
    const [currentUser, setCurrentUser] = useState<any>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : { id: "1", role: "MANAGER", name: "Mock User", email: "mock@mock.com", department: "IT", avatar: "", status: "active" }; // Fallback for dev mode
    });

    const currentRole: UserRole = currentUser?.role || 'STAFF';
    
    const currentFolderId = searchParams.get('folder');

    // --- MOCK NOTIFICATIONS SYSTEM ---
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [toasts, setToasts] = useState<AppNotification[]>([]);

    useEffect(() => {
        // Spam mock data every 5 seconds to test
        const interval = setInterval(() => {
            const types: ('info' | 'warning' | 'error' | 'success')[] = ['info', 'warning', 'error', 'success'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            const newNotif: AppNotification = {
                id: `notif_${Date.now()}`,
                title: `Thông báo mới ${Math.floor(Math.random() * 100)}`,
                message: "Hệ thống đang chạy tiến trình tự động. Vui lòng kiểm tra lại sau ít phút.",
                type: randomType,
                time: new Date().toLocaleTimeString(),
                isRead: false
            };

            setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10 in sidebar
            setToasts(prev => [newNotif, ...prev]);

            // Auto remove toast after 3 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newNotif.id));
            }, 3000);
        }, 5000); // spam every 5s

        return () => clearInterval(interval);
    }, []);

    // --- SECURITY: ADMIN CANNOT ACCESS PERSONAL FILES ---
    useEffect(() => {
        if (currentRole === 'ADMIN' && location.pathname === '/dashboard/files') {
            navigate('/dashboard', { replace: true });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRole, location.pathname]);

    const handleFolderChange = (id: string | null) => {
        if (id) setSearchParams({ folder: id });
        else {
            if (location.pathname === '/dashboard/department') setSearchParams({ folder: 'dept_root' });
            else setSearchParams({});
        }
    };

    useEffect(() => {
        if (location.pathname === '/dashboard/department' && !searchParams.get('folder')) {
            setSearchParams({ folder: 'dept_root' });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const renderContent = () => {
        if (location.pathname === '/dashboard/files') {
            if (currentRole === 'ADMIN') return <PlaceholderPage title="Dashboard Admin" />;
            return <FileExplorer title="Tài liệu cá nhân" currentFolderId={currentFolderId} onFolderChange={handleFolderChange} ownerId={currentUser.id} />;
        }
        
        if (location.pathname === '/dashboard/department') {
            return <FileExplorer title="Kho phòng ban" currentFolderId={currentFolderId} onFolderChange={handleFolderChange} ownerId={null} user={currentUser} />;
        }

        if (location.pathname === '/dashboard/recycle-bin') return <PlaceholderPage title="Thùng rác" />;
        if (location.pathname === '/dashboard/audit-logs') return <PlaceholderPage title="Nhật ký Hệ thống" />;
        if (location.pathname === '/dashboard/approvals') return <PlaceholderPage title="Quản lý Phê duyệt" />;
        if (location.pathname === '/dashboard/signatures') return <PlaceholderPage title="Quản lý Chữ ký" />;
        if (location.pathname === '/dashboard/users') return <PlaceholderPage title="Quản lý Người dùng" />;
        if (location.pathname === '/dashboard/storage') return <PlaceholderPage title="Quản lý Lưu trữ" />;
        if (location.pathname === '/dashboard/settings') return <PlaceholderPage title="Cài đặt Hệ thống" />;
        
        return <PlaceholderPage title={`Trang Tổng quan (${currentRole})`} />;
    };

    return (
        <div className="flex h-screen overflow-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-300 bg-slate-50 dark:bg-slate-950 relative">
            
            {/* Sidebar is now always visible */}
            <Sidebar role={currentRole} user={currentUser} notifications={notifications} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative z-10 pt-8">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-1000">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* --- TOAST NOTIFICATIONS (TOP RIGHT) --- */}
            <div className="fixed top-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="glass-panel bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl p-4 w-80 pointer-events-auto flex gap-3 items-start"
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                toast.type === 'info' ? "bg-blue-100 text-blue-600" :
                                toast.type === 'warning' ? "bg-amber-100 text-amber-600" :
                                toast.type === 'error' ? "bg-red-100 text-red-600" :
                                "bg-green-100 text-green-600"
                            )}>
                                {toast.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                 toast.type === 'error' ? <XCircle className="w-4 h-4" /> :
                                 toast.type === 'info' ? <Info className="w-4 h-4" /> :
                                 <CheckCircle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800">{toast.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{toast.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Cyber Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[150px] animate-pulse" />
            </div>
        </div>
    );
}
