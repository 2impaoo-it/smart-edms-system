import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Folder, FileText, MoreVertical, Search, Plus,
    Grid, List as ListIcon, Filter, Download, Share2, Trash2,
    ChevronRight, Home, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Mock Organizational Data Structure
const ORGANIZATION_DATA = [
    {
        id: 'dept-1', name: "IT Department", type: "folder", modified: "1d ago", items: [
            {
                id: 'mgr-1', name: "Manager Mike", type: "folder", modified: "2h ago", items: [
                    {
                        id: 'emp-1', name: "John Doe (Dev)", type: "folder", modified: "5m ago", items: [
                            { id: 'file-1', name: "Backend_API_Specs.pdf", type: "pdf", size: "2.4 MB", modified: "1d ago" },
                            { id: 'file-2', name: "Database_Schema.sql", type: "sql", size: "15 KB", modified: "2d ago" }
                        ]
                    },
                    {
                        id: 'emp-2', name: "Alice Smith (QA)", type: "folder", modified: "1h ago", items: [
                            { id: 'file-3', name: "Test_Plan_v2.docx", type: "doc", size: "1.1 MB", modified: "3h ago" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'dept-2', name: "HR Department", type: "folder", modified: "1w ago", items: [
            {
                id: 'mgr-2', name: "Sarah Connor", type: "folder", modified: "3d ago", items: [
                    {
                        id: 'emp-3', name: "Emily Blunt (Recruiter)", type: "folder", modified: "4d ago", items: [
                            { id: 'file-4', name: "Candidate_CVs.zip", type: "zip", size: "45 MB", modified: "4d ago" }
                        ]
                    }
                ]
            }
        ]
    },
    { id: 'file-root', name: "Company_Policy.pdf", type: "pdf", size: "3.2 MB", modified: "1 month ago" }
];

export default function DocumentExplorer() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const folderId = searchParams.get('folder');

    const [viewMode, setViewMode] = useState("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocs, setSelectedDocs] = useState([]);

    // Recursive Helper to find path to a folder ID
    const findPath = (targetId, nodes, path = []) => {
        for (const node of nodes) {
            if (node.id === targetId) return [...path, node];
            if (node.items) {
                const foundPath = findPath(targetId, node.items, [...path, node]);
                if (foundPath) return foundPath;
            }
        }
        return null;
    };

    // Derived State: Current Path
    const currentPath = useMemo(() => {
        if (!folderId) return [];
        return findPath(folderId, ORGANIZATION_DATA) || [];
    }, [folderId]);

    // Derived State: Current Folder Items or Search Results
    const displayedItems = useMemo(() => {
        if (searchTerm.trim()) {
            // Search Mode: Flatten All
            const flatten = (items) => {
                let flat = [];
                for (const i of items) {
                    flat.push(i);
                    if (i.items) flat = [...flat, ...flatten(i.items)];
                }
                return flat;
            };
            return flatten(ORGANIZATION_DATA).filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        } else {
            // Browse Mode
            if (currentPath.length > 0) {
                const currentFolder = currentPath[currentPath.length - 1];
                return currentFolder.items || [];
            }
            return ORGANIZATION_DATA;
        }
    }, [currentPath, searchTerm]);

    // Handlers
    const handleNavigate = (item) => {
        if (item.type === 'folder') {
            setSearchParams({ folder: item.id });
            setSearchTerm("");
        }
    };

    const handleBreadcrumb = (node) => {
        if (!node) {
            setSearchParams({}); // Root
        } else {
            setSearchParams({ folder: node.id });
        }
    };

    const toggleSelection = (id) => {
        setSelectedDocs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 p-4 glass-card">

                {/* Top Bar: Actions & Search */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Admin Restriction: No Upload */}
                        {user.role !== 'ADMIN' && (
                            <button className="glass-btn glass-btn-primary flex items-center gap-2 text-sm px-4 py-2">
                                <Plus className="w-4 h-4" /> New Upload
                            </button>
                        )}

                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search all files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-input !pl-14 py-2 text-sm w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}>
                            <Grid className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}>
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Bottom Bar: Breadcrumbs */}
                {!searchTerm && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {/* Back Button (Browser History) */}
                        <button
                            onClick={() => window.history.back()}
                            className="p-1 hover:text-white mr-2"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handleBreadcrumb(null)}
                            className={`flex items-center gap-1 hover:text-white transition-colors ${currentPath.length === 0 ? 'text-white font-medium' : ''}`}
                        >
                            <Home className="w-4 h-4" />
                            <span>Documents</span>
                        </button>

                        {currentPath.map((folder, index) => (
                            <div key={folder.id} className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                <button
                                    onClick={() => handleBreadcrumb(folder)}
                                    className={`hover:text-white transition-colors whitespace-nowrap ${index === currentPath.length - 1 ? 'text-white font-medium' : ''}`}
                                >
                                    {folder.name}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Area */}
            {displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No items found</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-2"}>
                    {displayedItems.map((doc) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={doc.id}
                            onClick={() => doc.type === 'folder' && !selectedDocs.includes(doc.id) ? handleNavigate(doc) : toggleSelection(doc.id)}
                            className={`
                group relative p-4 rounded-xl border transition-all cursor-pointer
                ${selectedDocs.includes(doc.id)
                                    ? 'bg-primary/10 border-primary/50'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                ${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col items-center text-center gap-3'}
              `}
                        >
                            {/* Context Menu Trigger */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleSelection(doc.id); }}
                                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
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
                                    <span>{doc.type === 'folder' ? `${doc.items?.length || 0} items` : doc.size}</span>
                                    <span>•</span>
                                    <span>{doc.modified}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Floating Action Bar */}
            <AnimatePresence>
                {selectedDocs.length > 0 && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
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
            </AnimatePresence>
        </div>
    );
}
