import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { gooeyToast as toast } from "goey-toast";
import { login, changePasswordFirstTime } from "../services/authService";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Cpu,
  Shield,
  Zap,
  Fingerprint,
  KeyRound,
  History,
} from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // States for Modals
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginPromise = async () => {
      // Giả lập delay mạng để thấy rõ hiệu ứng morphing của loading -> success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const { data } = await login({ email: username, password: password });
      return data;
    };

    const promiseInstance = loginPromise();

    toast.promise(promiseInstance, {
      loading: "Đang xác thực thông tin...",
      success: (data) => {
        if (data.mustChangePassword) return "Yêu cầu đổi mật khẩu";
        return "Đăng nhập thành công!";
      },
      error: (err: any) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message;
        if (status === 403 && msg === "Bạn phải đổi mật khẩu ở lần đăng nhập đầu tiên") return "Tài khoản bảo mật";
        if (status === 401) return "Đăng nhập thất bại";
        if (status === 503 || msg?.includes("maintenance") || msg?.includes("bảo trì")) return "Hệ thống bảo trì";
        return "Lỗi hệ thống";
      },
      description: {
        loading: "Hệ thống đang kiểm tra danh tính của bạn...",
        success: (data) => {
          if (data.mustChangePassword) return "Vui lòng cập nhật mật khẩu mới ở lần đăng nhập đầu tiên.";
          return "Chào mừng bạn quay trở lại Smart EDMS.";
        },
        error: (err: any) => {
          const status = err.response?.status;
          const msg = err.response?.data?.message;
          if (status === 403 && msg === "Bạn phải đổi mật khẩu ở lần đăng nhập đầu tiên") return "Yêu cầu cập nhật mật khẩu mới ở lần đầu đăng nhập.";
          if (status === 401) return "Sai email hoặc mật khẩu. Vui lòng kiểm tra lại.";
          if (status === 503 || msg?.includes("maintenance") || msg?.includes("bảo trì")) return "Hệ thống đang được nâng cấp, vui lòng thử lại sau.";
          return msg || "Đăng nhập thất bại. Hệ thống không phản hồi.";
        }
      }
    });

    promiseInstance.then((data) => {
      try {
        // Decode JWT payload
        const base64Url = data.token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );

        const payload = JSON.parse(jsonPayload);
        const roles: string[] = payload.roles || [];

        let finalRole = "STAFF";
        if (roles.includes("ROLE_ADMIN")) finalRole = "ADMIN";
        else if (roles.includes("ROLE_MANAGER")) finalRole = "MANAGER";

        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: payload.sub,
            name: payload.sub,
            email: username,
            role: finalRole,
            department: "IT",
            status: "active",
          }),
        );
      } catch (e) {
        console.error(e);
      }

      if (data.mustChangePassword) {
        // Cho time nhỏ để báo lỗi, sau đó show modal
        setTimeout(() => setShowPasswordChange(true), 500);
      } else {
        // Tăng delay để user CÓ THỂ NHÌN THẤY TOAST THÀNH CÔNG (morphing)
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    }).catch(() => {
      // Bỏ qua vì toast đã hiện lỗi
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu không khớp", { description: "Mật khẩu xác nhận không giống với mật khẩu mới." });
      return;
    }
    setIsLoading(true);

    const promiseInstance = (async () => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return changePasswordFirstTime({
        currentPassword: password,
        newPassword: newPassword,
      });
    })();

    toast.promise(promiseInstance, {
      loading: "Đang cập nhật mật khẩu...",
      success: "Đổi mật khẩu thành công!",
      error: "Đổi mật khẩu thất bại",
      description: {
        loading: "Hệ thống đang lưu thay đổi của bạn...",
        success: "Chào mừng bạn đến với hệ thống Smart EDMS.",
        error: (err: any) => err.response?.data?.message || "Lỗi không xác định khi đổi mật khẩu."
      }
    });

    promiseInstance.then(() => {
      setShowPasswordChange(false);
      setTimeout(() => navigate("/dashboard"), 1500);
    }).catch((e) => console.error("Update password err:", e))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      {/* Background & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
          {/* Branding Section (Left) */}
          <div className="hidden lg:block space-y-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl cyber-gradient flex items-center justify-center shadow-neon ring-4 ring-white/50">
                <Cpu className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter gradient-text">
                  SMART EDMS
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                  Secure Enterprise Storage
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-6xl font-black leading-[0.9] tracking-tighter">
                QUẢN TRỊ <br />
                <span className="gradient-text">KHO SỐ</span> <br />
                THÔNG MINH.
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-md">
                Tổ chức, ký duyệt và lưu trữ tài liệu doanh nghiệp trên một nền
                tảng Real-time duy nhất.
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Shield, text: "Ký số bảo mật" },
                { icon: Zap, text: "Xử lý Realtime" },
                { icon: Fingerprint, text: "Bảo mật đa lớp" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border-white/40 text-xs font-bold text-muted-foreground shadow-sm"
                >
                  <f.icon className="w-4 h-4 text-primary" />
                  {f.text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Login Card (Right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000" />

            <div className="relative glass-panel rounded-[32px] p-10 lg:p-12 border-white/60 shadow-2xl">
              <div className="mb-10">
                <h3 className="text-3xl font-black tracking-tight mb-2">
                  Đăng nhập
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  Sử dụng tài khoản nội bộ để tiếp tục
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username/Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Email / Tên đăng nhập
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Nhập email hoặc username"
                      className="w-full bg-white/50 border border-white/40 rounded-2xl px-12 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Mật khẩu truy cập
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-white/50 border border-white/40 rounded-2xl px-12 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded-lg border-white/60 bg-white/50 text-primary"
                    />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">
                      Ghi nhớ tôi
                    </span>
                  </label>
                  {/* <button type="button" className="text-xs font-black text-primary hover:text-secondary transition-colors uppercase tracking-tighter">Quên mật khẩu?</button> */}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/btn"
                >
                  <div className="absolute inset-0 cyber-gradient rounded-2xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity" />
                  <div className="relative cyber-gradient rounded-2xl py-4 flex items-center justify-center gap-3 font-black text-white shadow-xl hover:shadow-neon transition-all">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <span>XÁC THỰC DANH TÍNH</span>
                    )}
                  </div>
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                    <History className="w-3 h-3" /> Tài khoản Test:
                  </p>
                  <ul className="text-[10px] text-muted-foreground font-bold space-y-0.5">
                    <li>
                      • <span className="text-foreground">first@edms.com</span>{" "}
                      - Đăng nhập lần đầu
                    </li>
                    <li>
                      •{" "}
                      <span className="text-foreground">
                        maintenance@edms.com
                      </span>{" "}
                      - Bảo trì
                    </li>
                    <li>
                      • <span className="text-foreground">wrong@edms.com</span>{" "}
                      - Sai thông tin
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- FIRST-TIME LOGIN MODAL --- */}
      <AnimatePresence>
        {showPasswordChange && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
              onClick={() => setShowPasswordChange(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-panel rounded-[32px] p-10 border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.3)]"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  Cập nhật mật khẩu
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  Đây là lần đầu bạn đăng nhập. Vui lòng thiết lập mật khẩu mới
                  để bảo vệ tài khoản.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-white/50 border border-white/40 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-white/50 border border-white/40 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cyber-gradient rounded-2xl py-4 flex items-center justify-center gap-3 font-black text-white shadow-xl hover:shadow-neon transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span>LƯU MẬT KHẨU MỚI</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30">
        <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground uppercase">
          Smart EDMS v2.0 &copy; 2024
        </p>
      </div>
    </div>
  );
}
