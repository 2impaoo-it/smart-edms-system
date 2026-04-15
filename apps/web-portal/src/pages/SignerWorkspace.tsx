import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, PenTool, CheckCircle2, Info, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { approveDocument, visualSignDocument, getDocumentById, getDocumentStreamUrl } from "../services/documentService";
import { processApprovalAction } from "../services/approvalService";
import { gooeyToast as toast } from "goey-toast";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SignaturePos {
    signatureBase64: string;
    width: number;
    height: number;
}

export function SignerWorkspace({ fileId, onClose, onSignSuccess }: { fileId: string; onClose: () => void; onSignSuccess?: (id: string) => void }) {
    const [zoom, setZoom] = useState(100);
    const [signatures, setSignatures] = useState<SignaturePos[]>([]);
    const [showSignPad, setShowSignPad] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // PDF State
    const [docData, setDocData] = useState<any>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (window.innerWidth < 768) setZoom(60);
        let url: string | null = null;
        
        const fetchData = async () => {
            try {
                const metaRes = await getDocumentById(fileId);
                setDocData(metaRes.data);
                
                const blobRes = await getDocumentStreamUrl(fileId);
                url = window.URL.createObjectURL(blobRes.data);
                setPdfBlobUrl(url);
            } catch (err) {
                toast.error("Không thể tải tài liệu gốc.");
            }
        };
        fetchData();
        return () => { if (url) window.URL.revokeObjectURL(url); };
    }, [fileId]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handleClearCanvas = () => {
        canvasRef.current?.getContext('2d')?.clearRect(0,0,600,300);
    };

    const handleAddSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const base64 = canvas.toDataURL("image/png");
        setSignatures([...signatures, { 
            signatureBase64: base64, width: 150, height: 80 
        }]);
        setShowSignPad(false);
    };

    const handleCompleteSign = async () => {
        setIsSaving(true);
        try {
            if (signatures.length > 0) {
                const sig = signatures[0];
                const scale = zoom / 100;
                
                const pdfContainer = document.getElementById("pdf-page-container");
                const sigElement = document.getElementById(`signature-box-0`);
                
                let finalX = 50;
                let finalY = 50;
                
                if (pdfContainer && sigElement) {
                    const pdfRect = pdfContainer.getBoundingClientRect();
                    const sigRect = sigElement.getBoundingClientRect();
                    finalX = sigRect.left - pdfRect.left;
                    finalY = sigRect.top - pdfRect.top;
                }
                
                await visualSignDocument(fileId, {
                    signatureBase64: sig.signatureBase64,
                    x: finalX / scale,
                    y: finalY / scale,
                    width: sig.width / scale,
                    height: sig.height / scale,
                    pageNumber: pageNumber
                });
                // Nối tiếp quá trình duyệt/chuyển người
                if (docData?.approvalWorkflowId) {
                    await processApprovalAction({
                        documentId: Number(fileId),
                        approved: true,
                        comments: "Đã ký kiểm duyệt thành công"
                    });
                } else {
                    await approveDocument(fileId);
                }
            } else {
                if (docData?.approvalWorkflowId) {
                    await processApprovalAction({
                        documentId: Number(fileId),
                        approved: true,
                        comments: "Đã xem xét và thông qua"
                    });
                } else {
                    await approveDocument(fileId);
                }
            }
            toast.success("Đã hoàn tất duyệt và chuyển hồ sơ thành công");
            onSignSuccess?.(fileId);
            onClose();
        } catch (error: any) {
            toast.error("Phê duyệt thất bại", { description: error?.response?.data?.message || "Lỗi hệ thống" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col overflow-hidden"
        >
            <header className="h-16 lg:h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 lg:px-8 shadow-2xl relative z-10 shrink-0">
                <div className="flex items-center gap-3 lg:gap-5">
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="hidden sm:block">
                        <h2 className="text-sm lg:text-base font-black tracking-tight">{docData?.name || "Đang tải tệp..."}</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chế độ trình ký chuyên nghiệp</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                        <button onClick={() => setZoom(Math.max(30, zoom - 10))} className="p-2 hover:text-primary"><ZoomOut className="w-4 h-4" /></button>
                        <span className="text-[10px] font-black w-12 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-2 hover:text-primary"><ZoomIn className="w-4 h-4" /></button>
                    </div>

                    <button 
                        onClick={() => setShowSignPad(true)}
                        className="flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-xl bg-primary text-white text-[10px] lg:text-xs font-black shadow-neon transition-all hover:scale-105"
                    >
                        <PenTool className="w-4 h-4" /> <span className="hidden sm:inline">THÊM CHỮ KÝ</span>
                    </button>
                    
                    <button 
                        onClick={handleCompleteSign}
                        disabled={isSaving || (signatures.length === 0 && !docData)}
                        className={cn(
                            "flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-xl text-[10px] lg:text-xs font-black transition-all shadow-lg",
                            !isSaving && docData ? "bg-success text-white hover:brightness-110" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? <span className="animate-spin">⌛</span> : <CheckCircle2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isSaving ? "ĐANG XỬ LÝ..." : (signatures.length > 0 ? "HOÀN TẤT & KÝ" : "HOÀN TẤT (KHÔNG KÝ)")}</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-4 lg:p-12 flex flex-col items-center custom-scrollbar">
                    {pdfBlobUrl ? (
                        <div className="relative shadow-[0_30px_100px_rgba(0,0,0,0.2)] bg-white origin-top transition-all duration-300">
                            <Document 
                                file={pdfBlobUrl} 
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest">Đang kết xuất tệp PDF...</div>}
                            >
                                {/* PDF Container ID used for getBoundingClientRect bounds check */}
                                <div id="pdf-page-container" className="relative group">
                                    <Page 
                                        pageNumber={pageNumber} 
                                        scale={zoom / 100} 
                                        renderTextLayer={false} 
                                        renderAnnotationLayer={false}
                                    />

                                    {signatures.map((sig, idx) => (
                                        <motion.div
                                            key={idx}
                                            id={`signature-box-${idx}`}
                                            drag
                                            dragMomentum={false}
                                            className="absolute cursor-move border-[3px] border-dashed border-primary/50 bg-primary/5 p-1 flex items-center justify-center backdrop-blur-sm z-50 hover:border-primary transition-colors"
                                            style={{ left: 50, top: 50, width: sig.width * (zoom/100), height: sig.height * (zoom/100) }}
                                        >
                                            <img src={sig.signatureBase64} alt="signature" className="w-full h-full object-contain pointer-events-none drop-shadow-lg" />
                                            <button 
                                                onClick={() => setSignatures(signatures.filter((_, i) => i !== idx))}
                                                className="absolute -top-4 -right-4 p-1.5 bg-destructive text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </Document>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-20 opacity-50"><p className="font-black text-xs uppercase">Đang tải tài liệu gốc...</p></div>
                    )}

                    {/* PDF Pagination Controls */}
                    {numPages && numPages > 1 && (
                        <div className="fixed bottom-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-full py-2 px-6 flex items-center gap-4 shadow-2xl">
                            <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className="p-1 hover:text-primary disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
                            <span className="text-[10px] font-black uppercase tracking-widest">Trang {pageNumber} / {numPages}</span>
                            <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} className="p-1 hover:text-primary disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                    )}
                </div>

                <aside className="hidden xl:flex w-[350px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 p-8 flex-col gap-8 shrink-0">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Chi tiết quy trình</h3>
                        <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase">Trạng thái hiện tại</p>
                                <p className="text-sm font-bold text-warning">{docData ? 'Đang đợi bạn ký' : '...'}</p>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-white/10" />
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase">Ghi chú</p>
                                <p className="text-sm font-bold opacity-80 mt-1 line-clamp-2">{docData?.description || "Không xác định"}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto p-6 rounded-[24px] cyber-gradient text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Info className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase">Hướng dẫn</span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed opacity-90">
                            Nhấn "Thêm chữ ký" để vẽ chữ ký, sau đó kéo thả khung chữ ký vào đúng nơi cần làm dấu phác thảo. Bạn có thể sử dụng các nút cuộn trang bên dưới để ký ở trang cuồi.
                        </p>
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {showSignPad && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                            onClick={() => setShowSignPad(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-black tracking-tight">Vẽ chữ ký tay</h3>
                                <button onClick={() => setShowSignPad(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 lg:p-10 space-y-8">
                                <div className="bg-slate-50 dark:bg-black/20 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-white/10 touch-none">
                                    <canvas 
                                        ref={canvasRef}
                                        width={600} height={300}
                                        className="w-full h-[250px] lg:h-[300px] cursor-crosshair"
                                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={handleClearCanvas}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-black text-xs text-muted-foreground hover:bg-slate-50 transition-all"
                                    >
                                        LÀM TRỐNG
                                    </button>
                                    <button 
                                        onClick={handleAddSignature}
                                        className="flex-[2] cyber-gradient py-4 rounded-2xl text-white font-black text-xs shadow-neon transition-all hover:scale-[1.02]"
                                    >
                                        SỬ DỤNG CHỮ KÝ
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
