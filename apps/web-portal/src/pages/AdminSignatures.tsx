import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    Upload,
    PenTool,
    Trash2,
    ShieldAlert,
    CheckCircle2,
    X,
    Image as ImageIcon
} from "lucide-react";



// Mock signatures data mapped to managers
const initialSignatures: any[] = ([] as any[]).filter(u => u.role === 'MANAGER').map(manager => ({
    id: manager.id,
    managerName: manager.name,
    managerEmail: manager.email,
    department: manager.department,
    avatar: manager.avatar,
    hasSignature: Math.random() > 0.3, // Randomly assign some to not have signatures
    signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ph%E1%BA%A1m_Minh_Ch%C3%ADnh_signature.png", // Mock generic signature
    updatedAt: new Date().toLocaleDateString()
}));

export function AdminSignatures() {
    const [signatures, setSignatures] = useState(initialSignatures);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedManager, setSelectedManager] = useState<typeof initialSignatures[0] | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const filteredSignatures = signatures.filter(s => 
        s.managerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        setSignatures(prev => prev.map(s => s.id === id ? { ...s, hasSignature: false, signatureUrl: "" } : s));
        setSelectedManager(null);
    };

    const handleMockUpload = () => {
        if (!selectedManager) return;
        setSignatures(prev => prev.map(s => 
            s.id === selectedManager.id ? { 
                ...s, 
                hasSignature: true, 
                signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ph%E1%BA%A1m_Minh_Ch%C3%ADnh_signature.png",
                updatedAt: new Date().toLocaleDateString()
            } : s
        ));
        setIsUploadModalOpen(false);
        setSelectedManager(null);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                        Quản lý chữ ký số
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Kiểm soát và cấp phát chữ ký điện tử cho cấp quản lý.
                    </p>
                </div>
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên quản lý, phòng ban..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full glass-panel border border-white/60 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSignatures.map((sig, i) => (
                    <motion.div 
                        key={sig.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-[32px] border-white/60 shadow-xl bg-white/40 flex flex-col group hover:border-primary/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4 items-center">
                                <img src={sig.avatar} alt={sig.managerName} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" />
                                <div>
                                    <h4 className="font-black text-base truncate">{sig.managerName}</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{sig.department}</p>
                                </div>
                            </div>
                            {sig.hasSignature ? (
                                <div className="px-3 py-1 rounded-full bg-success/10 text-success text-[9px] font-black uppercase tracking-widest border border-success/20 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Đã cấp
                                </div>
                            ) : (
                                <div className="px-3 py-1 rounded-full bg-warning/10 text-warning text-[9px] font-black uppercase tracking-widest border border-warning/20">
                                    Chưa có
                                </div>
                            )}
                        </div>

                        {/* Signature Preview Area */}
                        <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center p-4 mb-6 relative overflow-hidden min-h-[120px]">
                            {sig.hasSignature ? (
                                <>
                                    <img src={sig.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply opacity-80" />
                                    <div className="absolute bottom-2 right-3 text-[9px] font-bold text-muted-foreground">Cập nhật: {sig.updatedAt}</div>
                                </>
                            ) : (
                                <div className="text-center opacity-40">
                                    <PenTool className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Trống</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setSelectedManager(sig); setIsUploadModalOpen(true); }}
                                className="flex-1 py-3 rounded-xl cyber-gradient text-white text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-neon transition-all flex items-center justify-center gap-2"
                            >
                                {sig.hasSignature ? <PenTool className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                {sig.hasSignature ? "Cập nhật" : "Tải lên"}
                            </button>
                            {sig.hasSignature && (
                                <button 
                                    onClick={() => { setSelectedManager(sig); }} // We'll show confirmation in a real app, here we just show selected modal
                                    className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                                    title="Xóa chữ ký"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Upload / Delete Confirm */}
            <AnimatePresence>
                {selectedManager && !isUploadModalOpen && selectedManager.hasSignature && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm glass-panel rounded-[40px] p-8 border-white/60 shadow-2xl bg-white text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black mb-2">Thu hồi chữ ký?</h3>
                            <p className="text-sm text-muted-foreground mb-8">Bạn có chắc chắn muốn xóa chữ ký số của <span className="font-bold text-foreground">{selectedManager.managerName}</span> không?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedManager(null)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                                <button onClick={() => handleDelete(selectedManager.id)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase bg-destructive text-white shadow-md hover:shadow-lg transition-all">Thu hồi ngay</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isUploadModalOpen && selectedManager && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md glass-panel rounded-[40px] p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95"
                        >
                            <button onClick={() => { setIsUploadModalOpen(false); setSelectedManager(null); }} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic gradient-text mb-1">Cấp phát chữ ký</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8">Nhân sự: {selectedManager.managerName}</p>

                            <div className="border-2 border-dashed border-primary/40 rounded-3xl p-10 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-sm font-bold text-primary mb-1">Kéo thả file ảnh chữ ký vào đây</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Hỗ trợ PNG, JPG (Nền trong suốt)</p>
                            </div>

                            <button onClick={handleMockUpload} className="w-full mt-8 py-4 rounded-2xl cyber-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-neon hover:scale-[1.02] transition-transform">
                                Lưu chữ ký hệ thống
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}