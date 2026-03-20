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
    Eye,
    Zap,
    Download,
    
    ShieldCheck,
    X,
    Heart,
    MessageCircle,
    Send,
    MoreHorizontal,
    Bell
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
    const safeUser = user || { id: 'guest', name: 'Quản lý' };
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

    // --- Chat & Feed State ---
    const [posts, setPosts] = useState<any[]>([
        { 
            id: 1, 
            author: safeUser.name, 
            role: 'Trưởng phòng', 
            time: '2 giờ trước', 
            content: 'Thông báo nội bộ: Tuần sau chúng ta sẽ có buổi training về Security. Yêu cầu toàn bộ nhân viên tham gia.', 
            likes: 12, 
            comments: [], 
            isLiked: false 
        }
    ]);
    const [newPostContent, setNewPostContent] = useState("");
    const [newCommentText, setNewCommentText] = useState("");
    const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

    const [contacts] = useState([
        { id: 'u1', name: 'Trần Nhân Viên', role: 'Developer', isOnline: true },
        { id: 'u2', name: 'Lê Kỹ Thuật', role: 'DevOps', isOnline: true },
        { id: 'u3', name: 'Nguyễn Tester', role: 'QA', isOnline: false },
    ]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<Record<string, {sender: string, text: string, time: string}[]>>({
        'u1': [
            { sender: 'u1', text: 'Sếp duyệt giúp em tài liệu dự án nhé.', time: '09:15' },
            { sender: 'me', text: 'Để anh xem.', time: '09:16' }
        ]
    });
    const [newMessage, setNewMessage] = useState("");

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newPostContent.trim()) return;
        setPosts([{
            id: Date.now(),
            author: safeUser.name,
            role: 'Trưởng phòng',
            time: 'Vừa xong',
            content: newPostContent,
            likes: 0,
            comments: [],
            isLiked: false
        }, ...posts]);
        setNewPostContent("");
    };

    const handleLike = (postId: number) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    };

    const handleSendComment = (postId: number) => {
        if (!newCommentText.trim()) return;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), author: safeUser.name, text: newCommentText, time: 'Vừa xong' }] } : p));
        setNewCommentText("");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatId) return;
        setChatMessages(prev => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), { sender: 'me', text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]
        }));
        setNewMessage("");
    };

    const activeChatUser = contacts.find(c => c.id === activeChatId);

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
                    <p className="text-sm text-muted-foreground font-medium">Chào sếp <span className="text-primary font-black uppercase">{safeUser.name}</span>. Bạn có tài liệu mới.</p>
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

            {/* --- MANAGER NEWS FEED & CHAT --- */}
            <div className="pt-8 mt-8 border-t border-slate-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Bảng Tin & Giao Tiếp Nội Bộ</h2>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Quản lý thông báo và trao đổi trực tiếp với nhân viên phòng ban
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COL: CREATE POST & NEWS FEED */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* CREATE POST BOX */}
                        <div className="glass-panel p-6 rounded-[32px] bg-white/60 shadow-lg border-primary/20">
                            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Đăng thông báo mới cho phòng ban..."
                                    className="w-full bg-white/80 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px] shadow-inner"
                                />
                                <div className="flex justify-end pt-2 border-t border-white/50">
                                    <button type="submit" disabled={!newPostContent.trim()} className="px-6 py-2.5 rounded-xl cyber-gradient text-white text-xs font-black uppercase shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Đăng Thông Báo
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* POSTS LIST */}
                        {posts.map(post => (
                            <div key={post.id} className="glass-panel rounded-[32px] p-0 overflow-hidden shadow-xl bg-white/60">
                                <div className="p-6 flex justify-between items-start border-b border-white/40 bg-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg">
                                            {post.author.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base">{post.author}</h4>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                                                <span className="text-primary/70">{post.role}</span>
                                                <span>•</span>
                                                <span>{post.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
                                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                                
                                <div className="p-6 text-sm leading-relaxed whitespace-pre-line text-slate-700 font-medium">
                                    {post.content}
                                </div>
                                
                                <div className="px-6 py-4 flex items-center gap-6 border-t border-slate-100/50">
                                    <button 
                                        onClick={() => handleLike(post.id)}
                                        className={cn("flex items-center gap-2 text-xs font-black uppercase transition-all", post.isLiked ? "text-pink-500" : "text-muted-foreground hover:text-slate-700")}
                                    >
                                        <Heart className={cn("w-5 h-5", post.isLiked ? "fill-pink-500 scale-110" : "")} /> 
                                        {post.likes} Yêu Thích
                                    </button>
                                    <button 
                                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                        className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <MessageCircle className="w-5 h-5" /> 
                                        {post.comments.length} Bình Luận
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {activeCommentPostId === post.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-slate-50/50 border-t border-slate-100/50 overflow-hidden"
                                        >
                                            <div className="p-6 space-y-4">
                                                {post.comments.length === 0 ? (
                                                    <p className="text-xs text-center text-muted-foreground italic">Chưa có bình luận nào.</p>
                                                ) : (
                                                    post.comments.map((cmt: any) => (
                                                        <div key={cmt.id} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-xs text-slate-500">
                                                                {cmt.author.charAt(0)}
                                                            </div>
                                                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
                                                                <div className="flex justify-between items-end mb-1">
                                                                    <h5 className="font-bold text-xs">{cmt.author}</h5>
                                                                    <span className="text-[9px] text-muted-foreground uppercase">{cmt.time}</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-slate-600">{cmt.text}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                
                                                <div className="flex gap-2 pt-2 mt-4 border-t border-slate-200/50">
                                                    <input 
                                                        type="text" 
                                                        value={newCommentText}
                                                        onChange={e => setNewCommentText(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleSendComment(post.id)}
                                                        placeholder="Viết bình luận..." 
                                                        className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 shadow-inner"
                                                    />
                                                    <button onClick={() => handleSendComment(post.id)} className="p-2.5 bg-primary text-white rounded-xl shadow-md hover:scale-105 transition-transform">
                                                        <Send className="w-4 h-4 ml-0.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT COL: ACTIVE USERS & CONTACTS */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-[32px] bg-white/40 shadow-xl border-white/60">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Nhân Viên Trực Tuyến</h3>
                            <div className="space-y-4">
                                {contacts.map(contact => (
                                    <div key={contact.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {contact.name.charAt(0)}
                                                </div>
                                                {contact.isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full shadow-sm" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold leading-none mb-1">{contact.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{contact.role}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setActiveChatId(contact.id)}
                                            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BALLOON CHAT BLOCK FOR MANAGER */}
            <AnimatePresence>
                {activeChatId && activeChatUser && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                        drag
                        dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
                        dragElastic={0.1}
                        className="fixed bottom-6 right-6 z-[100] cursor-grab active:cursor-grabbing"
                        style={{ perspective: 1000 }}
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-white shadow-2xl border-4 border-primary/20 flex items-center justify-center text-primary font-black text-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 cyber-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                                {activeChatUser.name.charAt(0)}
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-success border-2 border-white rounded-full" />
                            </div>
                            
                            <button 
                                onClick={() => setActiveChatId(null)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            <div className="absolute bottom-20 right-0 w-[340px] glass-panel bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] border-white/60 overflow-hidden flex flex-col cursor-default h-[450px]">
                                <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center gap-3 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {activeChatUser.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight">{activeChatUser.name}</h4>
                                        <p className="text-[10px] text-success uppercase font-black tracking-widest mt-0.5">Đang trực tuyến</p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-hide">
                                    <div className="text-center my-2 text-[10px] font-bold text-muted-foreground uppercase opacity-50 bg-slate-100 rounded-full py-1 px-3 w-max mx-auto">
                                        Chuẩn mã hóa End-to-End
                                    </div>
                                    {(chatMessages[activeChatId] || []).map((msg, idx) => {
                                        const isMe = msg.sender === 'me';
                                        return (
                                            <div key={idx} className={cn("flex flex-col max-w-[80%]", isMe ? "self-end items-end" : "self-start items-start")}>
                                                <div className={cn("px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium", isMe ? "bg-primary text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm")}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground mt-1 mx-1">{msg.time}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 shrink-0">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Nhắn tin riêng tư..." 
                                        className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 rounded-xl cyber-gradient text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
// --- 3. STAFF DASHBOARD (NEWS & COMMUNICATION) ---
export function StaffDashboard({ user }: { user: any, onNavigate: (path: string) => void }) {
    const safeUser = user || { id: 'guest', name: 'Nhân viên', department: 'Phòng IT' };
    
    // --- Mock Data ---
    const [posts, setPosts] = useState([
        { 
            id: 1, 
            author: 'Phạm Trưởng Phòng', 
            role: 'Trưởng phòng ' + (safeUser.department || 'IT'), 
            time: '2 giờ trước', 
            content: 'Thông báo nội bộ: Tuần sau chúng ta sẽ có buổi training về Security lúc 9h sáng thứ 2. Mọi người sắp xếp thời gian tham gia đầy đủ nhé.', 
            likes: 12, 
            comments: [
                { id: 101, author: 'Trần Nhân Viên', text: 'Đã nhận thông tin sếp ạ.', time: '1 giờ trước' }
            ], 
            isLiked: false 
        },
        { 
            id: 2, 
            author: 'Hệ thống Nhân Sự', 
            role: 'Thông báo', 
            time: 'Hôm qua', 
            content: 'Chúc mừng sinh nhật các thành viên có ngày sinh trong tháng này! Bộ phận HR đã chuẩn bị quà tại quầy lễ tân. 🎂🎉', 
            likes: 45, 
            comments: [], 
            isLiked: true 
        }
    ]);

    const [contacts] = useState([
        { id: 'u1', name: 'Trần Đồng Nghiệp', role: 'Developer', isOnline: true },
        { id: 'u2', name: 'Lê Kỹ Thuật', role: 'DevOps', isOnline: true },
        { id: 'u3', name: 'Nguyễn Tester', role: 'QA', isOnline: false },
    ]);

    // --- State ---
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<Record<string, {sender: string, text: string, time: string}[]>>({
        'u1': [
            { sender: 'u1', text: 'Ê file tài liệu dự án EDMS hôm qua cậu up lên thư mục nào vậy?', time: '09:15' },
            { sender: 'me', text: 'Tớ để trong thư mục team Dev nhé, check lại đi.', time: '09:16' }
        ]
    });
    const [newMessage, setNewMessage] = useState("");
    const [newCommentText, setNewCommentText] = useState("");
    const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

    // --- Actions ---
    const handleLike = (postId: number) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
            }
            return p;
        }));
    };

    const handleSendComment = (postId: number) => {
        if (!newCommentText.trim()) return;
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { 
                    ...p, 
                    comments: [...p.comments, { id: Date.now(), author: safeUser.name, text: newCommentText, time: 'Vừa xong' }] 
                };
            }
            return p;
        }));
        setNewCommentText("");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatId) return;
        
        setChatMessages(prev => ({
            ...prev,
            [activeChatId]: [
                ...(prev[activeChatId] || []),
                { sender: 'me', text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
            ]
        }));
        setNewMessage("");
    };

    const activeChatUser = contacts.find(c => c.id === activeChatId);

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-32">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 glass-panel p-8 rounded-[40px] shadow-sm">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text">Bảng Tin & Nội Bộ</h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Không gian trao đổi tin tức nội bộ khu vực <span className="text-primary font-black uppercase">{safeUser.department || 'Phòng Ban'}</span>
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="glass-panel px-5 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 border-white/60 hover:bg-white transition-all shadow-sm">
                        <Bell className="w-4 h-4 text-warning fill-warning/20" /> THÔNG BÁO MỚI (2)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COL: NEWS FEED */}
                <div className="lg:col-span-2 space-y-6">
                    {posts.map(post => (
                        <div key={post.id} className="glass-panel rounded-[32px] p-0 overflow-hidden shadow-xl bg-white/60">
                            {/* Post Header */}
                            <div className="p-6 flex justify-between items-start border-b border-white/40 bg-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {post.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">{post.author}</h4>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                                            <span className="text-primary/70">{post.role}</span>
                                            <span>•</span>
                                            <span>{post.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            
                            {/* Post Content */}
                            <div className="p-6 text-sm leading-relaxed whitespace-pre-line text-slate-700 font-medium">
                                {post.content}
                            </div>
                            
                            {/* Actions */}
                            <div className="px-6 py-4 flex items-center gap-6 border-t border-slate-100/50">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={cn("flex items-center gap-2 text-xs font-black uppercase transition-all", post.isLiked ? "text-pink-500" : "text-muted-foreground hover:text-slate-700")}
                                >
                                    <Heart className={cn("w-5 h-5", post.isLiked ? "fill-pink-500 scale-110" : "")} /> 
                                    {post.likes} Yêu Thích
                                </button>
                                <button 
                                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                    className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground hover:text-primary transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" /> 
                                    {post.comments.length} Bình Luận
                                </button>
                            </div>

                            {/* Comments Section */}
                            <AnimatePresence>
                                {activeCommentPostId === post.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-slate-50/50 border-t border-slate-100/50 overflow-hidden"
                                    >
                                        <div className="p-6 space-y-4">
                                            {post.comments.length === 0 ? (
                                                <p className="text-xs text-center text-muted-foreground italic">Chưa có bình luận nào.</p>
                                            ) : (
                                                post.comments.map(cmt => (
                                                    <div key={cmt.id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-xs text-slate-500">
                                                            {cmt.author.charAt(0)}
                                                        </div>
                                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
                                                            <div className="flex justify-between items-end mb-1">
                                                                <h5 className="font-bold text-xs">{cmt.author}</h5>
                                                                <span className="text-[9px] text-muted-foreground uppercase">{cmt.time}</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-600">{cmt.text}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            
                                            <div className="flex gap-2 pt-2 mt-4 border-t border-slate-200/50">
                                                <input 
                                                    type="text" 
                                                    value={newCommentText}
                                                    onChange={e => setNewCommentText(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSendComment(post.id)}
                                                    placeholder="Viết bình luận..." 
                                                    className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 shadow-inner"
                                                />
                                                <button onClick={() => handleSendComment(post.id)} className="p-2.5 bg-primary text-white rounded-xl shadow-md hover:scale-105 transition-transform">
                                                    <Send className="w-4 h-4 ml-0.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* RIGHT COL: ACTIVE USERS & CONTACTS */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-[32px] bg-white/40 shadow-xl border-white/60">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Đồng Nghiệp Trực Tuyến</h3>
                        <div className="space-y-4">
                            {contacts.map(contact => (
                                <div key={contact.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                {contact.name.charAt(0)}
                                            </div>
                                            {contact.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full shadow-sm" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-none mb-1">{contact.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{contact.role}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveChatId(contact.id)}
                                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BALLOON CHAT SYSTEM (Messenger Heads) --- */}
            {/* The Chat Head Balloon */}
            <AnimatePresence>
                {activeChatId && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                        drag
                        dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
                        dragElastic={0.1}
                        className="fixed bottom-6 right-6 z-[100] cursor-grab active:cursor-grabbing"
                        style={{ perspective: 1000 }}
                    >
                        <div className="relative">
                            {/* Balloon avatar */}
                            <div className="w-16 h-16 rounded-full bg-white shadow-2xl border-4 border-primary/20 flex items-center justify-center text-primary font-black text-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 cyber-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                                {activeChatUser?.name.charAt(0)}
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-success border-2 border-white rounded-full" />
                            </div>
                            
                            {/* Close badge */}
                            <button 
                                onClick={() => setActiveChatId(null)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {/* Chat Window Panel attached to Balloon */}
                            <div className="absolute bottom-20 right-0 w-[340px] glass-panel bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] border-white/60 overflow-hidden flex flex-col cursor-default h-[450px]">
                                {/* Chat Header */}
                                <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center gap-3 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {activeChatUser?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight">{activeChatUser?.name}</h4>
                                        <p className="text-[10px] text-success uppercase font-black tracking-widest mt-0.5">Đang trực tuyến</p>
                                    </div>
                                </div>
                                
                                {/* Chat Body */}
                                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-hide">
                                    <div className="text-center my-2 text-[10px] font-bold text-muted-foreground uppercase opacity-50 bg-slate-100 rounded-full py-1 px-3 w-max mx-auto">
                                        Chuẩn mã hóa End-to-End
                                    </div>
                                    {(chatMessages[activeChatId] || []).map((msg, i) => {
                                        const isMe = msg.sender === 'me';
                                        return (
                                            <div key={i} className={cn("flex flex-col max-w-[80%]", isMe ? "self-end items-end" : "self-start items-start")}>
                                                <div className={cn("px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium", isMe ? "bg-primary text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm")}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground mt-1 mx-1">{msg.time}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 shrink-0">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Nhắn tin riêng tư..." 
                                        className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 rounded-xl cyber-gradient text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
