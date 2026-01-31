import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            // Optional: Fetch user details if needed, for now just decode or assume logic
            // const decoded = jwtDecode(token);
            // setUser(decoded);
        } else {
            localStorage.removeItem("token");
            setUser(null);
        }
    }, [token]);

    const login = async (username, password) => {
        // MOCK LOGIN LOGIC FOR UI TESTING
        if (username === "admin" && password === "123456") {
            const mockUser = {
                id: 1,
                username: "admin",
                email: "admin@smartedms.com",
                roles: ["ROLE_ADMIN"]
            };
            const mockToken = "mock-jwt-token-123456";

            setToken(mockToken);
            setUser(mockUser);
            localStorage.setItem("token", mockToken);
            localStorage.setItem("user", JSON.stringify(mockUser));
            return { success: true };
        }

        try {
            const response = await axios.post("/api/auth/signin", {
                username,
                password,
            });
            const { accessToken, id, email, roles } = response.data;
            setToken(accessToken);
            setUser({ id, username, email, roles });
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed. Try 'admin' / '123456' for mock access.",
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
