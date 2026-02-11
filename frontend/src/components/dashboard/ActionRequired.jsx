import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ActionRequired = ({ actions, onResolve }) => {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Action Required
            </h3>

            <AnimatePresence mode="popLayout">
                {actions.length > 0 ? (
                    <div className="space-y-3">
                        {actions.map(action => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                key={action.id}
                                className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                            >
                                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-200 truncate">{action.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{action.desc}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onResolve(action.id)}
                                        title="Resolve"
                                        className="p-1.5 rounded-md hover:bg-success/20 text-gray-400 hover:text-success"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-8 text-gray-500"
                    >
                        <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">All caught up!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActionRequired;
