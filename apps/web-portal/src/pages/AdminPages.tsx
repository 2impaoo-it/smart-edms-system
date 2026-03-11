import { useState } from "react";

import { 
     
    Shield, 
    MoreVertical, 
    Search, 
    UserPlus, 
     
    Briefcase, 
     
     
    
    Filter,
    
    
    
    Globe,
    
    Save
} from "lucide-react";
import type { User } from "../lib/types";
import { cn } from "../lib/utils";

// --- 1. ADMIN USER MANAGEMENT ---
export function AdminUserManagement({ currentUser }: { currentUser: User }) {
    const [searchQuery, setSearchQuery] = useState("");
    const users: any[] = ([] as any[]).filter(u => u.id !== currentUser.id);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Quản lý nhân sự</h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Quản trị quyền hạn & Trạng thái tài khoản</p>
                </div>
                <button className="cyber-gradient px-8 py-4 rounded-2xl text-white font-black text-xs shadow-neon hover:scale-105 transition-all">
                    <UserPlus className="w-4 h-4 inline-block mr-2" /> THÊM NHÂN SỰ MỚI
                </button>
            </div>

            <div className="glass-panel rounded-[40px] overflow-hidden shadow-2xl bg-white/40">
                <div className="p-8 border-b border-white/10 bg-white/20 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên, email hoặc phòng ban..." 
                            className="w-full h-12 pl-12 pr-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-3.5 rounded-2xl glass-panel border-white/60 hover:text-primary transition-all"><Filter className="w-5 h-5" /></button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white/70 uppercase text-[9px] font-black tracking-[0.2em]">
                                <th className="px-8 py-5">Nhân viên</th>
                                <th className="px-8 py-5">Phòng ban</th>
                                <th className="px-8 py-5">Quyền hạn</th>
                                <th className="px-8 py-5">Trạng thái</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-t border-white/5 hover:bg-primary/5 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={user.avatar} className="w-11 h-11 rounded-2xl border-2 border-white shadow-md" alt="" />
                                            <div>
                                                <p className="text-sm font-black">{user.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                                            <span className="text-xs font-bold">{user.department}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                            user.role === 'MANAGER' ? "bg-accent/10 text-accent border border-accent/20" : "bg-slate-100 text-slate-500 border border-slate-200"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", user.status === 'active' ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300')} />
                                            <span className="text-[10px] font-black uppercase opacity-60">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 hover:bg-white rounded-xl transition-all"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- 2. ADMIN SYSTEM SETTINGS ---
export function AdminSettings() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Cấu hình hệ thống</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Thiết lập thông số vận hành EDMS</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="glass-panel rounded-[40px] p-8 space-y-8 bg-white/40">
                    <h3 className="text-lg font-black flex items-center gap-3"><Globe className="w-5 h-5 text-primary" /> Thông số chung</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-black">Tên đơn vị</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Hiển thị trên Header & Báo cáo</p>
                            </div>
                            <input type="text" defaultValue="Smart-EDMS Enterprise" className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-right" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-black">Ngôn ngữ hệ thống</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Mặc định cho người dùng mới</p>
                            </div>
                            <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold">
                                <option>Tiếng Việt</option>
                                <option>English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Storage & Security */}
                <div className="glass-panel rounded-[40px] p-8 space-y-8 bg-white/40 border-l-4 border-l-accent">
                    <h3 className="text-lg font-black flex items-center gap-3"><Shield className="w-5 h-5 text-accent" /> Bảo mật & Lưu trữ</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-black">Giới hạn dung lượng (GB)</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Dung lượng tối đa cho mỗi cá nhân</p>
                            </div>
                            <input type="number" defaultValue={50} className="w-20 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-right" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-black">Xác thực đa lớp (MFA)</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Bắt buộc khi thực hiện ký số</p>
                            </div>
                            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button className="px-8 py-4 rounded-2xl font-black text-xs uppercase text-muted-foreground hover:bg-white transition-all tracking-widest">Hủy thay đổi</button>
                <button className="cyber-gradient px-10 py-4 rounded-2xl text-white font-black text-xs shadow-neon flex items-center gap-2 uppercase tracking-widest">
                    <Save className="w-4 h-4" /> Lưu cấu hình
                </button>
            </div>
        </div>
    );
}
