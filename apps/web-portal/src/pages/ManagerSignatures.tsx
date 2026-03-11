import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
     
    Upload,
    PenTool,
    Trash2,
    ShieldAlert,
    CheckCircle2,
    X,
    Image as ImageIcon
} from "lucide-react";



export function ManagerSignatures() {
    // Manager manages their own signatures (could be multiple: initial, full, stamp)
    const [signatures, setSignatures] = useState([
        {
            id: 'sig_1',
            type: 'Chữ ký nháy',
            hasSignature: true,
            signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ph%E1%BA%A1m_Minh_Ch%C3%ADnh_signature.png",
            updatedAt: "10/05/2024"
        },
        {
            id: 'sig_2',
            type: 'Chữ ký đầy đủ',
            hasSignature: false,
            signatureUrl: "",
            updatedAt: ""
        }
    ]);
    
    const [selectedSig, setSelectedSig] = useState<typeof signatures[0] | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleDelete = (id: string) => {
        setSignatures(prev => prev.map(s => s.id === id ? { ...s, hasSignature: false, signatureUrl: "" } : s));
        setSelectedSig(null);
    };

    const handleMockUpload = () => {
        if (!selectedSig) return;
        setSignatures(prev => prev.map(s => 
            s.id === selectedSig.id ? { 
                ...s, 
                hasSignature: true, 
                signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ph%E1%BA%A1m_Minh_Ch%C3%ADnh_signature.png",
                updatedAt: new Date().toLocaleDateString()
            } : s
        ));
        setIsUploadModalOpen(false);
        setSelectedSig(null);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                        Quản lý chữ ký cá nhân
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Cập nhật các mẫu chữ ký số để sử dụng khi phê duyệt tài liệu.
                    </p>
                </div>
            </div>

            {/* Warning Alert */}
            <div className="p-5 rounded-3xl bg-warning/10 border border-warning/20 flex gap-4 items-start">
                <ShieldAlert className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-warning mb-1">Lưu ý bảo mật</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Chữ ký tải lên sẽ được mã hóa và gắn với chứng thư số cá nhân của bạn. Tuyệt đối không chia sẻ tài khoản cho người khác. Mọi thao tác ký số đều được lưu lại trong Audit Logs.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {signatures.map((sig, i) => (
                    <motion.div 
                        key={sig.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-8 rounded-[40px] border-white/60 shadow-2xl bg-white/40 flex flex-col group hover:border-primary/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="font-black text-xl tracking-tight">{sig.type}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Sử dụng cho: {sig.type === 'Chữ ký nháy' ? 'Tài liệu nội bộ' : 'Hợp đồng, Quyết định'}</p>
                            </div>
                            {sig.hasSignature ? (
                                <div className="px-4 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20 flex items-center gap-1.5 shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Khả dụng
                                </div>
                            ) : (
                                <div className="px-4 py-1.5 rounded-full bg-slate-200/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-300">
                                    Chưa thiết lập
                                </div>
                            )}
                        </div>

                        {/* Signature Preview Area */}
                        <div className="flex-1 bg-white/60 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center p-8 mb-8 relative overflow-hidden min-h-[250px]">
                            {sig.hasSignature ? (
                                <>
                                    <img src={sig.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply opacity-90 scale-110" />
                                    <div className="absolute bottom-4 right-5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-white/80 px-3 py-1 rounded-lg backdrop-blur-sm">Cập nhật: {sig.updatedAt}</div>
                                </>
                            ) : (
                                <div className="text-center opacity-40">
                                    <PenTool className="w-12 h-12 mx-auto mb-3" />
                                    <p className="text-xs font-black uppercase tracking-widest">Khu vực hiển thị</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setSelectedSig(sig); setIsUploadModalOpen(true); }}
                                className="flex-1 py-4 rounded-2xl cyber-gradient text-white text-[10px] font-black uppercase tracking-widest shadow-neon hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                {sig.hasSignature ? <PenTool className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                {sig.hasSignature ? "Tải lên bản mới" : "Tải lên chữ ký"}
                            </button>
                            {sig.hasSignature && (
                                <button 
                                    onClick={() => { setSelectedSig(sig); }} 
                                    className="p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm flex items-center justify-center"
                                    title="Xóa chữ ký"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Upload / Delete Confirm */}
            <AnimatePresence>
                {selectedSig && !isUploadModalOpen && selectedSig.hasSignature && (
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
                            <h3 className="text-xl font-black mb-2">Xóa mẫu chữ ký?</h3>
                            <p className="text-sm text-muted-foreground mb-8">Bạn có chắc chắn muốn xóa mẫu <span className="font-bold text-foreground">{selectedSig.type}</span> không?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedSig(null)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                                <button onClick={() => handleDelete(selectedSig.id)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase bg-destructive text-white shadow-md hover:shadow-lg transition-all">Xóa ngay</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isUploadModalOpen && selectedSig && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md glass-panel rounded-[40px] p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95"
                        >
                            <button onClick={() => { setIsUploadModalOpen(false); setSelectedSig(null); }} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic gradient-text mb-1">Cập nhật chữ ký</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8">Loại: {selectedSig.type}</p>

                            <div className="border-2 border-dashed border-primary/40 rounded-3xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                                <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <ImageIcon className="w-10 h-10 text-primary" />
                                </div>
                                <p className="text-base font-black text-primary mb-2">Kéo thả file ảnh chữ ký</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Hỗ trợ PNG nền trong suốt</p>
                            </div>

                            <button onClick={handleMockUpload} className="w-full mt-8 py-4 rounded-2xl cyber-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-neon hover:scale-[1.02] transition-transform">
                                Lưu thay đổi
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}