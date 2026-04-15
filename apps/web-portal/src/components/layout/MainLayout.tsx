import React, { useState, useEffect } from "react";
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
import ApprovalManagementPage from "../../pages/ApprovalManagement";
import { ReminderManagement } from "../../pages/ReminderManagement";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { gooeyToast as toast } from "goey-toast";

import { initSocket, disconnectSocket } from "../../services/socketService";

interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    time: string;
    isRead: boolean;
    category?: 'DOCUMENT' | 'FEED' | 'SYSTEM' | 'AUTH';
    targetId?: string;
}

export function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

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

    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const addNotification = (notif: Partial<AppNotification>) => {
        const newNotif: AppNotification = {
            id: Math.random().toString(36).substr(2, 9),
            title: notif.title || 'Thông báo',
            message: notif.message || '',
            type: notif.type || 'info',
            time: 'Vừa xong',
            isRead: false,
            category: notif.category,
            targetId: notif.targetId
        };
        setNotifications(prev => [newNotif, ...prev]);
        
        // Show toast based on type
        if (newNotif.type === 'success') toast.success(newNotif.title, { description: newNotif.message });
        else if (newNotif.type === 'error') toast.error(newNotif.title, { description: newNotif.message });
        else if (newNotif.type === 'warning') toast.warning(newNotif.title, { description: newNotif.message });
        else toast.info(newNotif.title, { description: newNotif.message });
    };

    useEffect(() => {
        const stored = localStorage.getItem('token');
        if (!stored || !currentUser) return;

        // Sync user info
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

        const s = initSocket(currentUser.id);
        
        // Define listeners with references so we can remove them specifically without breaking other components
        const handleSysNotification = (msg: string) => {
            addNotification({ title: 'Hệ thống', message: msg, type: 'info' });
        };
        const handleNewPost = (data: any) => {
            if (data.authorId !== currentUser.id && data.authorId !== Number(currentUser.id)) {
                addNotification({ 
                    title: 'Bảng tin mới', 
                    message: `${data.authorName || 'Một người'} vừa đăng bài viết mới.`,
                    type: 'info',
                    category: 'FEED',
                    targetId: data._id || data.id
                });
            }
        };
        const handleNewComment = ({ postId, comment }: any) => {
            if (comment.userId !== currentUser.id && comment.userId !== Number(currentUser.id)) {
                addNotification({ 
                    title: 'Bình luận mới', 
                    message: `${comment.userName || 'Ai đó'} vừa bình luận.`,
                    type: 'info',
                    category: 'FEED',
                    targetId: postId
                });
            }
        };
        const handleAuditLog = (log: any) => {
            if (currentRole === 'ADMIN') {
                addNotification({ 
                    id: log._id,
                    title: 'Nhật ký hệ thống',
                    message: `[${log.category}] ${log.actorName || 'Hệ thống'} thực hiện: ${log.action}`,
                    type: 'info',
                    category: 'SYSTEM'
                });
            }
        };

        // Fallback for mocked Spring Boot events until backend is fully integrated
        const handleDocApproved = (data: any) => {
            addNotification({ 
                title: 'Tài liệu đã được duyệt', 
                message: `Tài liệu "${data.name}" của bạn đã được phê duyệt bởi ${data.approverName}`,
                type: 'success',category: 'DOCUMENT',targetId: data.id
            });
        };
        const handleDocSigned = (data: any) => {
            addNotification({ 
                title: 'Tài liệu đã ký số', 
                message: `Tài liệu "${data.name}" đã hoàn tất việc ký số.`,
                type: 'success', category: 'DOCUMENT', targetId: data.id
            });
        };
        const handlePendingApproval = (data: any) => {
            addNotification({ 
                title: 'Yêu cầu phê duyệt mới', 
                message: `Nhân viên ${data.staffName} vừa trình ký tài liệu: ${data.documentName}`,
                type: 'warning', category: 'DOCUMENT', targetId: data.id
            });
        };

        if (s) {
            // --- COMMON EVENTS ---
            s.on("NOTIFICATION", handleSysNotification);
            s.on("NEW_POST", handleNewPost);
            s.on("NEW_COMMENT", handleNewComment);
            s.on("new_audit_log", handleAuditLog);

            // --- ROLE-BASED EVENTS (Chờ ghép Spring Boot Realtime sau) ---
            if (currentRole === 'STAFF') {
                s.on("DOCUMENT_APPROVED", handleDocApproved);
                s.on("DOCUMENT_SIGNED", handleDocSigned);
            }

            if (currentRole === 'MANAGER') {
                s.on("PENDING_APPROVAL_REQUEST", handlePendingApproval);
            }
        }

        return () => {
            if (s) {
                s.off("NOTIFICATION", handleSysNotification);
                s.off("NEW_POST", handleNewPost);
                s.off("NEW_COMMENT", handleNewComment);
                s.off("new_audit_log", handleAuditLog);
                s.off("DOCUMENT_APPROVED", handleDocApproved);
                s.off("DOCUMENT_SIGNED", handleDocSigned);
                s.off("PENDING_APPROVAL_REQUEST", handlePendingApproval);
            }
        };
    }, [currentUser, currentRole]);

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = (notif: AppNotification) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        if (notif.category === 'DOCUMENT') navigate('/dashboard/approvals');
        if (notif.category === 'FEED') navigate('/dashboard');
        if (notif.category === 'SYSTEM') navigate('/dashboard/audit-logs');
    };

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
        if (location.pathname === '/dashboard/approval-management') return <ApprovalManagementPage />;
        if (location.pathname === '/dashboard/workflows') {
            const WorkflowManagementPage = React.lazy(() => import('../../pages/WorkflowManagement'));
            return (
                <React.Suspense fallback={<PlaceholderPage title="Đang tải cấu hình..." />}>
                    <WorkflowManagementPage />
                </React.Suspense>
            );
        }
        if (location.pathname === '/dashboard/reminders') return <ReminderManagement />;
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
            <Sidebar 
                role={currentRole} 
                user={currentUser} 
                notifications={notifications} 
                onMarkAllRead={handleMarkAllRead}
                onNotificationClick={handleNotificationClick}
            />

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
