import { motion } from "motion/react";
import { Link } from "react-router";
import { FileText, MoreVertical, Eye, Download, Share2 } from "lucide-react";
import { useState } from "react";

interface Document {
  id: string;
  name: string;
  owner: string;
  status: "signed" | "pending" | "draft";
  lastModified: string;
  size: string;
}

const documents: Document[] = [
  { id: "1", name: "Q4_Financial_Report.pdf", owner: "Sarah Chen", status: "signed", lastModified: "2 hours ago", size: "2.4 MB" },
  { id: "2", name: "Employee_Contract_2024.pdf", owner: "Mike Ross", status: "pending", lastModified: "5 hours ago", size: "1.2 MB" },
  { id: "3", name: "Marketing_Proposal.pdf", owner: "Jessica Park", status: "signed", lastModified: "1 day ago", size: "3.8 MB" },
  { id: "4", name: "NDA_Agreement.pdf", owner: "David Kim", status: "draft", lastModified: "2 days ago", size: "856 KB" },
  { id: "5", name: "Invoice_January_2024.pdf", owner: "Emily Wong", status: "signed", lastModified: "3 days ago", size: "1.5 MB" },
];

const statusConfig = {
  signed: { color: "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20", label: "Signed" },
  pending: { color: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20", label: "Pending" },
  draft: { color: "text-[#6b7280] bg-[#6b7280]/10 border-[#6b7280]/20", label: "Draft" },
};

export function DocTable() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass glass-hover rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base md:text-lg font-semibold">Recent Documents</h3>
        <Link
          to="/documents"
          className="text-xs md:text-sm text-[#6366f1] hover:text-[#a855f7] transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Document</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Owner</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Modified</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Size</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => {
              const statusStyle = statusConfig[doc.status];
              const isHovered = hoveredRow === doc.id;

              return (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onMouseEnter={() => setHoveredRow(doc.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`border-b border-white/5 transition-all spotlight ${
                    isHovered ? "bg-white/5" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20">
                        <FileText className="w-4 h-4 text-[#6366f1]" strokeWidth={1.5} />
                      </div>
                      <Link
                        to={`/sign/${doc.id}`}
                        className="text-sm hover:text-[#6366f1] transition-colors max-w-xs truncate"
                      >
                        {doc.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">{doc.owner}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${statusStyle.color}`}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">{doc.lastModified}</td>
                  <td className="py-4 px-4 text-sm text-gray-400">{doc.size}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" strokeWidth={1.5} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      >
                        <Share2 className="w-4 h-4" strokeWidth={1.5} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}