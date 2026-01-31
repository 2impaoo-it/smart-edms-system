import { motion } from "framer-motion";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { DocumentCanvas } from "../components/signing/DocumentCanvas";
import { SignaturePad } from "../components/signing/SignaturePad";
import { ChainOfCustody } from "../components/signing/ChainOfCustody";

export function SignDocument() {
    const { id } = useParams();

    const handleComplete = () => {
        alert("Document signed successfully! Signature has been verified and stored on the blockchain.");
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen p-4 md:p-8 bg-[#030712] text-white">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 md:mb-6"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-white/10">
                            <FileText className="w-6 h-6 md:w-8 md:h-8 text-[#6366f1]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Sign Document</h1>
                            <p className="text-xs md:text-sm text-gray-400 mt-1">
                                Document ID: {id} • Contract_2024.pdf
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    {/* Left sidebar - Signature tools */}
                    <div className="col-span-12 lg:col-span-3 order-1 lg:order-none">
                        <SignaturePad />
                    </div>

                    {/* Center - Document canvas */}
                    <div className="col-span-12 lg:col-span-6 order-3 lg:order-none">
                        <div className="h-[60vh] md:h-[calc(100vh-12rem)]">
                            <DocumentCanvas />
                        </div>
                    </div>

                    {/* Right sidebar - Chain of custody */}
                    <div className="col-span-12 lg:col-span-3 order-2 lg:order-none">
                        <ChainOfCustody />
                    </div>
                </div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 md:mt-6 flex items-center justify-end gap-3 md:gap-4"
                >
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-white"
                        >
                            Cancel
                        </motion.button>
                    </Link>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleComplete}
                        className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:shadow-lg hover:shadow-[#6366f1]/50 transition-all font-semibold glow-hover text-white"
                    >
                        Complete Signature
                    </motion.button>
                </motion.div>
            </div>
        </DndProvider>
    );
}

export default SignDocument;
