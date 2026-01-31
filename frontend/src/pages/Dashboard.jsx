import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { PenTool, Files, Users, TrendingUp, AlertCircle, Clock, Filter, Download, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data Sets
const CHART_DATA = {
    week: [
        { name: 'Mon', value: 45 }, { name: 'Tue', value: 52 }, { name: 'Wed', value: 38 },
        { name: 'Thu', value: 65 }, { name: 'Fri', value: 48 }, { name: 'Sat', value: 59 }, { name: 'Sun', value: 62 },
    ],
    month: [
        { name: 'Week 1', value: 150 }, { name: 'Week 2', value: 230 },
        { name: 'Week 3', value: 180 }, { name: 'Week 4', value: 290 },
    ],
    year: [
        { name: 'Q1', value: 540 }, { name: 'Q2', value: 620 },
        { name: 'Q3', value: 780 }, { name: 'Q4', value: 910 },
    ]
};

const RecentFiles = [
    { id: 1, name: "Q4_Financial_Report.pdf", size: "2.4 MB", status: "Signed", type: "PDF" },
    { id: 2, name: "Project_Alpha_Specs.docx", size: "1.1 MB", status: "Pending", type: "DOCX" },
    { id: 3, name: "Employee_Contract_John.pdf", size: "850 KB", status: "Review", type: "PDF" },
];

const StatCard = ({ title, value, change, icon: Icon }) => (
    <div className="glass-card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Icon className="w-12 h-12 text-white/5" />
        </div>
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-6 h-6" />
            </div>
            <span className={change > 0 ? "text-success text-sm" : "text-error text-sm"}>
                {change > 0 ? '+' : ''}{change}%
            </span>
        </div>
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{value}</h3>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();

    // State
    const [filterRange, setFilterRange] = useState('week');
    const [isGenerating, setIsGenerating] = useState(false);
    const [actions, setActions] = useState([
        { id: 1, name: "Contract #4921", desc: "Waiting for your signature" },
        { id: 2, name: "Policy Update v2", desc: "Review required" }
    ]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Handlers
    const handleGenerateReport = () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setIsGenerating(false);
            alert(`Report for ${filterRange} generated successfully! Check your downloads.`);
        }, 2000);
    };

    const resolveAction = (id) => {
        setActions(prev => prev.filter(action => action.id !== id));
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="text-gradient">{user.name}</span>
                    </h1>
                    <p className="text-gray-400">Here's what's happening with your documents today.</p>
                </div>
                <div className="flex gap-3 relative">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className="glass-btn hover:bg-white/10 text-sm border-white/10 flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            <span>{filterRange.charAt(0).toUpperCase() + filterRange.slice(1)} View</span>
                        </button>

                        <AnimatePresence>
                            {showFilterMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full mt-2 right-0 w-32 glass-card border border-white/10 bg-[#111827] z-50 overflow-hidden"
                                >
                                    {['week', 'month', 'year'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => { setFilterRange(range); setShowFilterMenu(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/20 transition-colors ${filterRange === range ? 'text-primary' : 'text-gray-400'}`}
                                        >
                                            This {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Generate Report Button */}
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="glass-btn glass-btn-primary text-sm shadow-xl shadow-primary/20 flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Generate Report</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Role-Based Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Documents" value={filterRange === 'year' ? "12,840" : filterRange === 'month' ? "4,203" : "1,284"} change={12} icon={Files} />
                <StatCard title="Pending Signatures" value="8" change={-5} icon={PenTool} />
                {user.role === 'ADMIN' && (
                    <StatCard title="Active Users" value="142" change={3} icon={Users} />
                )}
                <StatCard title="Storage Used" value="45%" change={2} icon={TrendingUp} />
            </div>

            {/* Main Content Split */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left Col: Activity Chart */}
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Document Activity ({filterRange})
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA[filterRange]}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#4b5563" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Col: Recent Files & Actions */}
                <div className="space-y-6">

                    {/* Action Required */}
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
                                                    onClick={() => resolveAction(action.id)}
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

                    {/* Recent Files List */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-secodary" />
                            Recent Files
                        </h3>
                        <div className="space-y-4">
                            {RecentFiles.map(file => (
                                <div key={file.id} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <Files className="w-8 h-8 text-primary/80 p-1.5 bg-primary/10 rounded" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-200">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${file.status === 'Signed' ? 'bg-success/20 text-success' :
                                        file.status === 'Pending' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                                        }`}>
                                        {file.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Import Manager Dashboard Lazily or Directly (assuming it exists based on plan)
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
    const { user } = useAuth();

    if (user?.role === 'MANAGER') {
        return <ManagerDashboard />;
    }

    return <AdminDashboard />;
}
