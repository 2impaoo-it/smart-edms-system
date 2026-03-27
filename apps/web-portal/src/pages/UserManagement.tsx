import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, UserCog, MoreHorizontal, Mail, Phone, Briefcase, AtSign, Loader2, X, CheckCircle2, RefreshCw } from "lucide-react";
import { gooeyToast as toast } from "goey-toast";
import { cn } from "../lib/utils";
import { createUser, getUsers } from "../services/userService";
import type { CreateUserRequest } from "../services/userService";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    jobTitle: "",
    role: "ROLE_USER" // Theo Backend: ROLE_USER, ROLE_MANAGER, ROLE_ADMIN
  });

  // Fetch danh sách user thực từ Backend
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await getUsers();
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải danh sách", { description: "Không thể lấy danh sách người dùng từ Backend" });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Map role từ backend (roles: [{name: "ROLE_ADMIN"}]) → tên hiển thị
  const getUserRole = (user: any) => {
    if (user.roles && Array.isArray(user.roles)) {
      const roleName = typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0]?.name || user.roles[0]?.authority || '';
      return roleName.replace('ROLE_', '');
    }
    if (user.role) return user.role.replace('ROLE_', '');
    return 'USER';
  };

  const filteredUsers = users.filter(u => {
    const uRole = getUserRole(u);
    const matchesSearch = (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchedRole = roleFilter === "ALL" || uRole === roleFilter || (roleFilter === "STAFF" && uRole === "USER");
    return matchesSearch && matchedRole;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const tId = toast("Đang tạo người dùng mới...", {
      description: "Hệ thống đang gọi API cấp quyền và khởi tạo Workspace...",
      duration: 100000
    });

    try {
      const { data } = await createUser(formData);
      
      toast.dismiss(tId);
      toast.success("Tạo người dùng thành công!", {
        description: `Tài khoản ${data.username} đã được cấp pass mặc định và yêu cầu đổi mật khẩu.`
      });

      // Refresh danh sách thực từ Backend
      await fetchUsers();
      setShowCreateModal(false);
      
      // Reset form
      setFormData({
        username: "", email: "", fullName: "", phoneNumber: "", jobTitle: "", role: "ROLE_USER"
      });

    } catch (err: any) {
      toast.dismiss(tId);
      toast.error("Tạo người dùng thất bại", {
        description: err.response?.data?.message || "Lỗi hệ thống hoặc username/email đã bị trùng."
      });
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text flex items-center gap-3">
             <UserCog className="w-8 h-8 text-primary" />
             Quản lý người dùng
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Chức năng độc quyền của Admin: Cấp phát và quản trị tài khoản nhân viên.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="w-full sm:w-auto cyber-gradient px-6 py-3.5 rounded-2xl text-[11px] font-black text-white flex items-center justify-center gap-2 shadow-neon hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 fill-white" /> THÊM TÀI KHOẢN MỚI
        </button>
      </div>

      {/* Toolbox & Filters */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 border-white/60 shadow-lg bg-white/40">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Tìm theo Username, tên, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/70 border border-white/40 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           {['ALL', 'ADMIN', 'MANAGER', 'STAFF'].map(r => (
             <button 
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "flex-1 md:flex-none px-4 py-3 rounded-xl text-[10px] font-black transition-all shadow-sm flex items-center justify-center gap-2", 
                roleFilter === r ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-slate-50"
              )}
             >
               {r === 'ALL' && <Filter className="w-3 h-3" />}
               {r}
             </button>
           ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoadingUsers ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-primary/50">
            <RefreshCw className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold">Đang tải danh sách nhân viên...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
           <div className="col-span-full glass-panel p-16 rounded-[40px] text-center border-dashed border-2 border-white/60">
              <UserCog className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bold text-xl">Không tìm thấy tài khoản nào</p>
           </div>
        ) : (
          filteredUsers.map(user => {
            const userRole = getUserRole(user);
            return (
            <div key={user.id} className="glass-panel rounded-[32px] p-6 shadow-xl border-white/60 bg-white/50 group hover:border-primary/30 transition-all flex flex-col h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform" />
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-primary to-secondary text-white font-black text-2xl flex items-center justify-center shadow-md">
                        {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-bold text-base leading-tight">{user.fullName || user.username}</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest flex items-center gap-1">
                           <AtSign className="w-3 h-3" /> {user.username}
                        </p>
                     </div>
                  </div>
                  <button className="p-2 hover:bg-white/60 rounded-xl transition-all">
                     <MoreHorizontal className="w-5 h-5 text-slate-400" />
                  </button>
               </div>

               <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><Mail className="w-4 h-4 text-primary" /></div>
                     <span className="font-medium text-slate-600 truncate">{user.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><Briefcase className="w-4 h-4 text-accent" /></div>
                     <span className="font-medium text-slate-600">{user.jobTitle || user.department || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><CheckCircle2 className="w-4 h-4 text-success" /></div>
                     <span className="font-medium text-slate-600">ID: #{user.id}</span>
                  </div>
               </div>

               <div className="mt-6 pt-5 border-t border-white/50 flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                    userRole === 'ADMIN' ? 'bg-destructive/10 text-destructive' :
                    userRole === 'MANAGER' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  )}>
                    {userRole}
                  </span>
                  
                  <span className={cn(
                    "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest",
                    !user.mustChangePassword ? 'text-success' : 'text-amber-500'
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", !user.mustChangePassword ? 'bg-success animate-pulse' : 'bg-amber-500')} />
                    {!user.mustChangePassword ? 'Đang hoạt động' : 'Chờ đổi mật khẩu'}
                  </span>
               </div>
            </div>
            );
          })
        )}
      </div>

      {/* Tạo User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 lg:p-8 flex justify-between items-center bg-slate-50/50 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <UserCog className="w-7 h-7 text-primary" /> Khởi tạo tài khoản
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Thông tin nhân sự mới</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-3 bg-white hover:bg-slate-200 rounded-2xl shadow-sm transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
                <form id="create-user-form" onSubmit={handleCreateSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username <span className="text-destructive">*</span></label>
                        <div className="relative">
                          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="vd: nvam" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"/>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và Tên <span className="text-destructive">*</span></label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"/>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email nội bộ <span className="text-destructive">*</span></label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="nva@smartedms.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"/>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="090..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"/>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chức danh / Phòng ban</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Chuyên viên IT" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"/>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phân quyền Hệ thống <span className="text-destructive">*</span></label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all text-slate-700">
                          <option value="ROLE_USER">STAFF (Nhân viên)</option>
                          <option value="ROLE_MANAGER">MANAGER (Trưởng phòng)</option>
                          <option value="ROLE_ADMIN">ADMIN (Quản trị viên)</option>
                        </select>
                      </div>
                   </div>

                   <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs font-medium text-slate-600 leading-relaxed text-center">
                     Mật khẩu khởi tạo sẽ được gán tự động từ cấu hình Backend. Người dùng sẽ bị ép đổi mật khẩu ở lần đăng nhập đầu tiên để đảm bảo bảo mật.
                   </div>
                </form>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 gap-3">
                 <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-4 rounded-2xl font-black text-xs uppercase text-slate-500 hover:bg-slate-200 transition-all tracking-widest">
                   Hủy Bỏ
                 </button>
                 <button form="create-user-form" type="submit" disabled={isCreating} className="cyber-gradient min-w-[200px] py-4 rounded-2xl font-black text-xs uppercase text-white shadow-lg hover:shadow-neon hover:scale-105 active:scale-95 transition-all tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                   {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác Nhận Tạo"}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
