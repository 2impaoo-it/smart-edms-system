import { useState } from "react";
import {
    FileText, CheckCircle, Clock, TrendingUp,
    Users, AlertCircle, ArrowUpRight, ArrowRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SigningOverlay from "../components/SigningOverlay";

export default function ManagerDashboard() {
    const [activeDoc, setActiveDoc] = useState(null); // Document to sign
    const [showDeptLog, setShowDeptLog] = useState(false); // Modal state

    // Mock Data
    const stats = [
        { title: "Pending Approvals", value: "12", change: "+4 today", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
        { title: "Team Uploads", value: "45", change: "+12% vs last week", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
        { title: "Signed Today", value: "8", change: "On track", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    ];

    const [pendingDocs, setPendingDocs] = useState([
        { id: 1, name: "Q4_Financial_Report.pdf", uploader: "Sarah Chen", date: "2 hours ago", status: "Urgent" },
        { id: 2, name: "Project_X_Proposal.docx", uploader: "Mike Ross", date: "4 hours ago", status: "Normal" },
        { id: 3, name: "Employee_Contract_J.Doe.pdf", uploader: "HR Dept", date: "1 day ago", status: "Normal" },
        { id: 4, name: "Budget_Allocation_2025.xlsx", uploader: "Finance", date: "1 day ago", status: "Review" },
    ]);

    const teamActivity = [
        { user: "Sarah Chen", action: "uploaded", file: "Q4_Report_Draft.pdf", time: "2h ago" },
        { user: "Mike Ross", action: "modified", file: "Client_Meeting_Notes.txt", time: "3h ago" },
        { user: "Jessica Park", action: "deleted", file: "Old_Policy_v1.pdf", time: "5h ago" },
        { user: "Sarah Chen", action: "uploaded", file: "Q4_Report_Final.pdf", time: "1h ago" },
        { user: "Tom Wilson", action: "commented on", file: "Budget_2025.xlsx", time: "30m ago" },
    ];

    const handleSignComplete = (id) => {
        setActiveDoc(null);
        setTimeout(() => {
            setPendingDocs(prev => prev.filter(d => d.id !== id));
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Signing Modal */}
            <AnimatePresence>
                {activeDoc && (
                    <SigningOverlay
                        doc={activeDoc}
                        onClose={() => setActiveDoc(null)}
                        onSign={handleSignComplete}
                    />
                )}
            </AnimatePresence>

            {/* Department Log Modal */}
            <AnimatePresence>
                {showDeptLog && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setShowDeptLog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Department Log
                                </h3>
                                <button onClick={() => setShowDeptLog(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                                {teamActivity.map((activity, i) => (
                                    <div key={i} className="flex gap-4 items-start p-3 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                                            {activity.user.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-gray-300 text-sm">
                                                <span className="font-semibold text-white">{activity.user}</span> {activity.action} <span className="text-primary">{activity.file}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-white/5 text-center">
                                <button onClick={() => setShowDeptLog(false)} className="text-sm text-gray-400 hover:text-white">Close Log</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Manager Overview
                    </h2>
                    <p className="text-gray-400 mt-1">Review pending items and monitor team progress.</p>
                </div>
                <div className="hidden md:block">
                    <span className="text-sm text-gray-500">Last updated: Just now</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 relative overflow-hidden group hover:bg-white/5 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                                <h3 className="text-3xl font-bold mt-2 text-white">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                            <TrendingUp className="w-4 h-4 text-success" />
                            <span>{stat.change}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Pending Approvals (Active Task List) */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            Needs Your Signature
                        </h3>
                        <Link to="/signing-queue" className="text-primary text-sm hover:underline flex items-center gap-1">
                            View all Queue <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingDocs.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">All caught up! No approved needed.</p>
                        ) : pendingDocs.map((doc, i) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{doc.name}</h4>
                                        <p className="text-xs text-gray-400">Uploaded by <span className="text-gray-300">{doc.uploader}</span> • {doc.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {doc.status === 'Urgent' && (
                                        <span className="px-2 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                                            URGENT
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setActiveDoc(doc)}
                                        className="glass-btn glass-btn-primary py-1.5 px-3 text-xs"
                                    >
                                        Sign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Activity Feed */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-blue-400" />
                        Team Activity
                    </h3>

                    <div className="relative border-l-2 border-white/10 ml-3 space-y-6">
                        {teamActivity.slice(0, 3).map((activity, i) => (
                            <div key={i} className="relative pl-6">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-600 ring-4 ring-[#0f1219]" />
                                <p className="text-sm text-gray-300">
                                    <span className="font-semibold text-white">{activity.user}</span> {activity.action}
                                </p>
                                <p className="text-xs text-primary mt-0.5 truncate max-w-[200px]">{activity.file}</p>
                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowDeptLog(true)}
                        className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        View Department Log
                    </button>
                </div>

            </div>
        </div>
    );
}
