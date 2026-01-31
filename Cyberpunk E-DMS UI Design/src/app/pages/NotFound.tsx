import { motion } from "motion/react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#6366f1]" />
        <h1 className="text-4xl mb-2">404</h1>
        <p className="text-gray-400 mb-6">Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg hover:shadow-lg transition-shadow"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
