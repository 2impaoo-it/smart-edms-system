import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    
    PenTool,
    FileText,
    Clock,
    CheckCircle2,
    
    
    Download,
    Eye,
    Zap,
    
} from "lucide-react";

import { cn } from "../lib/utils";
import { SignerWorkspace } from "./SignerWorkspace";

export function ManagerApprovals() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

    // Filter files
    const displayFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ? true : f.status === filterStatus;
        // Don't show folders here
        return f.type !== 'folder' && matchesSearch && matchesStatus;
    });

    const handleSignSuccess = (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'signed' as const } : f));
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Modal Trình Ký */}
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
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <PenTool className="w-8 h-8 text-primary" />
                        Danh sách trình ký
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Quản lý toàn bộ văn bản, tài liệu đang chờ bạn phê duyệt.
                    </p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none cyber-gradient px-6 py-3 rounded-2xl text-white font-black text-[10px] flex items-center justify-center gap-2 shadow-neon hover:scale-105 transition-all uppercase tracking-widest whitespace-nowrap">
                        <Zap className="w-4 h-4 fill-white" /> Duyệt nhanh hàng loạt
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="glass-panel rounded-[40px] overflow-hidden flex flex-col shadow-2xl bg-white/40 border-white/60 min-h-[600px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-white/20 bg-white/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tên tài liệu, mã số..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/60 border border-white/40 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {[
                            { id: "all", label: "Tất cả" },
                            { id: "pending", label: "Chờ duyệt" },
                            { id: "signed", label: "Đã ký" }
                        ].map(f => (
                            <button 
                                key={f.id}
                                onClick={() => setFilterStatus(f.id)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                                    filterStatus === f.id 
                                        ? "bg-primary text-white border-primary shadow-neon" 
                                        : "bg-white/50 text-muted-foreground border-white/40 hover:bg-white"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-100/80 backdrop-blur-md z-10 shadow-sm">
                            <tr className="uppercase text-[9px] font-black tracking-[0.2em] text-muted-foreground">
                                <th className="px-6 py-5 w-12 text-center">
                                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                                </th>
                                <th className="px-6 py-5">Tên tài liệu</th>
                                <th className="px-6 py-5">Người trình</th>
                                <th className="px-6 py-5">Thời gian cập nhật</th>
                                <th className="px-6 py-5 text-center">Trạng thái</th>
                                <th className="px-6 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayFiles.map((file, i) => (
                                <motion.tr 
                                    key={file.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-t border-white/20 hover:bg-white/60 transition-colors group"
                                >
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 text-primary">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{file.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Dung lượng: {file.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 border border-white" />
                                            <span className="text-xs font-bold text-slate-700">Nguyễn Văn Nhân Viên</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold">{file.updatedAt}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {file.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-[9px] font-black uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" /> Chờ duyệt
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-[9px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã ký
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {file.status === 'pending' ? (
                                            <button 
                                                onClick={() => setSelectedFileId(file.id)}
                                                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-neon transition-all"
                                            >
                                                Mở ký
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-white rounded-lg transition-colors text-muted-foreground hover:text-primary" title="Xem chi tiết">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white rounded-lg transition-colors text-muted-foreground hover:text-primary" title="Tải xuống">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                            {displayFiles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 opacity-40" />
                                        </div>
                                        <p className="font-bold text-sm">Không tìm thấy tài liệu nào phù hợp.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                <div className="p-4 border-t border-white/20 bg-white/20 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Tổng số: {displayFiles.length} tài liệu</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white transition-colors disabled:opacity-50">Trước</button>
                        <button className="px-3 py-1.5 bg-white rounded-lg text-primary shadow-sm">1</button>
                        <button className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white transition-colors">Tiếp</button>
                    </div>
                </div>
            </div>
        </div>
    );
}