import { useState } from "react";
import { UploadCloud, X, User, FileText, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Managers List
const MANAGERS = [
    { id: 'mgr-1', name: 'Michael Scott', dept: 'Sales' },
    { id: 'mgr-2', name: 'Sarah Connor', dept: 'Operations' },
    { id: 'mgr-3', name: 'Tony Stark', dept: 'R&D' }
];

export default function SubmitDocumentModal({ isOpen, onClose, onSubmit }) {
    const [step, setStep] = useState(1);
    const [selectedManager, setSelectedManager] = useState("");
    const [file, setFile] = useState(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedManager) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const submissionData = {
            file,
            managerId: selectedManager,
            note,
            timestamp: new Date().toISOString()
        };

        onSubmit(submissionData);
        setIsSubmitting(false);
        resetForm();
    };

    const resetForm = () => {
        setStep(1);
        setFile(null);
        setSelectedManager("");
        setNote("");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Submit Document
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Step 1: Select Manager */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300">1. Select Recipient (Manager)</label>
                            <div className="grid grid-cols-1 gap-3">
                                {MANAGERS.map(mgr => (
                                    <div
                                        key={mgr.id}
                                        onClick={() => setSelectedManager(mgr.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedManager === mgr.id
                                                ? 'bg-primary/20 border-primary text-white'
                                                : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-white/10">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{mgr.name}</p>
                                                <p className="text-xs opacity-70">{mgr.dept}</p>
                                            </div>
                                        </div>
                                        {selectedManager === mgr.id && (
                                            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Upload File */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300">2. Upload Document</label>
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors group relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-10 h-10 text-success" />
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-gray-300">
                                        <UploadCloud className="w-10 h-10 mb-2" />
                                        <p className="font-medium">Click or Drag to Upload</p>
                                        <p className="text-xs">PDF, DOCX, XLSX (Max 10MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Note (Optional) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Note (Optional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a message for the manager..."
                                className="glass-input w-full h-24 resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!file || !selectedManager || isSubmitting}
                            className="w-full glass-btn glass-btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Submit Document
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
