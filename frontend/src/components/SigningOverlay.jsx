import { useState } from "react";
import { FileText, Loader2, Minimize2, Maximize2, X, PenTool, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SigningOverlay = ({ doc, onClose, onSign }) => {
    const [step, setStep] = useState('reading'); // reading -> signing -> aligning -> signed
    const [scale, setScale] = useState(1);

    const { signature } = useAuth();
    const navigate = useNavigate();

    const handleSignClick = () => {
        if (!signature) {
            if (window.confirm("You have not set up your digital signature yet.\n\nPlease go to Settings to create one before signing.")) {
                navigate('/settings');
            }
            return;
        }

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
                        <h3 className="text-white font-medium">{doc.title || doc.name}</h3>
                        <p className="text-xs text-gray-500">Requested by {doc.requester || doc.uploader} • {doc.date}</p>
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
                                        <img
                                            src={signature || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/John_Hancock_Signature.svg/2560px-John_Hancock_Signature.svg.png"}
                                            alt="Signed"
                                            className="h-16 object-contain filter hue-rotate-240"
                                        />
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

export default SigningOverlay;
