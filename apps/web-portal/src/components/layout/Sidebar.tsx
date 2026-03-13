
import { Link, useLocation, useNavigate } from "react-router";
import {
    LayoutDashboard,
    PenTool,
    Settings,
    History,
    Users,
    Briefcase,
    ShieldAlert,
    Database,
    FileText,
    LogOut,
    
    
    Trash2
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { UserRole } from "../../lib/types";

interface SidebarProps {
    role: UserRole;
    isHovered: boolean;
}

export function Sidebar({ role, isHovered }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // Định nghĩa các nhóm menu, lọc bỏ "Tài liệu cá nhân" cho Admin
    const NAV_GROUPS = {
        COMMON: [
            { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
            ...(role !== 'ADMIN' ? [{ name: "Tài liệu cá nhân", href: "/dashboard/files", icon: FileText }] : []),
            { name: "Kho phòng ban", href: "/dashboard/department", icon: Briefcase },
            ...(role !== 'ADMIN' ? [{ name: "Thùng rác", href: "/dashboard/recycle-bin", icon: Trash2 }] : []),
        ],
        MANAGER: [
            { name: "Danh sách trình ký", href: "/dashboard/approvals", icon: PenTool, badge: 8 },
            { name: "Quản lý chữ ký", href: "/dashboard/signatures", icon: ShieldAlert },
        ],
        ADMIN: [
            { name: "Quản lý người dùng", href: "/dashboard/users", icon: Users },
            { name: "Quản lý chữ ký", href: "/dashboard/signatures", icon: ShieldAlert },
            { name: "Log hệ thống", href: "/dashboard/audit-logs", icon: History },
            { name: "Kho tài liệu tổng", href: "/dashboard/storage", icon: Database },
            { name: "Cài đặt hệ thống", href: "/dashboard/settings", icon: Settings },
        ]
    };

    const handleLogout = () => {
        navigate('/', { replace: true });
    };

    const renderLink = (item: any) => {
        const isActive = location.pathname === item.href || (item.href === '/dashboard' && location.pathname === '/');

        return (
            <Link
                key={item.href}
                to={item.href}
                className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-300 relative",
                    isActive
                        ? "bg-primary/10 text-primary font-bold shadow-sm"
                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                )}
            >
                <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                    <span className={cn("transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0 invisible")}>{item.name}</span>
                </div>
                {item.badge && isHovered && (
                    <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 glass-panel border-r border-white/20 flex flex-col transition-all duration-500 ease-[0.23,1,0.32,1]",
            isHovered ? "w-[var(--sidebar-width)] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"
        )}>
            {/* Header Logo */}
            <div className="h-[var(--header-height)] flex items-center px-6 border-b border-white/10 overflow-hidden shrink-0">
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl cyber-gradient flex items-center justify-center shadow-neon shrink-0">
                        <span className="text-white font-black text-xs">EDMS</span>
                    </div>
                    <div className={cn("transition-all duration-300", isHovered ? "opacity-100" : "opacity-0")}>
                        <h1 className="font-black text-lg tracking-tighter leading-none gradient-text uppercase italic">Smart</h1>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Enterprise</p>
                    </div>
                </div>
            </div>

            {/* Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
                <div className="space-y-1">
                    <h2 className={cn("px-3 mb-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>Menu Chính</h2>
                    {NAV_GROUPS.COMMON.map(renderLink)}
                </div>

                {role === 'MANAGER' && (
                    <div className="space-y-1">
                        <h2 className={cn("px-3 mb-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>Nghiệp vụ</h2>
                        {NAV_GROUPS.MANAGER.map(renderLink)}
                    </div>
                )}

                {role === 'ADMIN' && (
                    <div className="space-y-1">
                        <h2 className={cn("px-3 mb-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>Quản trị</h2>
                        {NAV_GROUPS.ADMIN.map(renderLink)}
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/10 space-y-4 overflow-hidden shrink-0">
                {role === 'ADMIN' && isHovered && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black text-primary uppercase">Storage System</span>
                        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full cyber-gradient w-[45%]" />
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className={cn("transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
