import { useState, useEffect } from "react";
import {
    FileText, CheckCircle, XCircle, Clock, Eye,
    ArrowRight, Search, Filter, PenTool, ChevronDown,
    Loader2, Minimize2, Maximize2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// --- Components ---

// 1. Smart Signing Overlay
const SigningOverlay = ({ doc, onClose, onSign }) => {
    const [step, setStep] = useState('reading'); // reading -> signing -> aligning -> signed
    const [scale, setScale] = useState(1);

    const handleSignClick = () => {
        setStep('aligning');
        // Simulate AI Alignment Process
        setTimeout(() => setStep('signed'), 2000);
        setTimeout(() => onSign(doc.id), 3500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        >
            {/* Toolbar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111827]">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{doc.title}</h3>
                        <p className="text-xs text-gray-500">Requested by {doc.requester} • {doc.date}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* PDF Viewer Simulation */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-900 relative">
                <motion.div
                    layout
                    style={{ scale }}
                    className="w-full max-w-3xl bg-white min-h-[1000px] shadow-2xl rounded-sm p-12 text-gray-900 relative"
                >
                    {/* Mock Document Content */}
                    <div className="space-y-6 opacity-80 pointer-events-none select-none">
                        <div className="h-8 bg-gray-200 w-1/3 mb-10" />
                        <div className="h-4 bg-gray-200 w-full" />
                        <div className="h-4 bg-gray-200 w-full" />
                        <div className="h-4 bg-gray-200 w-4/5" />
                        <div className="h-40 bg-gray-100 w-full my-8" />
                        <div className="h-4 bg-gray-200 w-full" />
                        <div className="h-4 bg-gray-200 w-full" />

                        {/* Signature Block */}
                        <div className="mt-20 flex justify-between px-10">
                            <div className="text-center">
                                <div className="h-px w-40 bg-black mb-2" />
                                <p className="font-bold">Requester</p>
                            </div>
                            <div className="text-center relative">
                                {/* AI Alignment Marker */}
                                {step === 'aligning' && (
                                    <motion.div
                                        className="absolute -inset-4 border-2 border-primary/50 rounded-lg flex items-center justify-center bg-primary/5"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className="flex flex-col items-center gap-1 text-primary text-xs font-mono">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            AI Aligning...
                                        </div>
                                    </motion.div>
                                )}

                                {/* Placed Signature */}
                                {step === 'signed' && (
                                    <motion.div
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute -top-12 left-0 right-0 flex justify-center"
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/John_Hancock_Signature.svg/2560px-John_Hancock_Signature.svg.png" alt="Signed" className="w-32 opacity-90 filter hue-rotate-240" />
                                        <div className="absolute top-0 right-0 p-1 bg-green-500 rounded-full shadow-lg">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="h-px w-40 bg-black mb-2 mt-12" />
                                <p className="font-bold">Manager</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Actions */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="glass-btn p-3 rounded-full"><Minimize2 className="w-5 h-5" /></button>

                    {step === 'reading' && (
                        <button
                            onClick={handleSignClick}
                            className="glass-btn glass-btn-primary px-8 py-3 rounded-full text-lg shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all flex items-center gap-3"
                        >
                            <PenTool className="w-5 h-5" /> Sign Document
                        </button>
                    )}

                    {step === 'aligning' && (
                        <div className="glass-btn px-8 py-3 rounded-full text-primary flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                        </div>
                    )}

                    {step === 'signed' && (
                        <div className="glass-btn px-8 py-3 rounded-full text-success bg-success/10 border-success/30 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" /> Signed Successfully
                        </div>
                    )}

                    <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="glass-btn p-3 rounded-full"><Maximize2 className="w-5 h-5" /></button>
                </div>
            </div>
        </motion.div>
    );
};

export default function SigningQueue() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all, high, normal
    const [activeDoc, setActiveDoc] = useState(null); // Document being signed
    const [showFilters, setShowFilters] = useState(false);

    // Mock Pending Documents
    const [queue, setQueue] = useState([
        { id: 1, title: "Q4 Financial Report", requester: "Sarah Chen", date: "2024-03-15", size: "2.4 MB", priority: "High" },
        { id: 2, title: "NDA - External Contractor", requester: "Legal Dept", date: "2024-03-14", size: "1.1 MB", priority: "Medium" },
        { id: 3, title: "Project Alpha Blueprint", requester: "Mike Ross", date: "2024-03-14", size: "15.2 MB", priority: "Normal" },
        { id: 4, title: "Internship Agreement", requester: "HR Team", date: "2024-03-13", size: "850 KB", priority: "Low" },
        { id: 5, title: "Monthly Expense Request", requester: "John Doe", date: "2024-03-12", size: "120 KB", priority: "Normal" },
    ]);

    // Filtering Logic
    const filteredQueue = queue.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.requester.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.priority.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSignComplete = (id) => {
        // Remove from queue after animation
        setActiveDoc(null);
        setTimeout(() => {
            setQueue(queue.filter(d => d.id !== id));
        }, 500);
    };

    const handleReject = (id) => {
        if (confirm("Reject this document request?")) {
            setQueue(queue.filter(d => d.id !== id));
        }
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

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 glass-card p-6 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-amber-400" />
                        Signing Queue
                    </h2>
                    <p className="text-gray-400 mt-1">Review and approve pending documents.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto relative">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search queue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Fixed Padding Issue
                            className="glass-input !pl-10 py-2 text-sm w-full font-sans"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`glass-btn px-3 py-2 ${showFilters ? 'bg-primary/20 text-primary' : 'text-gray-400'} hover:text-white`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>

                        {/* Filter Popup */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-48 glass-card border border-white/10 z-20 p-2"
                                >
                                    <p className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase">Priority</p>
                                    {['all', 'high', 'medium', 'normal', 'low'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => { setStatusFilter(f); setShowFilters(false); }}
                                            className={`w-full text-left px-2 py-1.5 text-sm rounded-lg capitalize hover:bg-white/5 transition-colors ${statusFilter === f ? 'text-primary' : 'text-gray-300'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
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
                                                    onClick={() => setActiveDoc(doc)}
                                                    className="glass-btn glass-btn-primary py-1.5 px-4 text-xs flex items-center gap-2"
                                                >
                                                    <PenTool className="w-4 h-4" /> Review
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
                            <p>No documents found matching filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
