import { useState } from "react";
import {
    Users, Search, Plus, MoreHorizontal, Shield,
    Mail, Phone, Calendar, CheckCircle, XCircle
} from "lucide-react";

// Mock Users Data
const initialUsers = [
    { id: 1, name: "Sarah Chen", email: "sarah.chen@company.com", role: "ADMIN", status: "Active", lastActive: "Just now", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { id: 2, name: "Mike Ross", email: "mike.ross@company.com", role: "MANAGER", status: "Active", lastActive: "5m ago", avatar: "https://i.pravatar.cc/150?u=mike" },
    { id: 3, name: "Jessica Park", email: "jessica.park@company.com", role: "EMPLOYEE", status: "Offline", lastActive: "1d ago", avatar: "https://i.pravatar.cc/150?u=jessica" },
    { id: 4, name: "John Doe", email: "john.doe@company.com", role: "EMPLOYEE", status: "Suspended", lastActive: "1w ago", avatar: "https://i.pravatar.cc/150?u=john" },
    { id: 5, name: "Alice Wong", email: "alice.wong@company.com", role: "MANAGER", status: "Active", lastActive: "1h ago", avatar: "https://i.pravatar.cc/150?u=alice" },
];

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = initialUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
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
                            className="glass-input pl-9 py-2 text-sm w-full"
                        />
                    </div>
                    <button className="glass-btn glass-btn-primary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap">
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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
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
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Stub */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400">
                    <span>Showing 1 to {filteredUsers.length} of {initialUsers.length} results</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 rounded hover:bg-white/5 disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 rounded hover:bg-white/5">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
