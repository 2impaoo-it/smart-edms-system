import { useState } from "react";
import { PenTool, Files, Users, TrendingUp, Filter, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "../components/dashboard/StatCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import ActionRequired from "../components/dashboard/ActionRequired";
import RecentFiles from "../components/dashboard/RecentFiles";

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

const RECENT_FILES_DATA = [
    { id: 1, name: "Q4_Financial_Report.pdf", size: "2.4 MB", status: "Signed", type: "PDF" },
    { id: 2, name: "Project_Alpha_Specs.docx", size: "1.1 MB", status: "Pending", type: "DOCX" },
    { id: 3, name: "Employee_Contract_John.pdf", size: "850 KB", status: "Review", type: "PDF" },
];

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
                                <span className="ml-2">Generating...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span className="ml-2">Generate Report</span>
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
                <ActivityChart data={CHART_DATA[filterRange]} filterRange={filterRange} />

                {/* Right Col: Recent Files & Actions */}
                <div className="space-y-6">
                    <ActionRequired actions={actions} onResolve={resolveAction} />
                    <RecentFiles files={RECENT_FILES_DATA} />
                </div>
            </div>
        </div>
    );
};

// Import Manager and User Dashboards logic
import ManagerDashboard from "./ManagerDashboard";
import UserDashboard from "./UserDashboard";

export default function Dashboard() {
    const { user } = useAuth();

    if (user?.role === 'MANAGER') {
        return <ManagerDashboard />;
    }

    if (user?.role === 'USER') {
        return <UserDashboard />;
    }

    return <AdminDashboard />;
}
