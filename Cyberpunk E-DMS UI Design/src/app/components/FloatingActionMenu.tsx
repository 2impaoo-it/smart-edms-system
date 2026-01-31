import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Upload, PenTool, UserPlus, X } from "lucide-react";

const actions = [
  { icon: Upload, label: "Upload Document", color: "from-[#6366f1] to-[#8b5cf6]" },
  { icon: PenTool, label: "New Signature", color: "from-[#8b5cf6] to-[#a855f7]" },
  { icon: UserPlus, label: "Invite User", color: "from-[#a855f7] to-[#ec4899]" },
];

export function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Action items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  }}
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 p-4 rounded-xl glass glass-hover border border-white/10"
                >
                  <span className="text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.label}
                  </span>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${action.color} flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-2xl glow-primary"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" strokeWidth={2} />
          ) : (
            <Plus className="w-6 h-6 text-white" strokeWidth={2} />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
