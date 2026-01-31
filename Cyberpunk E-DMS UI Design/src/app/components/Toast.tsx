import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ToastProps {
  type: "success" | "error" | "info";
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    color: "from-[#10b981]/20 to-[#059669]/10 border-[#10b981]/30 text-[#10b981]",
  },
  error: {
    icon: AlertCircle,
    color: "from-[#ef4444]/20 to-[#dc2626]/10 border-[#ef4444]/30 text-[#ef4444]",
  },
  info: {
    icon: Info,
    color: "from-[#6366f1]/20 to-[#8b5cf6]/10 border-[#6366f1]/30 text-[#6366f1]",
  },
};

export function Toast({ type, message, isVisible, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-8 right-8 z-[100]"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${config.color} border backdrop-blur-xl shadow-2xl min-w-[320px]`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0`} strokeWidth={1.5} />
            <p className="flex-1 text-sm text-white">{message}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
    isVisible: boolean;
  }>({
    type: "info",
    message: "",
    isVisible: false,
  });

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
}
