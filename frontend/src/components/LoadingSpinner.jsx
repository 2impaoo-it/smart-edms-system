import { motion } from "framer-motion";

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#111827] z-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative w-16 h-16">
                    <motion.div
                        className="absolute inset-0 border-4 border-primary/30 rounded-full"
                    />
                    <motion.div
                        className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <p className="text-gray-400 text-sm font-medium animate-pulse">Loading Workspace...</p>
            </motion.div>
        </div>
    );
};

export default LoadingSpinner;
