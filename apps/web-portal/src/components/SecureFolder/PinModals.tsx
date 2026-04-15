import React, { useState } from "react";
import { Lock, Unlock, ShieldCheck, Eye, EyeOff, KeyRound, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { enableSecureFolder, verifySecureFolderPin, changeSecureFolderPin, disableSecureFolder } from "../../services/secureFolderService";
import { gooeyToast as toast } from "goey-toast";

// ─── PIN Input Component ─────────────────────────────────────────────────────

const PinInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label: string;
  autoFocus?: boolean;
}> = ({ value, onChange, label, autoFocus }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => {
            // Chỉ cho nhập số, tối đa 6 ký tự
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            onChange(val);
          }}
          placeholder="● ● ● ● ● ●"
          inputMode="numeric"
          maxLength={6}
          autoFocus={autoFocus}
          className="w-full bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// ─── Modal Wrapper ───────────────────────────────────────────────────────────
interface ModalProps {
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
}

const PinModal: React.FC<ModalProps> = ({ onClose, title, icon, iconBg, children }) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
    style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)" }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconBg)}>
            {icon}
          </div>
          <h3 className="text-lg font-black dark:text-white">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── 1. Verify PIN Modal ─────────────────────────────────────────────────────

export const VerifyPinModal: React.FC<{
  folderId: number;
  folderName: string;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ folderId, folderName, onSuccess, onClose }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (pin.length < 4) {
      toast.error("PIN cần tối thiểu 4 chữ số");
      return;
    }
    setLoading(true);
    try {
      await verifySecureFolderPin(folderId, pin);
      toast.success("✅ Xác thực thành công!", { description: `Đã mở thư mục "${folderName}"` });
      onSuccess();
    } catch (err: any) {
      toast.error("❌ Sai mã PIN", { description: err.response?.data?.message || "Vui lòng thử lại." });
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PinModal
      onClose={onClose}
      title="Thư Mục Bảo Mật"
      icon={<Lock className="w-6 h-6 text-indigo-600" />}
      iconBg="bg-indigo-100 dark:bg-indigo-900/30"
    >
      <p className="text-sm text-muted-foreground mb-6">
        Nhập mã PIN để mở thư mục <strong className="text-slate-700 dark:text-slate-200">"{folderName}"</strong>
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
        className="space-y-5"
      >
        <PinInput value={pin} onChange={setPin} label="Mã PIN" autoFocus />
        <button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full py-4 rounded-2xl cyber-gradient text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Đang xác thực..." : "🔓 Mở Thư Mục"}
        </button>
      </form>
    </PinModal>
  );
};

// ─── 2. Enable PIN Modal ─────────────────────────────────────────────────────

export const EnablePinModal: React.FC<{
  folderId: number;
  folderName: string;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ folderId, folderName, onSuccess, onClose }) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    if (pin.length < 4) {
      toast.error("PIN cần tối thiểu 4 chữ số");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("Mã PIN không khớp", { description: "Vui lòng nhập lại." });
      return;
    }
    setLoading(true);
    try {
      await enableSecureFolder(folderId, pin);
      toast.success("🔒 Đã bật bảo mật PIN!", { description: `Thư mục "${folderName}" đã được mã hóa.` });
      onSuccess();
    } catch (err: any) {
      toast.error("Không thể bật PIN", { description: err.response?.data?.message || "Lỗi server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PinModal
      onClose={onClose}
      title="Cài Đặt Mã PIN"
      icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
      iconBg="bg-emerald-100 dark:bg-emerald-900/30"
    >
      <p className="text-sm text-muted-foreground mb-6">
        Đặt mã PIN bảo vệ thư mục <strong className="text-slate-700 dark:text-slate-200">"{folderName}"</strong>.
        Mọi người truy cập đều phải nhập PIN này.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); handleEnable(); }} className="space-y-4">
        <PinInput value={pin} onChange={setPin} label="Mã PIN mới (4-6 chữ số)" autoFocus />
        <PinInput value={confirmPin} onChange={setConfirmPin} label="Xác nhận mã PIN" />

        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ Hãy ghi nhớ mã PIN. Nếu quên, chỉ Admin mới có thể reset.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || pin.length < 4 || pin !== confirmPin}
          className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "🔒 Kích Hoạt Bảo Mật PIN"}
        </button>
      </form>
    </PinModal>
  );
};

// ─── 3. Change PIN Modal ─────────────────────────────────────────────────────

export const ChangePinModal: React.FC<{
  folderId: number;
  folderName: string;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ folderId, folderName, onSuccess, onClose }) => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (newPin.length < 4) {
      toast.error("PIN mới cần tối thiểu 4 chữ số");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PIN mới không khớp");
      return;
    }
    setLoading(true);
    try {
      await changeSecureFolderPin(folderId, oldPin, newPin);
      toast.success("✅ Đã đổi mã PIN thành công!");
      onSuccess();
    } catch (err: any) {
      toast.error("Đổi PIN thất bại", { description: err.response?.data?.message || "Sai PIN cũ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PinModal
      onClose={onClose}
      title="Đổi Mã PIN"
      icon={<KeyRound className="w-6 h-6 text-purple-600" />}
      iconBg="bg-purple-100 dark:bg-purple-900/30"
    >
      <p className="text-sm text-muted-foreground mb-5">
        Đổi mã PIN cho thư mục <strong className="dark:text-slate-200">"{folderName}"</strong>
      </p>
      <form onSubmit={(e) => { e.preventDefault(); handleChange(); }} className="space-y-4">
        <PinInput value={oldPin} onChange={setOldPin} label="PIN hiện tại" autoFocus />
        <PinInput value={newPin} onChange={setNewPin} label="PIN mới" />
        <PinInput value={confirmPin} onChange={setConfirmPin} label="Xác nhận PIN mới" />
        <button
          type="submit"
          disabled={loading || oldPin.length < 4 || newPin.length < 4 || newPin !== confirmPin}
          className="w-full py-4 rounded-2xl cyber-gradient text-white text-xs font-black uppercase disabled:opacity-50 hover:scale-[1.02] transition-all"
        >
          {loading ? "Đang lưu..." : "Đổi PIN"}
        </button>
      </form>
    </PinModal>
  );
};

// ─── 4. Disable PIN Modal ────────────────────────────────────────────────────

export const DisablePinModal: React.FC<{
  folderId: number;
  folderName: string;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ folderId, folderName, onSuccess, onClose }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    setLoading(true);
    try {
      await disableSecureFolder(folderId, pin);
      toast.success("🔓 Đã tắt bảo mật PIN", { description: `Thư mục "${folderName}" không còn yêu cầu PIN.` });
      onSuccess();
    } catch (err: any) {
      toast.error("Tắt PIN thất bại", { description: err.response?.data?.message || "Sai mã PIN." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PinModal
      onClose={onClose}
      title="Tắt Bảo Mật PIN"
      icon={<Unlock className="w-6 h-6 text-red-500" />}
      iconBg="bg-red-100 dark:bg-red-900/30"
    >
      <p className="text-sm text-muted-foreground mb-5">
        Xác nhận PIN hiện tại để tắt bảo mật thư mục <strong className="dark:text-slate-200">"{folderName}"</strong>
      </p>
      <form onSubmit={(e) => { e.preventDefault(); handleDisable(); }} className="space-y-4">
        <PinInput value={pin} onChange={setPin} label="Mã PIN hiện tại" autoFocus />
        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl">
          <p className="text-[11px] text-red-700 dark:text-red-400 font-medium">
            ⚠️ Sau khi tắt, mọi người có quyền truy cập đều đọc được thư mục này mà không cần PIN.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full py-4 rounded-2xl bg-red-500 text-white text-xs font-black uppercase disabled:opacity-50 hover:scale-[1.02] transition-all"
        >
          {loading ? "Đang xử lý..." : "Tắt Bảo Mật PIN"}
        </button>
      </form>
    </PinModal>
  );
};
