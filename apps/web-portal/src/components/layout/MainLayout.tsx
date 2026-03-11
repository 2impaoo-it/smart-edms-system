
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { UserRole } from "../../lib/types";
import { AdminDashboard, ManagerDashboard, StaffDashboard } from "../../pages/Dashboard";
import { FileExplorer } from "../../pages/FileExplorer";
import { AdminAuditLogs } from "../../pages/AdminAuditLogs";
import { AdminSignatures } from "../../pages/AdminSignatures";
import { AdminUsers } from "../../pages/AdminUsers";
import { AdminStorage } from "../../pages/AdminStorage";
import { AdminSettings } from "../../pages/AdminSettings";
import { ManagerApprovals } from "../../pages/ManagerApprovals";
import { ManagerSignatures } from "../../pages/ManagerSignatures";
import { RecycleBin } from "../../pages/RecycleBin";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { cn } from "../../lib/utils";



export function MainLayout() {
    const [currentRole, setCurrentRole] = useState<UserRole>('MANAGER');
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [isHeaderHovered, setIsHeaderHovered] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const currentFolderId = searchParams.get('folder');
    const currentUser: any = ([] as any[]).find(u => u.role === currentRole) || ({ id: "1", role: "ADMIN", name: "Mock User", email: "mock@mock.com", department: "IT", avatar: "", status: "active" } as any);

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
            // Extra safety for Admin
            if (currentRole === 'ADMIN') return <AdminDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
            return <FileExplorer title="Tài liệu cá nhân" currentFolderId={currentFolderId} onFolderChange={handleFolderChange} ownerId={currentUser.id} />;
        }
        
        if (location.pathname === '/dashboard/department') {
            return <FileExplorer title="Kho phòng ban" currentFolderId={currentFolderId} onFolderChange={handleFolderChange} ownerId={null} user={currentUser} />;
        }

        if (location.pathname === '/dashboard/recycle-bin') {
            if (currentRole === 'ADMIN') return <AdminDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
            return <RecycleBin user={currentUser} />;
        }

        if (location.pathname === '/dashboard/audit-logs') {
            if (currentRole === 'ADMIN') return <AdminAuditLogs />;
            // Prevent others from viewing audit logs
            return <StaffDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
        }

        if (location.pathname === '/dashboard/approvals') {
            if (currentRole === 'MANAGER') return <ManagerApprovals />;
            return <div className="p-10 text-center glass-panel rounded-3xl mt-10 shadow-sm border-white/60"><p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Giao diện Danh sách trình ký (Đang phát triển)</p></div>;
        }

        if (location.pathname === '/dashboard/signatures') {
            if (currentRole === 'ADMIN') return <AdminSignatures />;
            if (currentRole === 'MANAGER') return <ManagerSignatures />;
            return <div className="p-10 text-center glass-panel rounded-3xl mt-10 shadow-sm border-white/60"><p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Không có quyền truy cập</p></div>;
        }

        if (location.pathname === '/dashboard/users') {
            if (currentRole === 'ADMIN') return <AdminUsers currentUser={currentUser} />;
            return <div className="p-10 text-center glass-panel rounded-3xl mt-10 shadow-sm border-white/60"><p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Không có quyền truy cập</p></div>;
        }

        if (location.pathname === '/dashboard/storage') {
            if (currentRole === 'ADMIN') return <AdminStorage />;
            return <div className="p-10 text-center glass-panel rounded-3xl mt-10 shadow-sm border-white/60"><p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Không có quyền truy cập</p></div>;
        }
        
        if (location.pathname === '/dashboard/settings') {
            if (currentRole === 'ADMIN') return <AdminSettings />;
            return <div className="p-10 text-center glass-panel rounded-3xl mt-10 shadow-sm border-white/60"><p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Không có quyền truy cập</p></div>;
        }
        
        switch(currentRole) {
            case 'ADMIN': return <AdminDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
            case 'MANAGER': return <ManagerDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
            case 'STAFF': return <StaffDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
            default: return <StaffDashboard user={currentUser} onNavigate={(path) => navigate(path)} />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
            
            {/* --- TRIGGER ZONES --- */}
            <div 
                className="fixed top-0 left-0 bottom-0 w-2 z-[60]" 
                onMouseEnter={() => setIsSidebarHovered(true)}
            />
            <div 
                className="fixed top-0 left-0 right-0 h-2 z-[60]" 
                onMouseEnter={() => setIsHeaderHovered(true)}
            />

            {/* Sidebar with hover control */}
            <div onMouseLeave={() => setIsSidebarHovered(false)} className="h-full">
                <Sidebar role={currentRole} isHovered={isSidebarHovered} />
            </div>

            {/* Main Content with dynamic push */}
            <div 
                className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-500 ease-[0.23,1,0.32,1]"
                style={{ 
                    marginLeft: isSidebarHovered ? 'var(--sidebar-width)' : '0px',
                    paddingTop: isHeaderHovered ? 'var(--header-height)' : '0px'
                }}
            >
                <div onMouseLeave={() => setIsHeaderHovered(false)}>
                    <Header 
                        user={currentUser} 
                        currentFolderId={currentFolderId}
                        onBreadcrumbClick={handleFolderChange}
                        isVisible={isHeaderHovered}
                    />
                </div>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative z-10">


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
