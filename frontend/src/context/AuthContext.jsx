import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Mock user for development - Change "role" to 'ADMIN', 'MANAGER', or 'EMPLOYEE' to test
    const [user, setUser] = useState({
        name: "Cyber User",
        role: "ADMIN",
        avatar: "https://i.pravatar.cc/150?u=cyber"
    });

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);

    // Define permissions based on role
    const permissions = {
        canManageUsers: user?.role === "ADMIN",
        canSignDocs: ["MANAGER", "ADMIN"].includes(user?.role),
        canUpload: true, // Everyone can upload
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, permissions }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
