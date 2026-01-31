import { motion } from "framer-motion";
import { Shield, Eye, PenTool, Download, CheckCircle2 } from "lucide-react";

const events = [
    { id: "1", type: "created", user: "Sarah Chen", timestamp: "Jan 28, 2026 09:23 AM", status: "completed" },
    { id: "2", type: "viewed", user: "Mike Ross", timestamp: "Jan 28, 2026 10:15 AM", status: "completed" },
    { id: "3", type: "signed", user: "Jessica Park", timestamp: "Jan 28, 2026 02:45 PM", status: "completed" },
    { id: "4", type: "verified", user: "System", timestamp: "Jan 28, 2026 02:46 PM", status: "current" },
    { id: "5", type: "downloaded", user: "Pending", timestamp: "---", status: "pending" },
];

const iconMap = {
    created: Shield,
    viewed: Eye,
    signed: PenTool,
    downloaded: Download,
    verified: CheckCircle2,
};

const colorMap = {
    created: "text-[#6366f1] bg-[#6366f1]/10",
    viewed: "text-[#f59e0b] bg-[#f59e0b]/10",
    signed: "text-[#10b981] bg-[#10b981]/10",
    downloaded: "text-[#a855f7] bg-[#a855f7]/10",
    verified: "text-[#10b981] bg-[#10b981]/10",
};

export function ChainOfCustody() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass glass-hover rounded-2xl p-6 h-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-[#6366f1]" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold">Chain of Custody</h3>
            </div>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[#6366f1] via-[#a855f7] to-transparent" />

                <div className="space-y-4">
                    {events.map((event, index) => {
                        const Icon = iconMap[event.type];
                        const colorClass = colorMap[event.type];
                        const isPending = event.status === "pending";
                        const isCurrent = event.status === "current";

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + index * 0.08 }}
                                className="relative flex gap-4"
                            >
                                {/* Icon */}
                                <div className="relative z-10">
                                    <motion.div
                                        animate={
                                            isCurrent
                                                ? {
                                                    scale: [1, 1.1, 1],
                                                    opacity: [1, 0.8, 1],
                                                }
                                                : {}
                                        }
                                        transition={{
                                            duration: 2,
                                            repeat: isCurrent ? Infinity : 0,
                                            ease: "easeInOut",
                                        }}
                                        className={`w-8 h-8 rounded-xl ${colorClass} flex items-center justify-center ${isPending ? "opacity-30" : ""
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                                    </motion.div>

                                    {/* Glow for current */}
                                    {isCurrent && (
                                        <motion.div
                                            animate={{
                                                opacity: [0.3, 0.6, 0.3],
                                                scale: [1, 1.2, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                            className="absolute inset-0 bg-[#6366f1] rounded-xl blur-md -z-10"
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`flex-1 ${isPending ? "opacity-40" : ""}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium capitalize">
                                                {event.type === "verified" ? "Signature Verified" : event.type}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{event.user}</p>
                                        </div>
                                        {isCurrent && (
                                            <span className="px-2 py-1 rounded-full text-xs bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{event.timestamp}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Verify badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 border border-[#10b981]/30"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Shield className="w-6 h-6 text-[#10b981]" strokeWidth={1.5} />
                    </motion.div>
                    <div>
                        <p className="text-sm font-medium text-[#10b981]">
                            Document Verified
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Blockchain hash: 0x7a9f...3e2b
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
