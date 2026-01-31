import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { cn } from "../utils";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        const res = await login(username, password);
        if (!res.success) {
            setError(res.message);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
                <h2 className="mb-6 text-center text-3xl font-bold text-white tracking-tight">
                    Welcome Back
                </h2>
                <p className="mb-8 text-center text-gray-400">
                    Sign in to access your Smart E-DMS
                </p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-200"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Username
                        </label>
                        <input
                            type="text"
                            className={cn(
                                "mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            )}
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            className={cn(
                                "mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            )}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all"
                    >
                        Sign In
                    </motion.button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                        Contact Admin
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
