import { motion } from "framer-motion";
import { Upload, PenTool, UserPlus, FolderOpen } from "lucide-react";

const actions = [
    { icon: Upload, label: "Upload", color: "from-[#6366f1] to-[#8b5cf6]" },
    { icon: PenTool, label: "Sign", color: "from-[#8b5cf6] to-[#a855f7]" },
    { icon: UserPlus, label: "Invite", color: "from-[#a855f7] to-[#ec4899]" },
    { icon: FolderOpen, label: "Browse", color: "from-[#ec4899] to-[#6366f1]" },
];

export function QuickActions() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass glass-hover rounded-2xl p-6"
        >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-3">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <motion.button
                            key={action.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 0.2 + index * 0.05,
                                type: "spring",
                                damping: 20,
                                stiffness: 300,
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                        >
                            <div
                                className={`p-3 rounded-xl bg-gradient-to-br ${action.color} glow-hover`}
                            >
                                <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                                {action.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}
