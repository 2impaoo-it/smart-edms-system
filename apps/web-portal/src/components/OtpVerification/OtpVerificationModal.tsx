import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, RefreshCw, Mail, X, CheckCircle,
  Smartphone, QrCode, KeyRound, ChevronRight, Copy, Check,
} from "lucide-react";
import {
  requestOtp, verifyOtp,
  requestTotpOtp, confirmTotpSetup, verifyTotpOtp,
} from "../../services/otpReminderService";
import { gooeyToast as toast } from "goey-toast";


/** Phương thức xác thực */
type AuthMethod = "MICROSOFT_AUTH" | "EMAIL";

/** Các bước trong luồng TOTP */
type TotpStep = "choose" | "qr-setup" | "verify" | "success";

interface OtpVerificationModalProps {
  purpose: string; // "DIGITAL_CERT_CREATION" | "SIGNATURE" | etc.
  purposeLabel?: string;
  /** Phương thức mặc định. Nếu không truyền sẽ hiện màn chọn */
  defaultMethod?: AuthMethod;
  onVerified: (otpToken: string) => void;
  onClose: () => void;
}

/**
 * Modal xác thực OTP – hỗ trợ 2 phương thức:
 *  1. Microsoft Authenticator (TOTP RFC 6238) – dùng cho tạo chữ ký số
 *  2. Email OTP – gửi mã 6 số qua hòm thư
 *
 * Luồng TOTP:
 *   choose → (backend: requiresSetup=true)  → qr-setup → verify → success
 *   choose → (backend: requiresSetup=false) → verify           → success
 */
export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  purpose,
  purposeLabel = "Xác thực OTP",
  defaultMethod,
  onVerified,
  onClose,
}) => {
  // Lấy thông tin user từ localStorage (pattern chung của project)
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const userEmail: string = currentUser?.email ?? "email của bạn";

  // Bước hiện tại trong luồng
  const [step, setStep] = useState<TotpStep>(defaultMethod ? "verify" : "choose");
  const [method, setMethod] = useState<AuthMethod>(defaultMethod ?? "MICROSOFT_AUTH");

  // Dữ liệu TOTP từ backend
  const [qrCodeUri, setQrCodeUri] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Input mã OTP
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Đếm ngược countdown cho gửi lại email
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Khi chọn phương thức → gọi backend ngay để khởi động
  const handleSelectMethod = useCallback(async (selected: AuthMethod) => {
    setMethod(selected);
    setLoading(true);
    try {
      if (selected === "MICROSOFT_AUTH") {
        const res = await requestTotpOtp(purpose);
        const data = res.data;
        setRequiresSetup(!!data.requiresSetup);
        if (data.requiresSetup) {
          setQrCodeUri(data.qrCodeUri ?? "");
          setSecretKey(data.secretKey ?? "");
          setStep("qr-setup");
        } else {
          // Đã setup rồi → nhảy thẳng sang nhập mã
          setStep("verify");
        }
      } else {
        // Email: gửi và chờ
        await requestOtp(purpose);
        setCountdown(60);
        setStep("verify");
        toast.success("OTP đã được gửi!", {
          description: `Kiểm tra email ${userEmail}.`,
        });
      }
    } catch (err: any) {
      toast.error("Khởi động xác thực thất bại", {
        description: err.response?.data?.message ?? "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  }, [purpose, userEmail]);

  // Tự động gọi nếu đã có defaultMethod
  useEffect(() => {
    if (defaultMethod) {
      handleSelectMethod(defaultMethod);
    }
  }, []); // eslint-disable-line

  // Xác nhận setup lần đầu (sau khi quét QR)
  const handleConfirmSetup = async () => {
    if (otpCode.length < 6) {
      toast.error("Nhập đủ mã 6 số từ Microsoft Authenticator");
      return;
    }
    setLoading(true);
    try {
      await confirmTotpSetup(otpCode);
      toast.success("Liên kết Authenticator thành công!");
      // Sau confirm setup → verify luôn để tiếp tục
      await doVerify();
    } catch (err: any) {
      toast.error("Mã xác thực sai", {
        description: err.response?.data?.message ?? "Kiểm tra lại mã trong Microsoft Authenticator.",
      });
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  };

  // Xác thực mã OTP (Email hoặc TOTP từ lần 2)
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      toast.error("Nhập đủ mã 6 số");
      return;
    }
    setLoading(true);
    try {
      await doVerify();
    } finally {
      setLoading(false);
    }
  };

  const doVerify = async () => {
    const res = method === "MICROSOFT_AUTH"
      ? await verifyTotpOtp(otpCode, purpose)
      : await verifyOtp(otpCode, purpose, "EMAIL");

    if (res.data?.success) {
      setStep("success");
      setTimeout(() => onVerified(res.data?.token ?? "totp-verified"), 800);
    } else {
      toast.error("Mã không hợp lệ", {
        description: res.data?.message ?? "Vui lòng thử lại.",
      });
      setOtpCode("");
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await requestOtp(purpose);
      setCountdown(60);
      toast.success("Đã gửi lại mã OTP!");
    } catch (err: any) {
      toast.error("Gửi lại thất bại", { description: "Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  // URL hình ảnh QR Code (dùng service miễn phí, không cần thư viện)
  const qrImageUrl = qrCodeUri
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeUri)}&size=200x200&margin=10`
    : "";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-7 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-black dark:text-white">Xác Thực Bảo Mật</h3>
              <p className="text-[11px] text-muted-foreground">{purposeLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════
            STEP: choose – Chọn phương thức xác thực
        ══════════════════════════════════════════════════ */}
        {step === "choose" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4 text-center">
              Chọn phương thức xác thực để tiếp tục
            </p>

            {/* Card Microsoft Authenticator - được đề xuất */}
            <button
              onClick={() => handleSelectMethod("MICROSOFT_AUTH")}
              disabled={loading}
              className="w-full group p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-4 text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Microsoft Authenticator
                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-600 text-white rounded-full uppercase">
                    Đề xuất
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">Mã 6 số thay đổi mỗi 30 giây</p>
              </div>
              {loading ? <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />}
            </button>

            {/* Card Email */}
            <button
              onClick={() => handleSelectMethod("EMAIL")}
              disabled={loading}
              className="w-full group p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-4 text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Gửi qua Email</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP: qr-setup – Quét QR Code lần đầu
        ══════════════════════════════════════════════════ */}
        {step === "qr-setup" && (
          <div className="space-y-4">
            {/* Hướng dẫn */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl">
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                <span className="font-black">Lần đầu setup:</span> Mở Microsoft Authenticator → Thêm tài khoản → Quét mã QR bên dưới
              </p>
            </div>

            {/* Hình QR Code */}
            <div className="flex flex-col items-center gap-3">
              {qrImageUrl ? (
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                  <img
                    src={qrImageUrl}
                    alt="QR Code Microsoft Authenticator"
                    width={180}
                    height={180}
                    className="rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Hoặc nhập thủ công <strong>Secret Key</strong>
              </p>
            </div>

            {/* Secret Key (nhập thủ công) */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 flex-1 break-all leading-relaxed">
                {secretKey}
              </code>
              <button
                onClick={handleCopySecret}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                title="Sao chép Secret Key"
              >
                {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>

            {/* Nhập mã xác nhận đầu tiên */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Nhập mã 6 số từ app để xác nhận
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmSetup()}
                placeholder="0 0 0 0 0 0"
                className="w-full bg-white/50 dark:bg-slate-900/50 border-2 border-indigo-200 dark:border-indigo-900/30 rounded-2xl px-4 py-3.5 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-400/30 dark:text-white"
              />
            </div>

            <button
              onClick={handleConfirmSetup}
              disabled={loading || otpCode.length < 6}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Xác Nhận Liên Kết
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP: verify – Nhập mã OTP (đã setup / Email)
        ══════════════════════════════════════════════════ */}
        {step === "verify" && (
          <div className="space-y-4">
            {/* Banner hướng dẫn */}
            {method === "MICROSOFT_AUTH" ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl">
                <Smartphone className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Mở <strong>Microsoft Authenticator</strong>, tìm tài khoản <strong>SmartEDMS</strong> và nhập mã 6 số.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/20 rounded-2xl">
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  ✅ OTP đã gửi đến <strong>{userEmail}</strong>. Hết hạn sau <strong>10 phút</strong>.
                </p>
              </div>
            )}

            {/* Input OTP */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                {method === "MICROSOFT_AUTH" ? "Mã từ Microsoft Authenticator" : "Mã OTP (6 chữ số)"}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                placeholder="0 0 0 0 0 0"
                className="w-full bg-white/50 dark:bg-slate-900/50 border-2 border-indigo-200 dark:border-indigo-900/30 rounded-2xl px-4 py-3.5 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-400/30 dark:text-white"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otpCode.length < 6}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Xác Thực
            </button>

            {/* Gửi lại (chỉ cho Email) */}
            {method === "EMAIL" && (
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Gửi lại sau <strong className="text-indigo-500">{countdown}s</strong>
                  </p>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="text-xs text-indigo-500 font-bold hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            )}

            {/* TOTP: đồng hồ đếm 30s (mã thay đổi mỗi 30s) */}
            {method === "MICROSOFT_AUTH" && (
              <p className="text-center text-[10px] text-muted-foreground">
                Mã trong app thay đổi mỗi <strong>30 giây</strong>
              </p>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP: success – Xác thực thành công
        ══════════════════════════════════════════════════ */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-lg font-black dark:text-white">Xác Thực Thành Công!</p>
            <p className="text-xs text-muted-foreground text-center">Đang tiến hành tiếp theo...</p>
          </div>
        )}
      </div>
    </div>
  );
};
