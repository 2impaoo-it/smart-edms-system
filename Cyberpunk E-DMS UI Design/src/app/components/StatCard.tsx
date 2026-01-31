import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  sparklineData?: { value: number }[];
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  sparklineData,
  className = "",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`glass glass-hover rounded-2xl p-6 relative overflow-hidden group ${className}`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-semibold gradient-text">{value}</h3>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-white/10">
            <Icon className="w-6 h-6 text-[#6366f1]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Change indicator */}
        {change && (
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-sm ${
                trend === "up" ? "text-[#10b981]" : "text-[#ef4444]"
              }`}
            >
              {trend === "up" ? "↑" : "↓"} {change}
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}

        {/* Sparkline */}
        {sparklineData && (
          <div className="h-16 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#sparkGradient)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
