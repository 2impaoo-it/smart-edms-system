import { useState } from "react";
import {
    Clock, CheckCircle2, XCircle, FileText,
    AlertCircle, UploadCloud, Calendar, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import SubmitDocumentModal from "../components/SubmitDocumentModal";

const UserDashboard = () => {
    const { user } = useAuth();
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    // Mock Notifications / Action Items
    const [actionItems, setActionItems] = useState([
        { id: 1, type: 'rejected', title: 'Leave Request Rejected', desc: 'Manager Mike requested clarification on dates.', time: '2h ago' },
        { id: 2, type: 'signed', title: 'Contract Signed', desc: 'Your employment contract has been finalized.', time: '1d ago' },
        { id: 3, type: 'pending', title: 'Budget Approval Pending', desc: 'Waiting for Sarah Connor to review.', time: '30m ago' }
    ]);

    // Mock Recent Submissions
    const recentSubmissions = [
        { id: 101, name: "Project_Proposal_v2.pdf", manager: "Sarah Connor", status: "Pending", date: "Today, 10:23 AM" },
        { id: 102, name: "Q3_Expense_Report.xlsx", manager: "Michael Scott", status: "Approved", date: "Yesterday, 4:15 PM" },
        { id: 103, name: "Design_Assets.zip", manager: "Tony Stark", status: "Rejected", date: "Jan 28, 2026" },
    ];

    const handleSubmitSuccess = (data) => {
        setIsSubmitModalOpen(false);
        // Add optimistic update to recent submissions or show toast
        alert(`Document "${data.file.name}" sent to Manager successfully!`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-success/20 text-success';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            default: return 'bg-warning/20 text-warning';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <FileText className="w-64 h-64 text-primary" />
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Hello, <span className="text-gradient">{user.name}</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl">
                        You have <span className="text-white font-bold">{actionItems.length}</span> updates since your last login.
                        Your document requests are being processed efficiently.
                    </p>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="glass-btn glass-btn-primary px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all font-semibold"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Submit New Document
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Action Required & Notifications */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-warning" />
                            Action Required & Updates
                        </h3>

                        <div className="space-y-3">
                            {actionItems.map(item => (
                                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-start gap-4">
                                    <div className={`mt-1 p-2 rounded-full ${item.type === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                            item.type === 'signed' ? 'bg-success/20 text-success' :
                                                'bg-primary/20 text-primary'
                                        }`}>
                                        {item.type === 'rejected' ? <XCircle className="w-5 h-5" /> :
                                            item.type === 'signed' ? <CheckCircle2 className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-gray-200">{item.title}</h4>
                                            <span className="text-xs text-gray-500">{item.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Submissions Table */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Recent Submissions
                            </h3>
                            <button className="text-sm text-primary hover:text-white transition-colors">View All</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-500 text-sm border-b border-white/10">
                                        <th className="pb-3 font-medium">Document Name</th>
                                        <th className="pb-3 font-medium">Sent To</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentSubmissions.map(doc => (
                                        <tr key={doc.id} className="group border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <td className="py-4 font-medium text-gray-200 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary opacity-70 group-hover:opacity-100" />
                                                {doc.name}
                                            </td>
                                            <td className="py-4 text-gray-400">{doc.manager}</td>
                                            <td className="py-4 text-gray-500">{doc.date}</td>
                                            <td className="py-4 text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar / Quick Stats */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-gradient-to-b from-primary/10 to-transparent border-primary/20">
                        <h3 className="text-lg font-bold text-white mb-4">My Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#111827] border border-white/10 text-center">
                                <p className="text-3xl font-bold text-white mb-1">12</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[#111827] border border-white/10 text-center">
                                <p className="text-3xl font-bold text-success mb-1">45</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Approved</p>
                            </div>
                        </div>
                    </div>

                    {/* Mini Calendar / Tips (Placeholder) */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Calendar
                        </h3>
                        <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400 text-sm">
                            No upcoming deadlines.
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Modal */}
            <SubmitDocumentModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onSubmit={handleSubmitSuccess}
            />
        </div>
    );
};

export default UserDashboard;
