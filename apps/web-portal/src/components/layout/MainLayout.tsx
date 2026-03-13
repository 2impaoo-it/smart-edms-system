import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { UserRole } from "../../lib/types";
import { FileExplorer } from "../../pages/FileExplorer";
import { PlaceholderPage } from "../../pages/PlaceholderPage";
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
    const currentUser: any = ([] as any[]).find(u => u.role === currentRole) || ({ id: "1", role: "MANAGER", name: "Mock User", email: "mock@mock.com", department: "IT", avatar: "", status: "active" } as any);

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
