import { useState, useMemo } from "react";
import { 
    Trash2, 
    RefreshCcw, 
    AlertTriangle, 
    Search,
    FileText,
    Folder
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FileItem } from "../lib/types";


interface RecycleBinProps {
    user: any;
}

export function RecycleBin({ user }: RecycleBinProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

    const deletedFiles = useMemo(() => {
        return files.filter(f => {
            if (!f.isDeleted) return false;
            // Mỗi người chỉ thấy rác của chính mình
            return f.owner === user.id;
        }).filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [files, user.id, searchTerm]);

    const handleRestore = (id: string) => {
        setFiles(files.map(f => {
            if (f.id === id) {
                return { ...f, isDeleted: false, deletedAt: undefined };
            }
            return f;
        }));
    };

    const handleHardDelete = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
        setShowConfirmModal(null);
    };

    const handleEmptyBin = () => {
        const deletedIds = deletedFiles.map(f => f.id);
        setFiles(files.filter(f => !deletedIds.includes(f.id)));
    };

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'folder': return <Folder className="w-8 h-8 text-primary" />;
            default: return <FileText className="w-8 h-8 text-destructive" />;
        }
    };

    const calculateDaysLeft = (deletedAt?: string) => {
        if (!deletedAt) return 15;
        const deletedDate = new Date(deletedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, 15 - diffDays);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 relative min-h-[600px] pb-20">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Trash2 className="w-8 h-8 text-destructive" />
                        <h2 className="text-3xl font-black tracking-tight uppercase italic gradient-text">Thùng rác</h2>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">
                        Tài liệu sẽ tự động xóa vĩnh viễn sau 15 ngày
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Tìm trong thùng rác..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                        />
                    </div>
                    {deletedFiles.length > 0 && (
                        <button onClick={handleEmptyBin} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive hover:text-white transition-all">
                            <AlertTriangle className="w-4 h-4" /> Làm sạch
                        </button>
                    )}
                </div>
            </div>

            {/* List Area */}
            <div className="glass-panel rounded-[32px] bg-white/40 dark:bg-slate-900/40 p-2 md:p-6">
                {deletedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border-dashed rounded-[24px] border border-white/40">
                        <Trash2 className="w-16 h-16 text-muted-foreground opacity-10 mb-6" />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Thùng rác trống</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {deletedFiles.map(file => (
                            <motion.div 
                                key={file.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 hover:border-primary/30 transition-all group gap-4 md:gap-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors">{file.name}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                                            <span>Xóa lúc: {file.deletedAt ? new Date(file.deletedAt).toLocaleDateString() : 'N/A'}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-warning">Còn {calculateDaysLeft(file.deletedAt)} ngày</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <button 
                                        onClick={() => handleRestore(file.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-xs rounded-xl transition-all"
                                    >
                                        <RefreshCcw className="w-3.5 h-3.5" /> Khôi phục
                                    </button>
                                    <button 
                                        onClick={() => setShowConfirmModal(file.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold text-xs rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Xóa vĩnh viễn
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm glass-panel rounded-[40px] p-8 border-destructive/30 shadow-2xl bg-white/95"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 mx-auto">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black mb-2 text-center">Xóa vĩnh viễn?</h3>
                            <p className="text-xs font-bold text-muted-foreground text-center mb-8">
                                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa tài liệu này khỏi hệ thống?
                            </p>

                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirmModal(null)} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                                <button onClick={() => handleHardDelete(showConfirmModal)} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase bg-destructive text-white shadow-neon hover:scale-[1.02] transition-all">Xác nhận xóa</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
