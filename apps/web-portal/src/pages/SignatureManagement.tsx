import { useState } from "react";
import {
  ShieldCheck, Upload, FileKey, CheckCircle2, XCircle, RefreshCw, 
  Lock, Eye, AlertTriangle
} from "lucide-react";
import { gooeyToast as toast } from "goey-toast";
import { cn } from "../lib/utils";
import axiosClient from "../lib/axiosClient";

type SigTab = "verify-keystore" | "verify-pdf";

export function SignatureManagement() {
  const [activeTab, setActiveTab] = useState<SigTab>("verify-keystore");

  // Verify Keystore State
  const [ksFile, setKsFile] = useState<File | null>(null);
  const [ksPassword, setKsPassword] = useState("");
  const [ksResult, setKsResult] = useState<string | null>(null);
  const [ksLoading, setKsLoading] = useState(false);

  // Verify PDF State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfResults, setPdfResults] = useState<any[] | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ─── Verify Keystore ───
  const handleVerifyKeystore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ksFile || !ksPassword) {
      toast.error("Thiếu thông tin", { description: "Vui lòng chọn file .p12 và nhập mật khẩu." });
      return;
    }
    setKsLoading(true);
    setKsResult(null);
    const tId = toast("Đang xác minh chứng thư số...", { duration: 100000 });
    try {
      const formData = new FormData();
      formData.append("file", ksFile);
      formData.append("password", ksPassword);
      const res = await axiosClient.post("/v1/signature/verify-keystore", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.dismiss(tId);
      toast.success("Chứng thư số hợp lệ!", { description: "Keystore của bạn chính hãng và còn hiệu lực." });
      setKsResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      toast.dismiss(tId);
      toast.error("Chứng thư không hợp lệ", { description: err.response?.data?.message || err.response?.data || "Sai mật khẩu hoặc file bị hỏng." });
      setKsResult("❌ Xác minh thất bại: " + (err.response?.data?.message || err.response?.data || "Không xác định"));
    } finally {
      setKsLoading(false);
    }
  };

  // ─── Verify PDF Signatures ───
  const handleVerifyPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Thiếu file", { description: "Vui lòng chọn file PDF cần xác minh." });
      return;
    }
    setPdfLoading(true);
    setPdfResults(null);
    const tId = toast("Đang phân tích chữ ký PDF...", { duration: 100000 });
    try {
      const formData = new FormData();
      formData.append("pdfFile", pdfFile);
      const res = await axiosClient.post("/v1/signature/verify-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.dismiss(tId);
      const results = Array.isArray(res.data) ? res.data : [];
      setPdfResults(results);
      if (results.length === 0) {
        toast.info("Không tìm thấy chữ ký", { description: "PDF này chưa được ký số." });
      } else {
        toast.success(`Tìm thấy ${results.length} chữ ký`, { description: "Kết quả xác minh hiển thị bên dưới." });
      }
    } catch (err: any) {
      toast.dismiss(tId);
      toast.error("Phân tích thất bại", { description: err.response?.data?.message || "Không thể đọc file PDF." });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          Quản Lý Chữ Ký Số
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Xác minh tính hợp lệ của Chứng thư số (.p12) và kiểm tra chữ ký trong tài liệu PDF.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("verify-keystore")}
          className={cn(
            "px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === "verify-keystore" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/60 text-muted-foreground hover:bg-white"
          )}
        >
          <FileKey className="w-4 h-4" /> Xác minh Keystore
        </button>
        <button
          onClick={() => setActiveTab("verify-pdf")}
          className={cn(
            "px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === "verify-pdf" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/60 text-muted-foreground hover:bg-white"
          )}
        >
          <Eye className="w-4 h-4" /> Kiểm tra PDF
        </button>
      </div>

      {/* ═══ VERIFY KEYSTORE TAB ═══ */}
      {activeTab === "verify-keystore" && (
        <div className="glass-panel rounded-[40px] shadow-2xl bg-white/70 border-white/60 overflow-hidden">
          <div className="p-8 border-b border-white/60 bg-white/40">
            <h3 className="text-lg font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Xác minh Chứng thư số (.p12 / .pfx)</h3>
            <p className="text-xs text-muted-foreground mt-1">Upload file keystore và nhập mật khẩu để kiểm tra tính hợp lệ.</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleVerifyKeystore} className="max-w-lg space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Chứng thư (.p12 / .pfx)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".p12,.pfx"
                    onChange={e => setKsFile(e.target.files?.[0] || null)}
                    className="w-full text-sm font-medium file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-black file:py-3 file:px-5 hover:file:bg-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mật khẩu Keystore</label>
                <input
                  type="password"
                  value={ksPassword}
                  onChange={e => setKsPassword(e.target.value)}
                  placeholder="Nhập passphrase..."
                  className="w-full bg-white/50 border border-white/60 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={ksLoading || !ksFile}
                className="w-full py-4 rounded-2xl cyber-gradient text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {ksLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Xác Minh Keystore
              </button>
            </form>

            {ksResult && (
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black uppercase text-muted-foreground mb-2">Kết quả:</h4>
                <pre className="text-sm whitespace-pre-wrap font-mono text-slate-700 leading-relaxed">{ksResult}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ VERIFY PDF TAB ═══ */}
      {activeTab === "verify-pdf" && (
        <div className="glass-panel rounded-[40px] shadow-2xl bg-white/70 border-white/60 overflow-hidden">
          <div className="p-8 border-b border-white/60 bg-white/40">
            <h3 className="text-lg font-bold flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> Kiểm tra chữ ký trong PDF</h3>
            <p className="text-xs text-muted-foreground mt-1">Upload file PDF đã ký số để xác minh tính toàn vẹn và danh tính người ký.</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleVerifyPdf} className="max-w-lg space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File PDF cần kiểm tra</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-sm font-medium file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-black file:py-3 file:px-5 hover:file:bg-primary/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={pdfLoading || !pdfFile}
                className="w-full py-4 rounded-2xl cyber-gradient text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pdfLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Phân Tích Chữ Ký
              </button>
            </form>

            {pdfResults !== null && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground">Kết quả ({pdfResults.length} chữ ký):</h4>
                {pdfResults.length === 0 ? (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm font-medium text-amber-800">PDF này chưa có chữ ký số nào.</p>
                  </div>
                ) : (
                  pdfResults.map((sig, idx) => (
                    <div key={idx} className={cn(
                      "p-5 rounded-2xl border flex items-start gap-4",
                      sig.valid || sig.signatureValid ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                    )}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        sig.valid || sig.signatureValid ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                      )}>
                        {sig.valid || sig.signatureValid ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-bold">{sig.signerName || sig.name || `Chữ ký #${idx + 1}`}</p>
                        {sig.reason && <p className="text-xs text-muted-foreground">Lý do: {sig.reason}</p>}
                        {sig.location && <p className="text-xs text-muted-foreground">Vị trí: {sig.location}</p>}
                        {sig.signDate && <p className="text-xs text-muted-foreground">Ngày ký: {new Date(sig.signDate).toLocaleString('vi-VN')}</p>}
                        <p className={cn("text-xs font-bold", sig.valid || sig.signatureValid ? "text-emerald-700" : "text-red-700")}>
                          {sig.valid || sig.signatureValid ? "✓ Chữ ký hợp lệ — Tài liệu chưa bị sửa đổi" : "✗ Chữ ký không hợp lệ hoặc tài liệu đã bị thay đổi"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
