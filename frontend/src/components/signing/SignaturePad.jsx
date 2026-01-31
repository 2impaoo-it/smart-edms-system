import { motion } from "framer-motion";
import { useDrag } from "react-dnd";
import { CheckCircle2, AlertCircle } from "lucide-react";

const stamps = [
    { id: "stamp1", type: "primary", name: "Your Signature", verified: true },
    { id: "stamp2", type: "witness", name: "Witness Signature", verified: false },
];

function SignatureStamp({ stamp }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "signature",
        item: { id: stamp.id, name: stamp.name },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <motion.div
            ref={drag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 1.05 : 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative cursor-move p-4 rounded-xl bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/10 border border-[#ef4444]/30 group"
        >
            {/* Holographic effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />

            <div className="relative flex flex-col items-center gap-2">
                {stamp.verified ? (
                    <CheckCircle2 className="w-6 h-6 text-[#10b981]" strokeWidth={1.5} />
                ) : (
                    <AlertCircle className="w-6 h-6 text-[#f59e0b]" strokeWidth={1.5} />
                )}
                <div className="text-center">
                    <p className="text-sm font-medium text-white">{stamp.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {stamp.verified ? "Verified" : "Pending"}
                    </p>
                </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-[#ef4444]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
        </motion.div>
    );
}

export function SignaturePad() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass glass-hover rounded-2xl p-6"
        >
            <h3 className="text-lg font-semibold mb-4">Signature Tools</h3>
            <div className="space-y-3">
                {stamps.map((stamp) => (
                    <SignatureStamp key={stamp.id} stamp={stamp} />
                ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 text-center">
                    Drag signatures to the document canvas
                </p>
            </div>
        </motion.div>
    );
}
