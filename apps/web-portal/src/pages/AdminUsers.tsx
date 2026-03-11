import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    Search,
    UserPlus,
    ShieldCheck,
    X,
    Mail,
    Briefcase,
    Shield,
    User as UserIcon,
    PenTool,
    Trash2
} from "lucide-react";
import type { User } from "../lib/types";
import { cn } from "../lib/utils";

export function AdminUsers({ currentUser }: { currentUser: User }) {
    const [usersList, setUsersList] = useState<User[]>([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Manageable users list
    const manageableUsers = usersList.filter(u => u.id !== currentUser.id && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.department.toLowerCase().includes(searchTerm.toLowerCase())));

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `usr_${Date.now()}`,
            name: "Người dùng mới",
            email: "newuser@smartedms.com",
            avatar: "https://i.pravatar.cc/150?u=" + Date.now(),
            role: "STAFF",
            department: "Phòng Nhân Sự", status: "active"
        };
        setUsersList([...usersList, newUser]);
        setShowAddUserModal(false);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setUsersList(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
        setSelectedUser(null);
    };

    const handleDeleteUser = (id: string) => {
        setUsersList(prev => prev.filter(u => u.id !== id));
        setSelectedUser(null);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Quản lý người dùng
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Kiểm soát toàn bộ tài khoản và phân quyền trong hệ thống.
                    </p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nhân sự..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full glass-panel border border-white/60 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddUserModal(true)}
                        className="cyber-gradient px-6 py-3 rounded-2xl text-white font-black text-[10px] flex items-center gap-2 shadow-neon hover:scale-105 transition-all uppercase tracking-widest whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" /> Thêm nhân sự
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-[40px] overflow-hidden flex flex-col shadow-2xl bg-white/40 border-white/60 min-h-[500px]">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white/70 uppercase text-[9px] font-black tracking-[0.2em]">
                                <th className="px-8 py-5">Nhân sự</th>
                                <th className="px-8 py-5">Phòng ban</th>
                                <th className="px-8 py-5">Quyền hạn</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manageableUsers.map((u, i) => (
                                <motion.tr 
                                    key={u.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-t border-white/5 hover:bg-primary/5 transition-all group"
                                >
                                    <td className="px-8 py-5 cursor-pointer" onClick={() => setSelectedUser(u)}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={u.avatar} className="w-10 h-10 rounded-2xl border-2 border-white shadow-md group-hover:scale-110 transition-transform" alt="" />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{u.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 cursor-pointer" onClick={() => setSelectedUser(u)}>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{u.department}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 cursor-pointer" onClick={() => setSelectedUser(u)}>
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter shadow-sm",
                                            u.role === 'MANAGER' ? "bg-accent/10 text-accent border-accent/20" : "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            <Shield className="w-3 h-3" />
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingUser(u); }}
                                                className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <PenTool className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                                                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {manageableUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground font-bold text-sm">
                                        <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                        Không tìm thấy nhân sự nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddUserModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl glass-panel rounded-[40px] p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Cấp tài khoản mới</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">Hệ thống Smart-EDMS Corporate</p>
                                </div>
                                <button onClick={() => setShowAddUserModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Họ và tên</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input type="text" required placeholder="Nguyễn Văn A" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email nội bộ</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input type="email" required placeholder="user@smartedms.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Phòng ban</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none">
                                            <option>Phòng Kế Toán</option>
                                            <option>Phòng Nhân Sự</option>
                                            <option>Phòng IT</option>
                                            <option>Ban Giám Đốc</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Vai trò (Role)</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none">
                                            <option>STAFF</option>
                                            <option>MANAGER</option>
                                            <option>ADMIN</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4 items-start mt-4">
                                    <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                                        Nhân sự mới sẽ nhận được một email kích hoạt tài khoản và yêu cầu thiết lập mật khẩu lần đầu ngay sau khi bạn xác nhận.
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-muted-foreground hover:bg-slate-100 transition-all tracking-widest">Hủy bỏ</button>
                                    <button type="submit" className="flex-[2] cyber-gradient py-4 rounded-2xl text-white font-black text-[10px] uppercase shadow-neon hover:scale-[1.02] active:scale-95 transition-all tracking-widest">Tạo tài khoản ngay</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedUser && !editingUser && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm glass-panel rounded-[40px] p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95 text-center"
                        >
                            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>

                            <div className="relative inline-block mb-6">
                                <img src={selectedUser.avatar} className="w-24 h-24 rounded-[2rem] border-[6px] border-white shadow-xl mx-auto object-cover" alt="" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-success border-[4px] border-white shadow-sm" />
                            </div>
                            
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic gradient-text">{selectedUser.name}</h3>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{selectedUser.email}</p>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <div className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100/50">
                                    <Briefcase className="w-5 h-5 text-primary mb-2 mx-auto" />
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Phòng ban</p>
                                    <p className="text-xs font-bold mt-1 line-clamp-1">{selectedUser.department}</p>
                                </div>
                                <div className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100/50">
                                    <Shield className="w-5 h-5 text-accent mb-2 mx-auto" />
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Quyền hạn</p>
                                    <p className={cn("text-xs font-bold mt-1", selectedUser.role === 'MANAGER' ? "text-accent" : "text-slate-600")}>
                                        {selectedUser.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => handleDeleteUser(selectedUser.id)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-all tracking-widest">Xóa</button>
                                <button onClick={() => setEditingUser(selectedUser)} className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase bg-primary text-white shadow-neon hover:scale-[1.02] transition-all tracking-widest">Chỉnh sửa</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                
                {editingUser && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-xl glass-panel rounded-[40px] p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">Chỉnh sửa nhân sự</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{editingUser.email}</p>
                                </div>
                                <button onClick={() => setEditingUser(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Họ và tên</label>
                                        <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Phòng ban</label>
                                        <select value={editingUser.department} onChange={(e) => setEditingUser({...editingUser, department: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none">
                                            <option>Phòng Kế Toán</option>
                                            <option>Phòng Nhân Sự</option>
                                            <option>Phòng IT</option>
                                            <option>Ban Giám Đốc</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Vai trò (Role)</label>
                                        <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none">
                                            <option value="STAFF">STAFF</option>
                                            <option value="MANAGER">MANAGER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-muted-foreground hover:bg-slate-100 transition-all tracking-widest">Hủy</button>
                                    <button type="submit" className="flex-[2] cyber-gradient py-4 rounded-2xl text-white font-black text-[10px] uppercase shadow-neon hover:scale-[1.02] active:scale-95 transition-all tracking-widest">Lưu thay đổi</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
