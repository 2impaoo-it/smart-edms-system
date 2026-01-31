import { motion } from "motion/react";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-white/5 rounded-lg shimmer ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <LoadingSkeleton className="h-4 w-32 mb-3" />
          <LoadingSkeleton className="h-8 w-24" />
        </div>
        <LoadingSkeleton className="w-14 h-14 rounded-xl" />
      </div>
      <LoadingSkeleton className="h-3 w-20 mb-4" />
      <LoadingSkeleton className="h-16 w-full" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <LoadingSkeleton className="w-10 h-10 rounded-lg" />
          <LoadingSkeleton className="h-4 w-48" />
        </div>
      </td>
      <td className="py-4 px-4">
        <LoadingSkeleton className="h-4 w-24" />
      </td>
      <td className="py-4 px-4">
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="py-4 px-4">
        <LoadingSkeleton className="h-4 w-20" />
      </td>
      <td className="py-4 px-4">
        <LoadingSkeleton className="h-4 w-16" />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-1">
          <LoadingSkeleton className="w-8 h-8 rounded-lg" />
          <LoadingSkeleton className="w-8 h-8 rounded-lg" />
          <LoadingSkeleton className="w-8 h-8 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}
