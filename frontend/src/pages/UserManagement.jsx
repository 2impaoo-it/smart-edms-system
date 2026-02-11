import { useState } from "react";
import {
    Users, Search, Plus, MoreHorizontal, Shield,
    Mail, Phone, Calendar, CheckCircle, XCircle, Edit2, Trash2, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Mock Users Data
const INITIAL_USERS = [
    { id: 1, name: "Sarah Chen", email: "sarah.chen@company.com", role: "ADMIN", status: "Active", lastActive: "Just now", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { id: 2, name: "Mike Ross", email: "mike.ross@company.com", role: "MANAGER", status: "Active", lastActive: "5m ago", avatar: "https://i.pravatar.cc/150?u=mike" },
    { id: 3, name: "Jessica Park", email: "jessica.park@company.com", role: "EMPLOYEE", status: "Offline", lastActive: "1d ago", avatar: "https://i.pravatar.cc/150?u=jessica" },
    { id: 4, name: "John Doe", email: "john.doe@company.com", role: "EMPLOYEE", status: "Suspended", lastActive: "1w ago", avatar: "https://i.pravatar.cc/150?u=john" },
    { id: 5, name: "Alice Wong", email: "alice.wong@company.com", role: "MANAGER", status: "Active", lastActive: "1h ago", avatar: "https://i.pravatar.cc/150?u=alice" },
];

export default function UserManagement() {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // null = Add, object = Edit

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleOpenModal = (user = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (currentUser) {
            // Edit
            setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...data } : u));
        } else {
            // Add
            const newUser = {
                id: users.length + 1,
                ...data,
                lastActive: "Never",
                avatar: `https://i.pravatar.cc/150?u=${data.name}`
            };
            setUsers([...users, newUser]);
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-6 relative">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 glass-card p-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        User Management
                    </h2>
                    <p className="text-gray-400 mt-1">Manage system access and permissions</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="glass-input !pl-14 py-2 text-sm w-full"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="glass-btn glass-btn-primary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Last Active</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredUsers.map((user) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={user.id}
                                        className="group hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                                    user.role === 'MANAGER' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        'bg-gray-700/30 text-gray-300 border-gray-600/30'
                                                }`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.status === 'Active' ? 'bg-success/10 text-success border-success/20' :
                                                    user.status === 'Suspended' ? 'bg-error/10 text-error border-error/20' :
                                                        'bg-gray-700/30 text-gray-400 border-gray-600/30'
                                                }`}>
                                                {user.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {user.lastActive}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(user)} className="p-2 hover:bg-white/10 rounded-lg text-primary hover:text-white transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-white/10 rounded-lg text-error hover:text-white transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No users found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md glass-card p-6 shadow-2xl"
                        >
                            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold mb-6">{currentUser ? 'Edit User' : 'Add New User'}</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                    <input required name="name" defaultValue={currentUser?.name} className="glass-input w-full p-2" placeholder="John Doe" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                                    <input required name="email" type="email" defaultValue={currentUser?.email} className="glass-input w-full p-2" placeholder="john@company.com" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                        <select name="role" defaultValue={currentUser?.role || 'EMPLOYEE'} className="glass-input w-full p-2 [&>option]:bg-gray-900">
                                            <option value="ADMIN">Admin</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="EMPLOYEE">Employee</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                        <select name="status" defaultValue={currentUser?.status || 'Active'} className="glass-input w-full p-2 [&>option]:bg-gray-900">
                                            <option value="Active">Active</option>
                                            <option value="Suspended">Suspended</option>
                                            <option value="Offline">Offline</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 glass-btn hover:bg-white/10">Cancel</button>
                                    <button type="submit" className="flex-1 glass-btn glass-btn-primary">
                                        {currentUser ? 'Save Changes' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
