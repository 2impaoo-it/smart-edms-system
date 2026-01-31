import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Mock user for development - Change "role" to 'ADMIN', 'MANAGER', or 'EMPLOYEE' to test
    // Load user from localStorage if available
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    // Define permissions based on role
    const permissions = {
        canManageUsers: user?.role === "ADMIN",
        canSignDocs: ["MANAGER", "ADMIN"].includes(user?.role),
        canUpload: true, // Everyone can upload
    };

    // Signature State
    const [signature, setSignature] = useState(localStorage.getItem('userSignature'));

    const updateSignature = (newSig) => {
        if (newSig) {
            localStorage.setItem('userSignature', newSig);
        } else {
            localStorage.removeItem('userSignature');
        }
        setSignature(newSig);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, permissions, signature, updateSignature }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
