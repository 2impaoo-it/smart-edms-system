import { useState, useEffect, useCallback } from "react";
import { Bell, Mail, Clock, CheckCircle2, RefreshCw, Calendar, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { gooeyToast as toast } from "goey-toast";
import { getMyReminders, triggerReminderCheck } from "../services/otpReminderService";

interface Reminder {
  id: number;
  documentId: number;
  documentName?: string;
  reminderType?: string;
  status: "PENDING" | "SENT" | "FAILED";
  scheduledAt?: string;
  sentAt?: string;
  message?: string;
}

export function ReminderManagement() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);

  // Lấy danh sách nhắc hẹn của user
  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyReminders();
      const payload = res.data;
      const dataItems = Array.isArray(payload) ? payload : (payload?.data || payload?.content || []);
      setReminders(dataItems);
    } catch {
      toast.error("Không thể tải danh sách nhắc hẹn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Admin: Trigger thủ công
  const handleTrigger = async () => {
    setTriggerLoading(true);
    try {
      await triggerReminderCheck();
      toast.success("✅ Đã kích hoạt kiểm tra nhắc hẹn!", {
        description: "Hệ thống sẽ gửi email cho các document sắp quá hạn."
      });
      fetchReminders();
    } catch {
      toast.error("Kích hoạt thất bại", { description: "Có thể bạn không có quyền Admin." });
    } finally {
      setTriggerLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SENT":    return { label: "Đã gửi",     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/20", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> };
      case "FAILED":  return { label: "Gửi lỗi",    color: "text-red-600",                            bg: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20",                 icon: <Bell className="w-4 h-4 text-red-500" /> };
      default:        return { label: "Chờ gửi",     color: "text-amber-600 dark:text-amber-400",      bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/20",           icon: <Clock className="w-4 h-4 text-amber-500" /> };
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          Nhắc Hẹn Ký Văn Bản
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Hệ thống tự động gửi email nhắc nhở khi văn bản sắp quá hạn ký (trước 1 ngày).
        </p>
      </div>

      {/* INFO CARD */}
      <div className="glass-panel rounded-[32px] p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-200/50 dark:border-indigo-900/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-sm dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Cách thức hoạt động
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mỗi ngày lúc <strong>8:00 sáng</strong>, hệ thống tự động quét tất cả document đang chờ ký.
            Nếu còn <strong>dưới 1 ngày</strong> thì gửi email nhắc nhở đến người phụ trách.
          </p>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggerLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={cn("w-4 h-4", triggerLoading && "animate-spin")} />
          Kích Hoạt Ngay
        </button>
      </div>

      {/* DANH SÁCH NHẮC HẸN */}
      <div className="glass-panel rounded-[40px] shadow-2xl bg-white/70 dark:bg-slate-900/70 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Lịch Sử Nhắc Hẹn
          </h3>
          <button
            onClick={fetchReminders}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500"
            title="Làm mới"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Đang tải...</span>
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <CheckCircle2 className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">Chưa có nhắc hẹn nào được gửi</p>
              <p className="text-xs">Khi có document sắp quá hạn, email nhắc sẽ hiển thị ở đây</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const cfg = getStatusConfig(reminder.status);
                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-start gap-4 p-5 rounded-2xl border",
                      cfg.bg
                    )}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm">
                      {cfg.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold dark:text-slate-200 truncate">
                          {reminder.documentName ?? `Văn bản #${reminder.documentId}`}
                        </p>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/10", cfg.color)}>
                          {cfg.label}
                        </span>
                      </div>
                      {reminder.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reminder.message}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        {reminder.scheduledAt && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Lên lịch: {new Date(reminder.scheduledAt).toLocaleString("vi-VN")}
                          </span>
                        )}
                        {reminder.sentAt && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Đã gửi: {new Date(reminder.sentAt).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
