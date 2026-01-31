import { useState } from "react";
import {
    Folder, FileText, MoreVertical, Search, Plus,
    Grid, List as ListIcon, Filter, Download, Share2, Trash2
} from "lucide-react";
import { motion } from "framer-motion";

// Mock Data
const initialDocs = [
    { id: 1, name: "Financial Reports", type: "folder", items: 12, modified: "2h ago", owner: "Sarah Chen" },
    { id: 2, name: "Project Alpha", type: "folder", items: 8, modified: "5h ago", owner: "Mike Ross" },
    { id: 3, name: "Q4_Summary.pdf", type: "pdf", size: "2.4 MB", modified: "1d ago", owner: "You" },
    { id: 4, name: "Contract_Template.docx", type: "doc", size: "1.1 MB", modified: "2d ago", owner: "Legal Team" },
    { id: 5, name: "Budget_2024.xlsx", type: "xls", size: "850 KB", modified: "3d ago", owner: "Finance" },
    { id: 6, name: "Onboarding_Guide.pdf", type: "pdf", size: "3.2 MB", modified: "1w ago", owner: "HR" },
];

export default function DocumentExplorer() {
    const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
    const [selectedDocs, setSelectedDocs] = useState([]);

    const toggleSelection = (id) => {
        setSelectedDocs(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 glass-card">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="glass-btn glass-btn-primary flex items-center gap-2 text-sm px-4 py-2">
                        <Plus className="w-4 h-4" /> New Upload
                    </button>
                    <div className="h-8 w-px bg-white/10 mx-2" />
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" placeholder="Search files..." className="glass-input pl-9 py-2 text-sm w-full" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ListIcon className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <button className="p-2 text-gray-400 hover:text-white">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-2"}>
                {initialDocs.map((doc) => (
                    <motion.div
                        layout
                        key={doc.id}
                        onClick={() => toggleSelection(doc.id)}
                        className={`
              group relative p-4 rounded-xl border transition-all cursor-pointer
              ${selectedDocs.includes(doc.id)
                                ? 'bg-primary/10 border-primary/50'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
              ${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col items-center text-center gap-3'}
            `}
                    >
                        {/* Context Menu Trigger */}
                        <button className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Icon */}
                        <div className={`
              ${viewMode === 'grid' ? 'p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 mb-2' : 'p-2 rounded-lg'}
            `}>
                            {doc.type === 'folder' ? (
                                <Folder className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} text-warning`} />
                            ) : (
                                <FileText className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} text-primary`} />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-medium text-gray-200 truncate w-full">{doc.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{doc.type === 'folder' ? `${doc.items} items` : doc.size}</span>
                                <span>•</span>
                                <span>{doc.modified}</span>
                            </div>
                        </div>

                        {/* List View Extra Info */}
                        {viewMode === 'list' && (
                            <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 mr-8">
                                <span className="w-24">{doc.owner}</span>
                                <span className="w-20">{doc.type.toUpperCase()}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Floating Action Bar (Selection) */}
            {selectedDocs.length > 0 && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111827] border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50"
                >
                    <span className="text-sm font-medium text-white">{selectedDocs.length} selected</span>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white" title="Download">
                            <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white" title="Share">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full text-error hover:bg-error/10" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
