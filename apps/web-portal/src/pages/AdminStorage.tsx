import { motion } from "framer-motion";
import { 
    Database, 
    HardDrive, 
    PieChart, 
     
    Folder, 
    AlertCircle,
    
    
    
} from "lucide-react";
import { cn } from "../lib/utils";

// Mock data for storage
const departments = [
    { name: "Phòng IT", size: "450 GB", used: 85, files: 12400 },
    { name: "Phòng Nhân Sự", size: "120 GB", used: 40, files: 5600 },
    { name: "Phòng Kế Toán", size: "310 GB", used: 92, files: 15200 },
    { name: "Ban Giám Đốc", size: "50 GB", used: 20, files: 800 },
];

export function AdminStorage() {
    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Database className="w-8 h-8 text-primary" />
                        Kho tài liệu tổng
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Quản lý và giám sát toàn bộ dung lượng hệ thống EDMS.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none cyber-gradient px-5 py-3 rounded-2xl text-[10px] font-black text-white flex items-center justify-center gap-2 shadow-neon hover:scale-105 transition-all uppercase tracking-widest">
                        <HardDrive className="w-4 h-4" /> Nâng cấp dung lượng
                    </button>
                </div>
            </div>

            {/* Overview Widget - Cyberpunk Style */}
            <div className="glass-panel rounded-[40px] p-8 shadow-2xl bg-white/40 border-white/60 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-[-50%] left-[-10%] w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
                
                {/* Visual Chart Placeholder */}
                <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                    {/* Background rings */}
                    <div className="absolute inset-0 rounded-full border-[12px] border-slate-100" />
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle 
                            cx="96" cy="96" r="84" 
                            fill="none" stroke="currentColor" strokeWidth="12" 
                            className="text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            strokeDasharray="527" strokeDashoffset="105" // roughly 80%
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="text-center z-10">
                        <p className="text-4xl font-black gradient-text tracking-tighter">80%</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Đã sử dụng</p>
                    </div>
                </div>

                <div className="flex-1 space-y-6 w-full">
                    <div>
                        <h3 className="text-2xl font-black uppercase italic mb-2">Trạng thái Cluster</h3>
                        <p className="text-sm text-muted-foreground">Server Node #1 (Hanoi) đang hoạt động ổn định.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Tổng dung lượng", val: "2.0 TB" },
                            { label: "Đã sử dụng", val: "1.6 TB" },
                            { label: "Trống", val: "400 GB" },
                            { label: "Số lượng File", val: "34,000+" },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-lg font-black">{stat.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Department Quotas */}
                <div className="lg:col-span-2 glass-panel rounded-[40px] p-8 shadow-2xl bg-white/40 border-white/60">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black tracking-tighter uppercase italic">Dung lượng theo phòng ban</h3>
                        <PieChart className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-6">
                        {departments.map((dept, i) => (
                            <motion.div 
                                key={dept.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Folder className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{dept.name}</h4>
                                            <p className="text-[10px] text-muted-foreground">{dept.files} files</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">{dept.size}</p>
                                        <p className={cn("text-[10px] font-black uppercase tracking-widest", dept.used > 90 ? "text-destructive" : "text-muted-foreground")}>
                                            {dept.used}% used
                                        </p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", dept.used > 90 ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "cyber-gradient")}
                                        style={{ width: `${dept.used}%` }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* System Alerts */}
                <div className="space-y-6">
                    <div className="glass-panel rounded-[40px] p-8 shadow-2xl bg-white/40 border-white/60">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black tracking-tighter uppercase italic">Cảnh báo hệ thống</h3>
                            <AlertCircle className="w-5 h-5 text-warning" />
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20">
                                <p className="text-xs font-bold text-warning mb-1">Cảnh báo Quota</p>
                                <p className="text-[10px] font-medium text-slate-600">Phòng Kế Toán đã sử dụng vượt 90% dung lượng cấp phát. Cần kiểm tra hoặc mở rộng.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <p className="text-xs font-bold text-primary mb-1">Dọn dẹp tự động</p>
                                <p className="text-[10px] font-medium text-slate-600">Hệ thống phát hiện 12.5 GB file tạm có thể dọn dẹp.</p>
                                <button className="mt-3 w-full py-2 rounded-xl bg-white text-[9px] font-black text-primary uppercase shadow-sm hover:shadow-md transition-all">
                                    Dọn dẹp ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}