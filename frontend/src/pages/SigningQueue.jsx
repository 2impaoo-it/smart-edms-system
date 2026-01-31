import { useState } from "react";
import {
    FileText, CheckCircle, XCircle, Clock, Eye,
    ArrowRight, Search, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SigningQueue() {
    const [searchTerm, setSearchTerm] = useState("");

    // Mock Pending Documents
    const [queue, setQueue] = useState([
        { id: 1, title: "Q4 Financial Report", requester: "Sarah Chen", date: "2024-03-15", size: "2.4 MB", priority: "High" },
        { id: 2, title: "NDA - External Contractor", requester: "Legal Dept", date: "2024-03-14", size: "1.1 MB", priority: "Medium" },
        { id: 3, title: "Project Alpha Blueprint", requester: "Mike Ross", date: "2024-03-14", size: "15.2 MB", priority: "Normal" },
        { id: 4, title: "Internship Agreement", requester: "HR Team", date: "2024-03-13", size: "850 KB", priority: "Low" },
        { id: 5, title: "Monthly Expense Request", requester: "John Doe", date: "2024-03-12", size: "120 KB", priority: "Normal" },
    ]);

    const filteredQueue = queue.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.requester.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSign = (id) => {
        // Navigate to PDF Viewer Flow (Mock for now)
        alert(`Opening Signing Interface for Document #${id}`);
    };

    const handleReject = (id) => {
        if (confirm("Reject this document request?")) {
            setQueue(queue.filter(d => d.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 glass-card p-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-amber-400" />
                        Signing Queue
                    </h2>
                    <p className="text-gray-400 mt-1">Review and approve pending documents.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search queue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="glass-input pl-9 py-2 text-sm w-full font-sans"
                        />
                    </div>
                    <button className="glass-btn px-3 py-2 text-gray-400 hover:text-white">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Queue List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Document Name</th>
                                <th className="p-4 font-medium">Requester</th>
                                <th className="p-4 font-medium">Date Sent</th>
                                <th className="p-4 font-medium">Priority</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredQueue.map((doc) => (
                                    <motion.tr
                                        key={doc.id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="group hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{doc.title}</p>
                                                    <p className="text-xs text-gray-500">{doc.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{doc.requester}</td>
                                        <td className="p-4 text-gray-400 text-sm">{doc.date}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${doc.priority === 'High' ? 'bg-error/10 text-error border-error/20' :
                                                    doc.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-gray-700/30 text-gray-400 border-gray-600/30'
                                                }`}>
                                                {doc.priority}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleReject(doc.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-error transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleSign(doc.id)}
                                                    className="glass-btn glass-btn-primary py-1.5 px-4 text-xs flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Sign
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredQueue.length === 0 && (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
                            <p>No documents pending in queue</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
