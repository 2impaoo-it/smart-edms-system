import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Search, 
     
    Download, 
     
    Shield, 
     
     
    AlertTriangle,
    CheckCircle2,
    
    
    Server,
    Activity
} from "lucide-react";
import { cn } from "../lib/utils";

// Mock data for audit logs
Array.from({ length: 25 }).map((_, i) => {
    const actions = [
        { type: "LOGIN", desc: "Đăng nhập hệ thống", level: "info" },
        { type: "SIGN", desc: "Ký số tài liệu Hợp đồng", level: "success" },
        { type: "UPLOAD", desc: "Tải lên tài liệu mới", level: "info" },
        { type: "DELETE", desc: "Xóa tài liệu nhạy cảm", level: "warning" },
        { type: "FAILED_LOGIN", desc: "Đăng nhập sai mật khẩu", level: "error" },
        { type: "ROLE_CHANGE", desc: "Thay đổi quyền hạn nhân sự", level: "warning" }
    ];
    const users = [
        { name: "Phạm Giám Đốc", role: "ADMIN", ip: "192.168.1.100" },
        { name: "Nguyễn Văn A", role: "MANAGER", ip: "192.168.1.105" },
        { name: "Trần Thị B", role: "STAFF", ip: "192.168.1.112" },
        { name: "Hệ Thống", role: "SYSTEM", ip: "localhost" }
    ];
    
    const action = actions[i % actions.length];
    const user = users[i % users.length];
    
    return {
        id: `LOG-${1000 + i}`,
        action: action.type,
        description: action.desc,
        level: action.level,
        user: user.name,
        role: user.role,
        ip: user.ip,
        timestamp: new Date(Date.now() - i * 3600000 - Math.random() * 1000000).toISOString(),
    };
});

export function AdminAuditLogs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState<string>("ALL");

    const filteredLogs = ([] as any[]).filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = filterLevel === "ALL" || log.level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" />
                        Nhật ký hệ thống
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Theo dõi toàn bộ hoạt động, sự kiện bảo mật trong hệ thống.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none glass-panel px-5 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 border-white/60 hover:bg-white transition-all shadow-sm">
                        <Download className="w-4 h-4 text-primary" /> XUẤT BÁO CÁO
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Tổng số logs", val: "12,450", color: "text-primary", bg: "bg-primary/10" },
                    { label: "Cảnh báo bảo mật", val: "24", color: "text-warning", bg: "bg-warning/10" },
                    { label: "Lỗi hệ thống", val: "3", color: "text-destructive", bg: "bg-destructive/10" },
                    { label: "Hoạt động hôm nay", val: "342", color: "text-success", bg: "bg-success/10" },
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-5 rounded-3xl shadow-md bg-white/40"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn("w-2 h-2 rounded-full", s.bg, s.color === "text-primary" ? "bg-primary" : s.color === "text-warning" ? "bg-warning" : s.color === "text-destructive" ? "bg-destructive" : "bg-success")} />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
                        </div>
                        <h3 className={cn("text-2xl font-black tracking-tighter", s.color)}>{s.val}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Main Log Viewer */}
            <div className="glass-panel rounded-[40px] overflow-hidden shadow-2xl bg-white/40 border-white/60 flex flex-col min-h-[600px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-white/20 bg-white/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm user, action, mô tả..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/60 border border-white/40 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {["ALL", "info", "success", "warning", "error"].map(level => (
                            <button 
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                                    filterLevel === level 
                                        ? "bg-primary text-white border-primary shadow-neon" 
                                        : "bg-white/50 text-muted-foreground border-white/40 hover:bg-white"
                                )}
                            >
                                {level === "ALL" ? "Tất cả" : level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-100/80 backdrop-blur-md z-10 shadow-sm">
                            <tr className="uppercase text-[9px] font-black tracking-[0.2em] text-muted-foreground">
                                <th className="px-6 py-4 w-16 text-center">Level</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">Hành động</th>
                                <th className="px-6 py-4 hidden md:table-cell">Mô tả chi tiết</th>
                                <th className="px-6 py-4 hidden lg:table-cell text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, i) => (
                                <motion.tr 
                                    key={log.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="border-t border-white/20 hover:bg-white/60 transition-colors group cursor-default"
                                >
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {log.level === 'info' && <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Server className="w-4 h-4" /></div>}
                                            {log.level === 'success' && <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>}
                                            {log.level === 'warning' && <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>}
                                            {log.level === 'error' && <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center animate-pulse"><Shield className="w-4 h-4" /></div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        <p className="text-[10px] text-muted-foreground font-semibold">{new Date(log.timestamp).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black">{log.user}</p>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
                                            {log.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <p className="text-xs font-medium text-slate-600">{log.description}</p>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell text-right">
                                        <span className="text-[10px] font-mono font-bold text-muted-foreground">{log.ip}</span>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-sm">Không tìm thấy bản ghi nào phù hợp.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Visual only) */}
                <div className="p-4 border-t border-white/20 bg-white/20 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Đang hiển thị {filteredLogs.length} kết quả</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white transition-colors disabled:opacity-50">Trước</button>
                        <button className="px-3 py-1.5 bg-white rounded-lg text-primary shadow-sm">1</button>
                        <button className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white transition-colors">2</button>
                        <button className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white transition-colors">Tiếp</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
