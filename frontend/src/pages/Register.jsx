import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { cn } from "../utils";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await axios.post("/api/auth/signup", {
                ...formData,
                role: ["user"], // Default role
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
                <h2 className="mb-6 text-center text-3xl font-bold text-white tracking-tight">
                    Create Account
                </h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            className={cn(
                                "mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            )}
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            className={cn(
                                "mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            )}
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            className={cn(
                                "mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            )}
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className={cn(
                                "mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            )}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white shadow-lg shadow-green-500/30 hover:bg-green-500 transition-all disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </motion.button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-green-400 hover:text-green-300">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
