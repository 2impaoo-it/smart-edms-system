import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
     
    Users, 
     
    HardDrive, 
     
    Clock, 
    CheckCircle2, 
    FileText,
    
    Search,
    Filter,
    
    FolderPlus,
    
    
    
    
    Eye,
    Zap,
    Download,
    
    ShieldCheck,
    X,
    
    
    
} from "lucide-react";

import { cn } from "../lib/utils";
import { SignerWorkspace } from "./SignerWorkspace";

// --- 1. ADMIN DASHBOARD ---
export function AdminDashboard({ onNavigate }: { user?: any, onNavigate: (path: string) => void }) {
    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { label: "Tổng lưu trữ", val: { totalFiles: 0, totalStorage: "0 GB", pendingApprovals: 0, signedToday: 0, activeUsers: 0 }.totalStorage, icon: HardDrive, color: "text-primary", bg: "bg-primary/10", border: "border-l-primary" },
                    { label: "Người dùng hệ thống", val: { totalFiles: 0, totalStorage: "0 GB", pendingApprovals: 0, signedToday: 0, activeUsers: 0 }.activeUsers, icon: Users, color: "text-accent", bg: "bg-accent/10", border: "border-l-accent" },
                    { label: "Tài liệu đã ký", val: { totalFiles: 0, totalStorage: "0 GB", pendingApprovals: 0, signedToday: 0, activeUsers: 0 }.signedToday, icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-l-success" },
                    { label: "Tiến trình chờ", val: { totalFiles: 0, totalStorage: "0 GB", pendingApprovals: 0, signedToday: 0, activeUsers: 0 }.pendingApprovals, icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-l-warning" }
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn("glass-panel p-6 rounded-[32px] border-l-4 shadow-xl bg-white/40", s.border)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", s.bg, s.color)}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-success uppercase tracking-tighter">Realtime</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.label}</p>
                        <h3 className="text-2xl font-black mt-1 gradient-text">{s.val}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Logs Quick View */}
                <div className="glass-panel rounded-[40px] p-8 shadow-2xl bg-white/40 border-white/60">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black tracking-tighter uppercase italic">Audit Logs Gần Đây</h3>
                        <button onClick={() => onNavigate('/dashboard/audit-logs')} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Xem tất cả</button>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4 relative">
                                {i !== 5 && <div className="absolute left-[11px] top-7 bottom-[-20px] w-px bg-slate-200 dark:bg-white/10" />}
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                                    <div className="w-2 h-2 rounded-full bg-primary shadow-neon" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold leading-tight">Phạm Giám Đốc <span className="text-muted-foreground font-medium italic">vừa thực hiện</span> Ký số tài liệu</p>
                                    <p className="text-[9px] font-black text-muted-foreground/60 mt-1 uppercase">14:20 - Hôm nay</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Security Status Card */}
                <div className="glass-panel rounded-[40px] p-8 cyber-gradient text-white shadow-neon relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-8 h-8" />
                            <h4 className="text-2xl font-black tracking-tighter italic uppercase">Security Level</h4>
                        </div>
                        <p className="text-base font-bold opacity-90 mb-6">Hệ thống đang hoạt động ở mức bảo mật tối đa (ISO 27001). Toàn bộ dữ liệu được mã hóa đầu cuối.</p>
                        
                        <div className="space-y-3 mt-8">
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20">
                                <span className="text-[10px] font-black uppercase tracking-widest">Firewall Status</span>
                                <span className="text-xs font-black text-success">Active</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20">
                                <span className="text-[10px] font-black uppercase tracking-widest">Data Encryption</span>
                                <span className="text-xs font-black text-success">AES-256</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                            <p className="text-3xl font-black">OPTIMAL</p>
                        </div>
                        <button className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-white/30 transition-all border border-white/20">Scan Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 2. MANAGER DASHBOARD ---
export function ManagerDashboard({ user }: { user: any, onNavigate: (path: string) => void }) {
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showQuickSignModal, setShowQuickSignModal] = useState(false);
    
    // Filters state
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Quick Sign State
    const [selectedForQuickSign, setSelectedForQuickSign] = useState<string[]>([]);

    // View Modal State
    const [viewFileId, setViewFileId] = useState<string | null>(null);

    const handleSignSuccess = (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'signed' as const } : f));
    };

    const handleQuickSignConfirm = () => {
        setFiles(prev => prev.map(f => selectedForQuickSign.includes(f.id) ? { ...f, status: 'signed' as const } : f));
        setSelectedForQuickSign([]);
        setShowQuickSignModal(false);
    };

    const toggleQuickSignSelect = (id: string) => {
        setSelectedForQuickSign(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
    };

    const pendingFiles = files.filter(f => f.status === 'pending');
    
    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ? f.status === 'pending' : f.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const fileToView = files.find(f => f.id === viewFileId);

    const handleDownload = (fileName: string) => {
        // Mock download
        alert(`Downloading ${fileName}...`);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            <AnimatePresence>
                {selectedFileId && (
                    <div className="fixed inset-0 z-[999]">
                        <SignerWorkspace 
                            fileId={selectedFileId} 
                            onClose={() => setSelectedFileId(null)} 
                            onSignSuccess={handleSignSuccess}
                        />
                    </div>
                )}

                {/* Filter Panel */}
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-panel p-6 rounded-3xl shadow-sm border-white/60 mb-6 overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tìm kiếm tên tài liệu</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Nhập từ khóa..." 
                                        className="w-full bg-white/50 border border-white/40 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Trạng thái</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setFilterStatus("all")} className={cn("px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1", filterStatus === "all" ? "bg-primary text-white shadow-md" : "bg-white/50 hover:bg-white/80")}>Tất cả pending</button>
                                    <button onClick={() => setFilterStatus("urgent")} className={cn("px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1", filterStatus === "urgent" ? "bg-warning text-white shadow-md" : "bg-white/50 hover:bg-white/80")}>Khẩn cấp</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Quick Sign Modal */}
                {showQuickSignModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl glass-panel rounded-[40px] p-8 lg:p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95 flex flex-col max-h-[80vh]"
                        >
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                                        <Zap className="w-6 h-6 text-primary" /> Ký nhanh hàng loạt
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Chọn các tài liệu bạn muốn áp dụng chữ ký mặc định</p>
                                </div>
                                <button onClick={() => setShowQuickSignModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[300px]">
                                {pendingFiles.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">Không có tài liệu nào chờ duyệt.</p>
                                    </div>
                                ) : (
                                    pendingFiles.map(file => (
                                        <div 
                                            key={file.id} 
                                            onClick={() => toggleQuickSignSelect(file.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
                                                selectedForQuickSign.includes(file.id) ? "border-primary bg-primary/5" : "border-transparent bg-slate-50 hover:bg-slate-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                                                selectedForQuickSign.includes(file.id) ? "bg-primary border-primary text-white" : "border-slate-300"
                                            )}>
                                                {selectedForQuickSign.includes(file.id) && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{file.name}</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase">{file.updatedAt}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100 shrink-0">
                                <button onClick={() => setShowQuickSignModal(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-muted-foreground hover:bg-slate-100 transition-all tracking-widest">Hủy</button>
                                <button 
                                    onClick={handleQuickSignConfirm} 
                                    disabled={selectedForQuickSign.length === 0}
                                    className="flex-[2] cyber-gradient py-4 rounded-2xl text-white font-black text-[10px] uppercase shadow-neon hover:scale-[1.02] active:scale-95 transition-all tracking-widest disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    Xác nhận ký ({selectedForQuickSign.length}) tài liệu
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* View Document Modal */}
                {viewFileId && fileToView && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-4xl h-[85vh] glass-panel rounded-[40px] overflow-hidden border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl"><FileText className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="font-black text-lg">{fileToView.name}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trạng thái: <span className="text-success">Đã Ký</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDownload(fileToView.name)} className="p-3 bg-primary text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                        <Download className="w-4 h-4" /> <span className="text-[10px] font-black uppercase hidden sm:inline">Tải Xuống</span>
                                    </button>
                                    <button onClick={() => setViewFileId(null)} className="p-3 hover:bg-slate-200 rounded-xl transition-all bg-slate-100">
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-200/50 flex items-center justify-center p-8 overflow-auto">
                                {/* Mock Document Preview */}
                                <div className="w-full max-w-2xl bg-white shadow-xl min-h-[800px] p-12 relative animate-in slide-in-from-bottom-8 duration-700">
                                    <div className="text-center mb-10 border-b pb-6">
                                        <h1 className="text-2xl font-bold uppercase mb-2">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h1>
                                        <p className="font-bold underline">Độc lập - Tự do - Hạnh phúc</p>
                                    </div>
                                    <h2 className="text-xl font-bold text-center mb-8">{fileToView.name.replace('.pdf', '').replace('.docx', '')}</h2>
                                    <div className="space-y-4 text-sm leading-relaxed text-justify">
                                        <p>Đây là bản xem trước của tài liệu {fileToView.name}. Trong hệ thống thực tế, khu vực này sẽ render nội dung file PDF hoặc Word để người dùng đọc trực tiếp trên trình duyệt mà không cần tải về.</p>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                                    </div>
                                    
                                    {/* Mock Signature Stamp */}
                                    <div className="absolute bottom-20 right-20 text-center">
                                        <p className="font-bold mb-4">Người phê duyệt</p>
                                        <div className="w-40 h-24 border-2 border-red-500/30 rounded-lg flex items-center justify-center relative rotate-[-5deg]">
                                            <div className="absolute inset-0 bg-red-500/5 rounded-lg"></div>
                                            <div className="text-red-500 text-center mix-blend-multiply opacity-80">
                                                <p className="text-[10px] font-bold uppercase border-b border-red-500/50 mb-1 pb-1">Smart EDMS Validated</p>
                                                <p className="font-black text-lg signature-font">Đã Ký</p>
                                                <p className="text-[8px] font-mono mt-1">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter">Trung tâm Phê duyệt</h2>
                    <p className="text-sm text-muted-foreground font-medium">Chào sếp <span className="text-primary font-black uppercase">{user.name}</span>. Bạn có tài liệu mới.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setShowFilters(!showFilters)} className={cn("flex-1 sm:flex-none glass-panel px-5 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 transition-all shadow-sm", showFilters ? "bg-white border-primary text-primary" : "border-white/60 hover:bg-white")}>
                        <Filter className="w-4 h-4" /> LỌC YÊU CẦU
                    </button>
                    <button onClick={() => setShowQuickSignModal(true)} className="flex-1 sm:flex-none cyber-gradient px-6 py-3 rounded-2xl text-[10px] font-black text-white flex items-center justify-center gap-2 shadow-neon hover:scale-105 transition-all">
                        <Zap className="w-4 h-4 fill-white" /> KÝ NHANH
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Danh sách đợi duyệt ({filteredFiles.length})</h3>
                    </div>
                    {filteredFiles.length === 0 ? (
                        <div className="glass-panel p-12 rounded-[32px] text-center border-dashed border-2 border-white/60">
                            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                            <p className="font-bold text-lg">Tuyệt vời! Đã duyệt xong hết.</p>
                            <p className="text-sm text-muted-foreground">Không có tài liệu nào cần bạn xử lý lúc này.</p>
                        </div>
                    ) : (
                        filteredFiles.map(file => (
                            <div key={file.id} className="glass-panel p-6 rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/40 transition-all shadow-xl bg-white/40">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">{file.name}</h4>
                                        <div className="flex items-center gap-3 mt-1 opacity-60">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">User ID: {file.owner}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{file.updatedAt}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedFileId(file.id)} className="flex-1 w-full sm:w-auto sm:flex-none px-8 py-3 rounded-xl cyber-gradient text-white text-[10px] font-black shadow-neon transition-all">
                                    MỞ TRÌNH KÝ
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest font-black">Đã ký gần đây</h3>
                    {files.filter(f => f.status === 'signed').slice(0, 5).map(file => (
                        <div key={file.id} className="glass-panel p-5 rounded-[24px] border-l-4 border-l-success shadow-lg bg-white/60 transition-transform hover:translate-x-1">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3 text-success">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="text-xs font-bold line-clamp-2 leading-tight">{file.name}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200/50">
                                <button onClick={() => setViewFileId(file.id)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[9px] font-black uppercase transition-colors flex items-center justify-center gap-1.5">
                                    <Eye className="w-3 h-3" /> Xem
                                </button>
                                <button onClick={() => handleDownload(file.name)} className="p-2 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-primary transition-colors">
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {files.filter(f => f.status === 'signed').length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Chưa có tài liệu nào được ký.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
// --- 3. STAFF DASHBOARD ---
export function StaffDashboard({ user, onNavigate }: { user: any, onNavigate: (path: string) => void }) {
    const files: any[] = [];

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Kho tài liệu cá nhân</h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Quản lý và theo dõi tiến độ phê duyệt tài liệu của bạn.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => onNavigate('/dashboard/files')} className="flex-1 sm:flex-none glass-panel px-5 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 border-white/60 hover:bg-white transition-all shadow-sm">
                        <FolderPlus className="w-4 h-4 text-primary" /> MỞ KHO LƯU TRỮ
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Tổng tài liệu", val: files.filter(f => f.owner === user.id && f.type !== 'folder').length, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Đang chờ duyệt", val: files.filter(f => f.owner === user.id && f.status === 'pending').length, color: "text-warning", bg: "bg-warning/10" },
                    { label: "Đã hoàn tất", val: files.filter(f => f.owner === user.id && f.status === 'signed').length, color: "text-success", bg: "bg-success/10" },
                    { label: "Bị từ chối", val: 0, color: "text-destructive", bg: "bg-destructive/10" },
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-3xl shadow-sm bg-white/40 border-white/60"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn("w-2 h-2 rounded-full", s.bg, s.color === "text-primary" ? "bg-primary" : s.color === "text-warning" ? "bg-warning" : s.color === "text-destructive" ? "bg-destructive" : "bg-success")} />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
                        </div>
                        <h3 className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.val}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="glass-panel rounded-[40px] overflow-hidden shadow-2xl bg-white/40 border-white/60">
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/20">
                    <div>
                        <h3 className="text-xl font-black tracking-tighter uppercase italic">Tiến độ phê duyệt gần đây</h3>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Cập nhật realtime</p>
                    </div>
                    <button onClick={() => onNavigate('/dashboard/files')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                        Xem tất cả
                    </button>
                </div>
                <div className="overflow-x-auto scrollbar-hide p-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="uppercase text-[9px] font-black tracking-[0.2em] text-muted-foreground">
                                <th className="px-8 py-5">Tên tài liệu</th>
                                <th className="px-8 py-5">Cập nhật lần cuối</th>
                                <th className="px-8 py-5 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.filter(f => f.owner === user.id && f.type !== 'folder').map((file, i) => (
                                <motion.tr 
                                    key={file.id} 
                                    onClick={() => onNavigate('/dashboard/files')}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-t border-white/20 hover:bg-white/60 transition-all group cursor-pointer"
                                >
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:text-primary transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black group-hover:text-primary transition-colors block">{file.name}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground">{file.size}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{file.updatedAt}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            {file.status === 'signed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã hoàn tất
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                    <Clock className="w-3 h-3" /> Đang duyệt
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
