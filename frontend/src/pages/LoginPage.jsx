import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useAnimation } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, User, LayoutDashboard, Database } from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [selectedRole, setSelectedRole] = useState("MANAGER"); // Default for quick testing
    const [email, setEmail] = useState("manager@smart-edms.com");
    const [password, setPassword] = useState("password");

    // 3D Mouse Parallax Effect
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / 25; // Sensitivity
        const y = (e.clientY - innerHeight / 2) / 25;
        setMousePosition({ x, y });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate Login Delay for Effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockUser = {
            name: selectedRole === 'ADMIN' ? "System Admin" : selectedRole === 'MANAGER' ? "Manager Mike" : "John Doe",
            role: selectedRole,
            avatar: "https://i.pravatar.cc/150?u=" + selectedRole
        };

        login(mockUser);
        navigate("/");
        setIsLoading(false);
    };

    // Update demo email based on role selection
    useEffect(() => {
        if (selectedRole === 'ADMIN') setEmail("admin@smart-edms.com");
        else if (selectedRole === 'MANAGER') setEmail("manager@smart-edms.com");
        else setEmail("employee@smart-edms.com");
    }, [selectedRole]);

    return (
        <div
            className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center overflow-hidden relative"
            onMouseMove={handleMouseMove}
        >
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />

            <div className="container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 px-6">

                {/* Left Side: 3D Document Stack Animation */}
                <div className="hidden lg:flex flex-col items-center justify-center relative h-[600px] perspective-1000">
                    <motion.div
                        className="relative w-80 h-[400px]"
                        style={{
                            rotateX: mousePosition.y,
                            rotateY: mousePosition.x,
                            transformStyle: "preserve-3d"
                        }}
                    >
                        {/* Stack Layer 3 (Bottom) */}
                        <div className="absolute inset-0 bg-gray-800/80 rounded-2xl border border-white/10 shadow-2xl skew-y-6 translate-z-[-40px] translate-x-12 translate-y-12 flex items-center justify-center opacity-60">
                            <Database className="w-20 h-20 text-gray-500 opacity-20" />
                        </div>

                        {/* Stack Layer 2 (Middle) */}
                        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl skew-y-3 translate-z-[-20px] translate-x-6 translate-y-6 flex items-center justify-center p-8">
                            <div className="w-full h-full border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center">
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600">Encrypted</span>
                            </div>
                        </div>

                        {/* Stack Layer 1 (Top - Active) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-primary/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col items-center justify-center p-8 transform transition-transform hover:scale-105">
                            {/* Logo / Brand */}
                            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-primary/50 shadow-inner">
                                <LayoutDashboard className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Smart E-DMS</h1>
                            <p className="text-gray-400 text-center text-sm">Next-Gen Document Management System</p>

                            {/* Animated Status Pill */}
                            <div className="mt-8 px-4 py-2 bg-success/10 border border-success/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-success">System Operational</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="glass-card p-10 relative z-20 backdrop-blur-xl bg-white/5 border border-white/10"
                >
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
                        <p className="text-gray-400">Enter your credentials to access the secure portal.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Quick Role Select (For Demo) */}
                        <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-black/20 rounded-lg">
                            {['ADMIN', 'MANAGER', 'USER'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRole(role)}
                                    className={`py-2 text-xs font-medium rounded-md transition-all ${selectedRole === role
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                                <input type="checkbox" className="rounded bg-black/20 border-white/10 text-primary focus:ring-primary" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="text-primary hover:text-primary/80 transition-colors">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 hover:to-primary/80 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Secure Enterprise Access
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Overlay styles for perspective */}
            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
