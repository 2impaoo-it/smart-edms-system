import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDrop } from "react-dnd";
import { ZoomIn, ZoomOut, RotateCw, Download, Share2 } from "lucide-react";

interface PlacedSignature {
  id: string;
  name: string;
  x: number;
  y: number;
}

export function DocumentCanvas() {
  const [signatures, setSignatures] = useState<PlacedSignature[]>([]);
  const [zoom, setZoom] = useState(100);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "signature",
    drop: (item: { id: string; name: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const canvasRect = document.getElementById("canvas")?.getBoundingClientRect();
        if (canvasRect) {
          setSignatures((prev) => [
            ...prev,
            {
              id: `${item.id}-${Date.now()}`,
              name: item.name,
              x: offset.x - canvasRect.left,
              y: offset.y - canvasRect.top,
            },
          ]);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass glass-hover rounded-2xl p-6 h-full flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Document Preview</h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <span className="text-sm text-gray-400 min-w-[4rem] text-center">
            {zoom}%
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <RotateCw className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={drop}
        id="canvas"
        className={`flex-1 bg-[#1E1E1E] rounded-xl relative overflow-hidden border-2 transition-colors ${
          isOver ? "border-[#6366f1] bg-[#6366f1]/5" : "border-white/10"
        }`}
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
      >
        {/* PDF-like document mockup */}
        <div className="absolute inset-8 bg-white/95 rounded shadow-2xl p-12">
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-12" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-4/5" />
            <div className="h-12" />
            <div className="border-t-2 border-gray-400 pt-8">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
              <div className="h-20 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-500 text-sm">
                Signature Area - Drop signature here
              </div>
            </div>
          </div>
        </div>

        {/* Placed signatures */}
        <AnimatePresence>
          {signatures.map((sig) => (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              drag
              dragMomentum={false}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              style={{ x: sig.x, y: sig.y }}
              className="absolute cursor-move"
            >
              <div className="relative p-3 rounded-lg bg-[#ef4444]/90 backdrop-blur-sm border-2 border-[#dc2626] shadow-2xl">
                {/* Holographic shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-lg" />
                <div className="relative">
                  <p className="text-white font-semibold text-sm whitespace-nowrap">
                    {sig.name}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                {/* Glow */}
                <div className="absolute inset-0 bg-[#ef4444] rounded-lg blur-xl opacity-50 -z-10" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Drop indicator */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#6366f1]/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="p-6 rounded-2xl bg-[#6366f1]/20 border-2 border-[#6366f1] border-dashed">
              <p className="text-[#6366f1] font-semibold">Drop signature here</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Help text */}
      {signatures.length === 0 && !isOver && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 text-center mt-4"
        >
          Drag signature stamps from the left panel onto the document
        </motion.p>
      )}
    </motion.div>
  );
}
