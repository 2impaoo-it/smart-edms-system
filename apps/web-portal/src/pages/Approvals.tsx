import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Clock, FileText, CheckCircle, XCircle, Search, PenTool, X, ShieldAlert, List } from 'lucide-react';
import { gooeyToast as toast } from "goey-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getPendingApprovalsForMe, processApprovalAction, getApprovalHistory } from '../services/approvalService';
import { getDocumentStreamUrl, signDocument } from '../services/documentService';
import type { FileItem } from '../lib/types';

export const Approvals = () => {
    const [approvals, setApprovals] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Viewer State
    const [viewFileId, setViewFileId] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    
    // Sign Modal State
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [signPassword, setSignPassword] = useState("");
    const [signReason, setSignReason] = useState("Phê duyệt chuyên môn");
    const [signP12File, setSignP12File] = useState<File | null>(null);

    // Dynamic Approval State
    const [documentApprovalHistory, setDocumentApprovalHistory] = useState<any[]>([]);
    const [showApprovalPath, setShowApprovalPath] = useState(false);
    const [currentStepInfo, setCurrentStepInfo] = useState<any>(null);

    const fetchApprovals = async () => {
        setIsLoading(true);
        try {
            const res = await getPendingApprovalsForMe();
            const rawData = Array.isArray(res.data) ? res.data : [];
            
            // Map ApprovalHistoryDTO to a format suitable for the table
            const mapped = rawData.map((item: any) => ({
                id: String(item.documentId), // Use documentId as the primary ID for viewing
                historyId: item.id,
                name: item.documentName || "Document",
                type: 'pdf' as const,
                size: '--',
                updatedAt: item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'Chờ duyệt',
                owner: item.approverName || 'N/A',
                status: 'PENDING_APPROVAL' as const,
                requireSignature: item.requireSignature
            }));
            setApprovals(mapped);
        } catch (error) {
            console.error("Fetch pending approvals err:", error);
            toast.error("Tải dữ liệu thất bại", { description: "Không thể kết nối để lấy danh sách tài liệu chờ duyệt." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    // Load PDF and History when viewFileId changes
    useEffect(() => {
        if (!viewFileId) {
            setPdfUrl(null);
            setDocumentApprovalHistory([]);
            setShowApprovalPath(false);
            setCurrentStepInfo(null);
            return;
        }

        // Find the specific approval info for this document in the list
        const info = approvals.find(a => a.id === viewFileId);
        setCurrentStepInfo(info);

        // Fetch Full History
        getApprovalHistory(Number(viewFileId)).then(res => {
            setDocumentApprovalHistory(res.data || []);
        }).catch(console.error);

        let blobUrl: string | null = null;
        const fetchPdf = async () => {
            try {
                const response = await getDocumentStreamUrl(viewFileId);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                blobUrl = URL.createObjectURL(blob);
                setPdfUrl(blobUrl);
            } catch (error) {
                toast.error("Không thể xem trước", { description: "Định dạng không hỗ trợ hoặc file PDF bị hỏng." });
            }
        };

        fetchPdf();

        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [viewFileId, approvals]);

    const handleReject = async (id: string) => {
        try {
            await processApprovalAction({
                documentId: Number(id),
                approved: false,
                rejectionReason: "Từ chối duyệt tài liệu này",
                comments: "Người duyệt đã chọn từ chối qua trang quản lý phê duyệt"
            });
            toast.success("Từ chối thành công", { description: "Tài liệu đã được trả lại cho người trình ký." });
            fetchApprovals();
            setViewFileId(null);
        } catch (e: any) {
            toast.error("Thao tác thất bại", { description: e?.response?.data?.message || "Lỗi khi từ chối tài liệu." });
        }
    };

    const handleApproveWithoutSign = async (id: string) => {
        try {
            await processApprovalAction({
                documentId: Number(id),
                approved: true,
                comments: "Đã phê duyệt (Duyệt nhanh hồ sơ)"
            });
            toast.success("Phê duyệt thành công", { description: "Tài liệu đã được duyệt mã không cần chữ ký số." });
            fetchApprovals();
            setViewFileId(null);
        } catch (e: any) {
            toast.error("Thao tác thất bại", { description: e?.response?.data?.message || "Lỗi khi phê duyệt tài liệu." });
        }
    };

    const handleSignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewFileId || !signP12File || !signPassword) {
            toast.error("Khung ký lỗi", { description: "Vui lòng chọn file chứng thư (.p12) và nhập mật khẩu." });
            return;
        }

        const signTask = signDocument(viewFileId, signP12File, signPassword, signReason, "Smart EDMS Core");
        
        toast.promise(signTask, {
            loading: "Đang xử lý chữ ký...",
            success: "Ký duyệt thành công!",
            error: "Ký số thất bại",
            description: {
                loading: "Hệ thống đang mật mã hóa và đóng dấu PDF...",
                success: "Tài liệu đã được ký số và lưu trữ an toàn.",
                error: "Sai mật khẩu hoặc file chứng thư số bị lỗi."
            }
        });

        try {
            await signTask;
            // Cập nhật trạng thái workflow
            try {
                await processApprovalAction({
                    documentId: Number(viewFileId),
                    approved: true,
                    comments: signReason || "Đã ký số tài liệu qua trang Quản lý Phê duyệt"
                });
            } catch (workflowErr) {
                console.error("Workflow update error:", workflowErr);
            }

            setIsSignModalOpen(false);
            setSignP12File(null);
            setSignPassword("");
            fetchApprovals();
            setViewFileId(null);
        } catch (error) {
            console.error("Sign error:", error);
            // Modal still open for retry
        }
    };

    const filteredApprovals = approvals.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const fileToView = approvals.find(f => f.id === viewFileId);

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 relative min-h-[600px] pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight uppercase italic gradient-text mb-2">Quản lý Phê duyệt</h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Danh sách tài liệu đang chờ bạn ký duyệt</p>
                </div>
                
                <div className="flex w-full lg:w-auto items-center gap-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-1.5 focus-within:ring-2 ring-primary/20 transition-all shadow-sm">
                    <Search className="w-5 h-5 ml-3 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tài liệu..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-2 px-2 w-full lg:w-64"
                    />
                </div>
            </div>

            {/* List */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/60 shadow-[0_8px_32px_rgba(99,102,241,0.05)] bg-white/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black tracking-widest text-slate-500">
                                <th className="p-4 pl-6">Tài liệu</th>
                                <th className="p-4">Người trình ký</th>
                                <th className="p-4">Ngày cập nhật</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400">
                                        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredApprovals.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-16 text-slate-400">
                                        <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                                        <p className="font-bold">Không có tài liệu nào đang chờ duyệt.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredApprovals.map(file => (
                                    <tr key={file.id} className="border-b border-slate-50 hover:bg-white/60 transition-colors group cursor-pointer" onClick={() => setViewFileId(file.id)}>
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{file.name}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Dung lượng: {file.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-700">{file.owner}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" /> {file.updatedAt}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setViewFileId(file.id); }}
                                                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all"
                                            >
                                                Xem & Duyệt
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Document Modal */}
            {createPortal(
                <AnimatePresence>
                    {viewFileId && fileToView && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-5xl h-[90vh] glass-panel rounded-[40px] overflow-hidden border-white/60 shadow-2xl bg-white flex flex-col"
                            >
                                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><FileText className="w-5 h-5" /></div>
                                        <div>
                                            <h3 className="font-black text-lg">{fileToView.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] font-bold text-warning uppercase tracking-widest">
                                                    Trạng thái: Đang chờ duyệt
                                                </p>
                                                {currentStepInfo?.requireSignature && (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 uppercase tracking-tighter italic">Bắt buộc Ký Số</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowApprovalPath(!showApprovalPath)} className="p-3 bg-secondary text-secondary-foreground rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                            <List className="w-4 h-4" /> <span className="text-[10px] font-black uppercase hidden sm:inline">Luồng Duyệt</span>
                                        </button>
                                        {currentStepInfo?.requireSignature ? (
                                            <button onClick={() => setIsSignModalOpen(true)} className="p-3 bg-primary text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-neon">
                                                <PenTool className="w-4 h-4" /> <span className="text-[10px] font-black uppercase hidden sm:inline">Ký Số & Phê Duyệt</span>
                                            </button>
                                        ) : (
                                            <button onClick={() => handleApproveWithoutSign(fileToView.id)} className="p-3 bg-success text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> <span className="text-[10px] font-black uppercase hidden sm:inline">Duyệt nhanh</span>
                                            </button>
                                        )}
                                        <button onClick={() => handleReject(fileToView.id)} className="p-3 bg-destructive text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                            <XCircle className="w-4 h-4" /> <span className="text-[10px] font-black uppercase hidden sm:inline">Từ chối</span>
                                        </button>
                                        <button onClick={() => setViewFileId(null)} className="p-3 hover:bg-slate-200 rounded-xl transition-all bg-slate-100 ml-2">
                                            <X className="w-5 h-5 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-1 overflow-hidden">
                                    <div className={`flex-1 bg-slate-200/50 flex items-center justify-center p-8 overflow-auto transition-all duration-300 ${showApprovalPath ? 'w-2/3' : 'w-full'}`}>
                                        {pdfUrl ? (
                                            <iframe src={`${pdfUrl}#t=${Date.now()}`} className="w-full h-full rounded-xl shadow-xl border-0 bg-white" title="PDF Viewer" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-xl min-h-[400px] w-full max-w-2xl">
                                                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
                                                <h3 className="text-xl font-black mb-2">Đang tải tài liệu...</h3>
                                            </div>
                                        )}
                                    </div>
                                    <AnimatePresence>
                                        {showApprovalPath && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: 350, opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="border-l border-slate-200 bg-slate-50 flex flex-col shrink-0"
                                            >
                                                <div className="p-4 font-black text-sm border-b border-slate-200 bg-white flex justify-between items-center">
                                                    <span>Lịch Sử Luồng Duyệt</span>
                                                    <button onClick={() => setShowApprovalPath(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                    {documentApprovalHistory.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground text-center mt-4">Chưa có luồng duyệt nào được cấu hình</p>
                                                    ) : (
                                                        documentApprovalHistory.map((step, idx) => (
                                                            <div key={step.id} className="relative pl-6">
                                                                {/* Timeline vertical line */}
                                                                {idx < documentApprovalHistory.length - 1 && (
                                                                    <div className="absolute left-[9px] top-6 bottom-[-24px] w-px bg-slate-200"></div>
                                                                )}
                                                                
                                                                {/* Timeline dot */}
                                                                <div className={`absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full border-4 border-slate-50 z-10 flex items-center justify-center
                                                                    ${step.status === 'APPROVED' ? 'bg-success' : 
                                                                    step.status === 'REJECTED' ? 'bg-destructive' : 
                                                                    'bg-slate-300'}`}
                                                                ></div>
                                                                
                                                                <div className="bg-white border text-left border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <span className="text-[10px] font-black uppercase text-primary tracking-wider">Cấp duyệt {step.approvalLevel}</span>
                                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${step.status === 'APPROVED' ? 'bg-success/10 text-success' : step.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                                                                            {step.status === 'APPROVED' ? 'Đã duyệt' : step.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-xs font-bold text-slate-800">{step.approverName}</h4>
                                                                    <p className="text-[10px] text-slate-500 font-medium mb-2">{step.approverJobTitle}</p>
                                                                    
                                                                    <div className="flex items-center gap-1.5 mb-2">
                                                                        <span className="text-[10px] font-medium text-slate-600 border border-slate-200 bg-slate-50 px-1.5 py-0.5 rounded-md">
                                                                            Yêu cầu tác vụ: <strong className="text-slate-800">{step.requireSignature ? "KÝ SỐ" : "PHÊ DUYỆT"}</strong>
                                                                        </span>
                                                                    </div>

                                                                    {step.reviewedAt && (
                                                                        <div className="text-[9px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(step.reviewedAt).toLocaleString('vi-VN')}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {step.comments && (
                                                                        <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100 italic">"{step.comments}"</p>
                                                                    )}
                                                                    {step.rejectionReason && (
                                                                        <p className="text-[10px] text-destructive bg-destructive/5 p-2 rounded-lg mt-2 border border-destructive/10 font-bold">Lý do từ chối: {step.rejectionReason}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Sign Document Modal */}
            {createPortal(
                <AnimatePresence>
                    {isSignModalOpen && viewFileId && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-sm glass-panel rounded-[40px] p-8 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.4)] bg-white/95"
                            >
                                <button onClick={() => setIsSignModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black mb-1">Ký số tài liệu</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 truncate">File: {fileToView?.name}</p>

                                <form onSubmit={handleSignSubmit}>
                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-1">File Chứng Thư Số (.p12/.pfx)</label>
                                            <input 
                                                type="file" 
                                                accept=".p12,.pfx,.pem"
                                                onChange={(e) => setSignP12File(e.target.files ? e.target.files[0] : null)}
                                                className="w-full text-sm font-medium file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-black file:py-2 file:px-4 hover:file:bg-primary/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu khóa (Passphrase)</label>
                                            <input 
                                                type="password" 
                                                placeholder="Nhập mật khẩu..." 
                                                value={signPassword}
                                                onChange={e => setSignPassword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-1">Lý do ký</label>
                                            <input 
                                                type="text" 
                                                placeholder="Phê duyệt, Đồng ý..." 
                                                value={signReason}
                                                onChange={e => setSignReason(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setIsSignModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase text-muted-foreground bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                                        <button type="submit" disabled={!signP12File || !signPassword.trim()} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase bg-primary text-white shadow-neon hover:scale-[1.02] disabled:opacity-50 transition-all">Khởi tạo Ký</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};