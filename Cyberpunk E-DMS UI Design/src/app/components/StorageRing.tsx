import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HardDrive } from "lucide-react";

const data = [
  { name: "Used", value: 67 },
  { name: "Free", value: 33 },
];

const COLORS = ["#6366f1", "#1f2937"];

export function StorageRing() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
      whileHover={{ scale: 1.02 }}
      className="glass glass-hover rounded-2xl p-6 flex flex-col items-center justify-center"
    >
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <HardDrive className="w-6 h-6 text-[#6366f1] mb-1" strokeWidth={1.5} />
          <p className="text-2xl font-semibold gradient-text">67%</p>
          <p className="text-xs text-gray-500">Storage</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">2.1 TB of 3.0 TB used</p>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
            <span className="text-xs text-gray-400">Used</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#1f2937]" />
            <span className="text-xs text-gray-400">Free</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
