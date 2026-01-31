import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Mock user for development - Change "role" to 'ADMIN', 'MANAGER', or 'EMPLOYEE' to test
    const [user, setUser] = useState({
        name: "Cyber User",
        role: "MANAGER",
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
