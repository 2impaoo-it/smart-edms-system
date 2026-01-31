import { motion, AnimatePresence } from "framer-motion";
import { FileText, PenTool, Users, Clock } from "lucide-react";

const activities = [
    { id: "1", type: "sign", user: "Sarah Chen", document: "Q4_Report.pdf", timestamp: "2m ago" },
    { id: "2", type: "upload", user: "Mike Ross", document: "Contract_2024.pdf", timestamp: "15m ago" },
    { id: "3", type: "share", user: "Jessica Park", document: "Proposal.pdf", timestamp: "1h ago" },
    { id: "4", type: "view", user: "David Kim", document: "Invoice_Jan.pdf", timestamp: "2h ago" },
    { id: "5", type: "sign", user: "Emily Wong", document: "NDA_Agreement.pdf", timestamp: "3h ago" },
];

const iconMap = {
    sign: PenTool,
    upload: FileText,
    share: Users,
    view: Clock,
};

const colorMap = {
    sign: "text-[#10b981] bg-[#10b981]/10",
    upload: "text-[#6366f1] bg-[#6366f1]/10",
    share: "text-[#a855f7] bg-[#a855f7]/10",
    view: "text-[#f59e0b] bg-[#f59e0b]/10",
};

export function ActivityFeed() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass glass-hover rounded-2xl p-6 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Live Activity Feed</h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400">Live</span>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                    {activities.map((activity, index) => {
                        const Icon = iconMap[activity.type];
                        const colorClass = colorMap[activity.type];

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{
                                    type: "spring",
                                    damping: 20,
                                    stiffness: 300,
                                    delay: index * 0.05,
                                }}
                                whileHover={{ x: 4 }}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer spotlight"
                            >
                                <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">
                                        <span className="font-medium">{activity.user}</span>
                                        {activity.type === "sign" && " signed "}
                                        {activity.type === "upload" && " uploaded "}
                                        {activity.type === "share" && " shared "}
                                        {activity.type === "view" && " viewed "}
                                        <span className="text-gray-400">{activity.document}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
