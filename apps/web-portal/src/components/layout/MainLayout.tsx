import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "../../lib/types";
import { FileExplorer } from "../../pages/FileExplorer";
import { PlaceholderPage } from "../../pages/PlaceholderPage";
import { AdminDashboard, ManagerDashboard, StaffDashboard } from "../../pages/Dashboard";
import { Approvals } from "../../pages/Approvals";
import { UserManagement } from "../../pages/UserManagement";
import { StorageManagement } from "../../pages/StorageManagement";
import { SystemLogs } from "../../pages/SystemLogs";
import { Settings } from "../../pages/Settings";
import { RecycleBin } from "../../pages/RecycleBin";
import { SignatureManagement } from "../../pages/SignatureManagement";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { gooeyToast as toast } from "goey-toast";

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

    // Lấy thông tin user từ localStorage, đã được kiểm tra ở ProtectedRoute
    const [currentUser, setCurrentUser] = useState<any>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null; 
    });

    useEffect(() => {
        const handleUserUpdate = () => {
            const stored = localStorage.getItem('user');
            if (stored) setCurrentUser(JSON.parse(stored));
        };
        window.addEventListener('user-updated', handleUserUpdate);
        return () => window.removeEventListener('user-updated', handleUserUpdate);
    }, []);

    const currentRole: UserRole = currentUser?.role || 'STAFF';
    
    const currentFolderId = searchParams.get('folder');

    // --- REAL-TIME NOTIFICATIONS SYSTEM ---
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('token');
        if (!stored || !currentUser) return;

        // Fetch full user details to get real numeric ID
        import("../../services/userService").then(m => m.getOrgChart()).then(res => {
            if (Array.isArray(res.data)) {
                const fullInfo = res.data.find((u: any) => u.username === currentUser.username || u.username === currentUser.id);
                if (fullInfo) {
                    const updated = { ...currentUser, ...fullInfo };
                    if (JSON.stringify(updated) !== JSON.stringify(currentUser)) {
                        localStorage.setItem('user', JSON.stringify(updated));
                        setCurrentUser(updated);
                        window.dispatchEvent(new Event('user-updated'));
                    }
                }
            }
        }).catch(console.error);

        // Khởi tạo Socket
        import("../../services/socketService").then(({ initSocket }) => {
            const socket = initSocket(currentUser.id);
            if (!socket) return;

            // Lắng nghe thông báo chuẩn (Object)
            socket.on("NOTIFICATION", (data: any) => {
                const payload = typeof data === 'string' ? { message: data, title: 'Thông báo' } : data;
                
                const newNotif: AppNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: payload.title || 'Thông báo mới',
                    message: payload.message,
                    type: payload.type || 'info',
                    time: 'Vừa xong',
                    isRead: false
                };
                setNotifications(prev => [newNotif, ...prev]);
                
                // Hiển thị Toast (socketService đã xử lý toast, nhưng ở đây ta có thể cập nhật thêm state UI)
            });

            // Lắng nghe audit log (Realtime Dashboard)
            socket.on("new_audit_log", (log: any) => {
                const newNotif: AppNotification = {
                    id: log._id || Math.random().toString(36).substr(2, 9),
                    title: 'Hành động hệ thống',
                    message: `${log.actorName || 'Ai đó'} vừa thực hiện ${log.action}`,
                    type: 'success',
                    time: 'Vừa xong',
                    isRead: false
                };
                setNotifications(prev => [newNotif, ...prev]);
            });
        });

        return () => {
            import("../../services/socketService").then(({ disconnectSocket }) => disconnectSocket());
        };
    }, [currentUser]);

    // --- SECURITY: ADMIN CANNOT ACCESS PERSONAL/DEPARTMENT FILES ---
    useEffect(() => {
        if (currentRole === 'ADMIN' && (location.pathname === '/dashboard/files' || location.pathname === '/dashboard/department')) {
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
            return <FileExplorer title="Tài liệu cá nhân" currentFolderId={currentFolderId} onFolderChange={handleFolderChange} ownerId={currentUser.id} user={currentUser} folderType="PERSONAL" />;
        }
        
        if (location.pathname === '/dashboard/department') {
            return <FileExplorer title="Kho phòng ban" currentFolderId={currentFolderId} onFolderChange={handleFolderChange} ownerId={null} user={currentUser} folderType="DEPARTMENT" />;
        }

        if (location.pathname === '/dashboard/recycle-bin') return <RecycleBin />;
        if (location.pathname === '/dashboard/audit-logs') return <SystemLogs />;
        if (location.pathname === '/dashboard/approvals') return <Approvals />;
        if (location.pathname === '/dashboard/signatures') return <SignatureManagement />;
        if (location.pathname === '/dashboard/users') return <UserManagement />;
        if (location.pathname === '/dashboard/storage') return <StorageManagement />;
        if (location.pathname === '/dashboard/settings') return <Settings />;
        
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            if (currentRole === 'ADMIN') return <AdminDashboard user={currentUser} onNavigate={navigate} />;
            if (currentRole === 'MANAGER') return <ManagerDashboard user={currentUser} onNavigate={navigate} />;
            return <StaffDashboard user={currentUser} onNavigate={navigate} />;
        }
        
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

            {/* Cyber Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[150px] animate-pulse" />
            </div>
        </div>
    );
}
