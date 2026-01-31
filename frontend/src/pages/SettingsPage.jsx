import { useState, useRef, useEffect } from "react";
import {
    User, Lock, Bell, PenTool, Camera, Save, LogOut,
    Shield, Smartphone, Mail, Moon, Sun, Monitor, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Show notification helper
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const tabs = [
        { id: "profile", label: "My Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "signature", label: "Digital Signature", icon: PenTool },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 glass-card p-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                    <p className="text-gray-400 mt-1">Manage your profile, security preferences, and signature</p>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 glass-card p-4 h-fit sticky top-6">
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-card p-6 md:p-8 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "profile" && <ProfileSettings user={user} showNotification={showNotification} />}
                            {activeTab === "security" && <SecuritySettings showNotification={showNotification} />}
                            {activeTab === "notifications" && <NotificationSettings showNotification={showNotification} />}
                            {activeTab === "signature" && <SignatureSettings showNotification={showNotification} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 bg-secondary text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// 1. Profile Settings Component
function ProfileSettings({ user, showNotification }) {
    const [formData, setFormData] = useState({
        fullName: "Admin User",
        email: "admin@smart-edms.com",
        title: "System Administrator",
        bio: "Managing the digital infrastructure."
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        showNotification("Profile updated successfully!");
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <img
                        src="https://i.pravatar.cc/150?u=admin"
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-4 border-white/10"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/80 transition-colors">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">Upload New Picture</h3>
                    <p className="text-sm text-gray-400">Max file size 2MB. PNG, JPG allowed.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="glass-input w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input value={formData.email} disabled className="glass-input w-full opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Job Title</label>
                        <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="glass-input w-full" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Bio</label>
                    <textarea rows="4" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="glass-input w-full resize-none" />
                </div>

                <div className="pt-4">
                    <button type="submit" className="glass-btn glass-btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

// 2. Security Settings Component
function SecuritySettings({ showNotification }) {
    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <input type="password" placeholder="Current Password" className="glass-input w-full" />
                    <div />
                    <input type="password" placeholder="New Password" className="glass-input w-full" />
                    <input type="password" placeholder="Confirm New Password" className="glass-input w-full" />
                </div>
                <button onClick={() => showNotification("Password updated!")} className="glass-btn bg-white/5 hover:bg-white/10 text-white border border-white/10">Update Password</button>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 glass-card border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-lg text-primary">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Authenticator App</h4>
                            <p className="text-sm text-gray-400">Secure your account with TOTP (Google Auth, Authy)</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">Setup</button>
                </div>
            </section>
        </div>
    );
}

// 3. Notification Settings Component
function NotificationSettings({ showNotification }) {
    const [toggles, setToggles] = useState({
        emailAlerts: true,
        pushNotifs: true,
        weeklyReport: false,
        securityAlerts: true
    });

    const Toggle = ({ label, desc, checked, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div>
                <p className="font-medium text-white">{label}</p>
                <p className="text-sm text-gray-400">{desc}</p>
            </div>
            <button
                onClick={onChange}
                className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-primary' : 'bg-gray-700'}`}
            >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Email Preferences</h3>
            <div className="glass-card p-6 space-y-2">
                <Toggle
                    label="Email Alerts"
                    desc="Receive emails about new document assignments"
                    checked={toggles.emailAlerts}
                    onChange={() => { setToggles(p => ({ ...p, emailAlerts: !p.emailAlerts })); showNotification("Preference saved"); }}
                />
                <Toggle
                    label="Weekly Reports"
                    desc="Get a summary of your activity every Monday"
                    checked={toggles.weeklyReport}
                    onChange={() => { setToggles(p => ({ ...p, weeklyReport: !p.weeklyReport })); showNotification("Preference saved"); }}
                />
            </div>

            <h3 className="text-lg font-bold text-white mb-4">System Notifications</h3>
            <div className="glass-card p-6 space-y-2">
                <Toggle
                    label="Push Notifications"
                    desc="Receive browser notifications"
                    checked={toggles.pushNotifs}
                    onChange={() => { setToggles(p => ({ ...p, pushNotifs: !p.pushNotifs })); showNotification("Preference saved"); }}
                />
                <Toggle
                    label="Security Alerts"
                    desc="Notify me about login attempts"
                    checked={toggles.securityAlerts}
                    onChange={() => { setToggles(p => ({ ...p, securityAlerts: !p.securityAlerts })); showNotification("Preference saved"); }}
                />
            </div>
        </div>
    );
}

// 4. Signature Canvas Component
function SignatureSettings({ showNotification }) {
    const { signature, updateSignature } = useAuth(); // Get signature and update function from context
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Default to 'upload' mode if a signature exists, so we can show the preview
    const [signatureMethod, setSignatureMethod] = useState(signature ? "upload" : "draw");

    // Initialize loaded image with the existing signature from context
    const [uploadedImage, setUploadedImage] = useState(signature || null);

    const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

    useEffect(() => {
        if (signatureMethod === 'draw') {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#6366f1'; // Primary color
            }
        }
    }, [signatureMethod]);

    // Update local state if context signature changes (e.g. key cleared elsewhere)
    useEffect(() => {
        console.log("Context Signature Changed:", signature);
        if (signature) {
            setUploadedImage(signature);
            setSignatureMethod('upload'); // Switch to view mode
        } else {
            setUploadedImage(null);
            // Optional: switch back to draw or stay in upload but empty
        }
    }, [signature]);

    // Drawing Handlers
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasDrawnSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.closePath();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawnSignature(false);
        }
    };

    // Upload Handlers
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showNotification("File size too large (Max 2MB)", "error");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => setUploadedImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const clearUpload = () => {
        setUploadedImage(null);
    };

    const handleDeleteSignature = () => {
        if (confirm("Are you sure you want to remove your digital signature?")) {
            updateSignature(null);
            setUploadedImage(null);
            setSignatureMethod('draw'); // Reset to draw mode
            showNotification("Signature removed.", "info");
        }
    };

    const saveSignature = () => {
        if (signatureMethod === 'draw' && !hasDrawnSignature) return;
        if (signatureMethod === 'upload' && !uploadedImage) return;

        // Save logic
        const signatureData = signatureMethod === 'draw'
            ? canvasRef.current.toDataURL()
            : uploadedImage;

        updateSignature(signatureData);
        showNotification("Digital signature saved successfully!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Your Digital Signature</h3>
                    <p className="text-gray-400 text-sm">Choose how you want to provide your signature.</p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setSignatureMethod('draw')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${signatureMethod === 'draw' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <PenTool className="w-4 h-4" /> Draw
                    </button>
                    <button
                        onClick={() => setSignatureMethod('upload')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${signatureMethod === 'upload' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Camera className="w-4 h-4" /> Upload / View
                    </button>
                </div>
            </div>

            {/* Drawing Mode */}
            {signatureMethod === 'draw' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="border border-white/20 rounded-xl overflow-hidden bg-white/5 inline-block relative group">
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={300}
                            className="cursor-crosshair touch-none bg-[#1f2937]"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        {!hasDrawnSignature && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <span className="text-gray-500 font-medium">Sign here...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={clearCanvas} className="glass-btn bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                            Clear
                        </button>
                        <button
                            onClick={saveSignature}
                            disabled={!hasDrawnSignature}
                            className="glass-btn glass-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" /> Save Signature
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Upload Mode */}
            {signatureMethod === 'upload' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 max-w-xl"
                >
                    {!uploadedImage ? (
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                            <Camera className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-gray-300 font-medium mb-2">Drag & Drop or Click to Upload</p>
                            <p className="text-gray-500 text-sm mb-6">Support PNG, JPG (Max 2MB)</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="signature-upload"
                            />
                            <label
                                htmlFor="signature-upload"
                                className="glass-btn bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
                            >
                                Select Image
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative border border-white/20 rounded-xl overflow-hidden bg-white/5 p-4 flex items-center justify-center h-[300px]">
                                <img src={uploadedImage} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                                <button
                                    onClick={clearUpload}
                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                                >
                                    <LogOut className="w-4 h-4" /> {/* Using LogOut icon as 'X' replacement or import X */}
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDeleteSignature}
                                    className="glass-btn bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-medium px-4 py-2"
                                >
                                    Delete Signature
                                </button>
                                {uploadedImage !== signature && (
                                    <button
                                        onClick={saveSignature}
                                        className="glass-btn glass-btn-primary flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save Signature
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
