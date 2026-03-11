import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Settings, 
    Shield, 
    Bell, 
    Paintbrush, 
    Save,
    Key,
    Server,
    Mail
} from "lucide-react";
import { cn } from "../lib/utils";

export function AdminSettings() {
    const [activeTab, setActiveTab] = useState("security");

    const tabs = [
        { id: "security", label: "Bảo mật & Phân quyền", icon: Shield },
        { id: "system", label: "Hệ thống & Lưu trữ", icon: Server },
        { id: "notifications", label: "Thông báo & Email", icon: Bell },
        { id: "appearance", label: "Giao diện (UI)", icon: Paintbrush },
    ];

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        Cài đặt hệ thống
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Cấu hình các tham số cốt lõi của toàn bộ ứng dụng.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none cyber-gradient px-8 py-3 rounded-2xl text-[10px] font-black text-white flex items-center justify-center gap-2 shadow-neon hover:scale-105 transition-all uppercase tracking-widest">
                        <Save className="w-4 h-4" /> Lưu cấu hình
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-6 py-4 rounded-3xl text-sm font-black transition-all duration-300",
                                activeTab === tab.id 
                                    ? "bg-primary text-white shadow-neon scale-[1.02]" 
                                    : "glass-panel bg-white/40 border-white/60 text-muted-foreground hover:bg-white/60 hover:text-foreground"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-panel rounded-[40px] p-8 shadow-2xl bg-white/40 border-white/60 min-h-[500px]"
                    >
                        {activeTab === "security" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
                                        <Key className="w-5 h-5 text-primary" /> Cấu hình bảo mật
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                                            <div>
                                                <p className="font-bold text-sm">Xác thực 2 yếu tố (2FA)</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">Bắt buộc tất cả Manager & Admin phải bật 2FA.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                                            <div>
                                                <p className="font-bold text-sm">Tự động đăng xuất (Session Timeout)</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">Thời gian không hoạt động trước khi bị đăng xuất.</p>
                                            </div>
                                            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20">
                                                <option>15 Phút</option>
                                                <option>30 Phút</option>
                                                <option>1 Giờ</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                                            <div>
                                                <p className="font-bold text-sm">Chính sách mật khẩu</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">Yêu cầu ký tự đặc biệt, số và chữ hoa.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "system" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
                                        <Server className="w-5 h-5 text-primary" /> Tham số hệ thống
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm space-y-3">
                                            <div>
                                                <p className="font-bold text-sm">Giới hạn file tải lên (Max File Size)</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">Dung lượng tối đa cho 1 file (MB).</p>
                                            </div>
                                            <input type="number" defaultValue={50} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>

                                        <div className="p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm space-y-3">
                                            <div>
                                                <p className="font-bold text-sm">Định dạng file cho phép</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">Các đuôi file được phép tải lên hệ thống (cách nhau bởi dấu phẩy).</p>
                                            </div>
                                            <input type="text" defaultValue="pdf, docx, xlsx, png, jpg" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-primary" /> Cấu hình Email SMTP
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">SMTP Server</label>
                                            <input type="text" defaultValue="smtp.gmail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Port</label>
                                            <input type="number" defaultValue={587} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email gửi</label>
                                            <input type="email" defaultValue="noreply@smartedms.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div className="md:col-span-2 pt-2">
                                            <button className="px-6 py-3 rounded-xl bg-slate-100 text-[10px] font-black uppercase text-muted-foreground hover:bg-slate-200 transition-colors">
                                                Gửi Email Test
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "appearance" && (
                            <div className="space-y-8 text-center py-10">
                                <Paintbrush className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                                <h3 className="text-2xl font-black tracking-tighter uppercase italic gradient-text">Theme Settings Locked</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Hệ thống hiện tại đang sử dụng bộ giao diện <span className="font-bold text-foreground">Cyberpunk Light Mode</span> độc quyền. Việc thay đổi theme tạm thời bị vô hiệu hóa để đảm bảo tính đồng bộ nhận diện thương hiệu.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}