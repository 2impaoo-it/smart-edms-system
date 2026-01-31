import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { PenTool, Files, Users, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Mock Data
const statsData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 52 },
    { name: 'Wed', value: 38 },
    { name: 'Thu', value: 65 },
    { name: 'Fri', value: 48 },
    { name: 'Sat', value: 59 },
    { name: 'Sun', value: 62 },
];

const RecentFiles = [
    { id: 1, name: "Q4_Financial_Report.pdf", size: "2.4 MB", status: "Signed", type: "PDF" },
    { id: 2, name: "Project_Alpha_Specs.docx", size: "1.1 MB", status: "Pending", type: "DOCX" },
    { id: 3, name: "Employee_Contract_John.pdf", size: "850 KB", status: "Review", type: "PDF" },
];

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
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

export default function Dashboard() {
    const { user } = useAuth();

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
                <div className="flex gap-3">
                    <button className="glass-btn hover:bg-white/10 text-sm border-white/10">Filter View</button>
                    <button className="glass-btn glass-btn-primary text-sm shadow-xl shadow-primary/20">Generate Report</button>
                </div>
            </div>

            {/* Role-Based Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Documents" value="1,284" change={12} icon={Files} />
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
                        Document Activity
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData}>
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
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
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
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                                    <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-200">Contract #492{i}</p>
                                        <p className="text-xs text-gray-500">Waiting for your signature</p>
                                    </div>
                                    <PenTool className="w-4 h-4 text-gray-400" />
                                </div>
                            ))}
                        </div>
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
}
