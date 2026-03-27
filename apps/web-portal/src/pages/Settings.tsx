import { useState, useEffect } from 'react';
import { ShieldAlert, Key, Download, AlertTriangle, User, Server, Database, HardDrive, Wifi, RefreshCw, Shield, Globe, LogOut } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import { generateKeystore } from '../services/signatureService';
import { useNavigate } from 'react-router';

export const Settings = () => {
    const [user, setUser] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const isAdmin = user?.role === 'ADMIN';

    const handleGenerateKeystore = async () => {
        if (!password || password.length < 6) {
            toast.error("Thiếu thông tin", { description: "Vui lòng nhập mật khẩu tối thiểu 6 ký tự." });
            return;
        }

        try {
            setIsGenerating(true);
            const commonName = user?.name || user?.username || "Manager";
            const blob = await generateKeystore(commonName, password);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'keystore.p12');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success("Khởi tạo thành công", { description: "Đã tải xuống khóa riêng tư (keystore.p12). Hãy cất giữ cẩn thận!" });
            setPassword('');
        } catch (error) {
            console.error(error);
            toast.error("Tạo khóa thất bại", { description: "Lỗi khi tạo chứng thư số. Vui lòng thử lại." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* HEADER */}
            <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text flex items-center gap-3">
                    {isAdmin ? <Server className="w-8 h-8 text-primary" /> : <User className="w-8 h-8 text-primary" />}
                    {isAdmin ? 'Cài Đặt Hệ Thống' : 'Hồ Sơ & Cài Đặt'}
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                    {isAdmin ? 'Theo dõi trạng thái và cấu hình toàn bộ hạ tầng Server.' : 'Quản lý tài khoản, mật khẩu và khóa bảo mật của bạn.'}
                </p>
            </div>

            {/* USER PROFILE CARD - Shown for all roles */}
            <div className="glass-panel p-6 rounded-[32px] border border-white/20 bg-white/40">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                        <User className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{user?.name || user?.username || 'Người dùng'}</h2>
                        <p className="text-sm text-primary font-semibold tracking-wider">
                            {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'MANAGER' ? 'Trưởng phòng / Quản lý' : 'Nhân viên'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{user?.email || 'N/A'}</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            toast.success('Đã đăng xuất', { description: 'Hẹn gặp lại bạn!' });
                            navigate('/');
                        }}
                        className="px-5 py-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all text-xs font-black uppercase flex items-center gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* ═══════════════════ ADMIN SYSTEM SETTINGS ═══════════════════ */}
            {isAdmin && (
                <>
                    {/* INFRASTRUCTURE STATUS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* PostgreSQL */}
                        <div className="glass-panel p-5 rounded-[28px] bg-white/40 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Database className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-sm">PostgreSQL</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold">Primary Database</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase">Online</span></div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Host</span><span className="font-bold">localhost:5432</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Database</span><span className="font-bold">smartedms</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">DDL Auto</span><span className="font-bold text-amber-600">create</span></div>
                            </div>
                        </div>

                        {/* MinIO */}
                        <div className="glass-panel p-5 rounded-[28px] bg-white/40 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><HardDrive className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-sm">MinIO S3</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold">Object Storage</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase">Online</span></div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-bold">localhost:9000</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Console</span><span className="font-bold">localhost:9001</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Bucket</span><span className="font-bold">documents</span></div>
                            </div>
                        </div>

                        {/* Kafka */}
                        <div className="glass-panel p-5 rounded-[28px] bg-white/40 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Wifi className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-sm">Apache Kafka</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold">Event Streaming</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase">Online</span></div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Bootstrap</span><span className="font-bold">localhost:9092</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-bold">KRaft</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Replication</span><span className="font-bold">1</span></div>
                            </div>
                        </div>

                        {/* Gotenberg */}
                        <div className="glass-panel p-5 rounded-[28px] bg-white/40 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><RefreshCw className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-sm">Gotenberg</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold">PDF Converter</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase">Online</span></div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">URL</span><span className="font-bold">localhost:3001</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Engine</span><span className="font-bold">LibreOffice</span></div>
                            </div>
                        </div>

                        {/* Nginx Gateway */}
                        <div className="glass-panel p-5 rounded-[28px] bg-white/40 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center"><Globe className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-sm">Nginx Gateway</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold">API Gateway</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase">Online</span></div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Port</span><span className="font-bold">:80</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Ngrok</span><span className="font-bold text-primary truncate max-w-[140px]">Active</span></div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="glass-panel p-5 rounded-[28px] bg-white/40 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Shield className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-sm">JWT Auth</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold">Security Layer</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase">Active</span></div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Algorithm</span><span className="font-bold">HS256</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">TTL</span><span className="font-bold">24 giờ</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Default Pass</span><span className="font-bold text-amber-600">Welcome@123</span></div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════ KEYSTORE FOR MANAGER/ADMIN ═══════════════════ */}
            {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                <div className="glass-panel p-6 rounded-[32px] border border-white/20 bg-white/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-[32px]"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">Khởi tạo Chứng thư số cá nhân</h3>
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl mb-6">
                                <div className="flex items-start gap-3 flex-col sm:flex-row">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">CẢNH BÁO BẢO MẬT:</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                                            Hệ thống <strong>KHÔNG</strong> lưu trữ mật khẩu cấp 2 và file Khóa bí mật (.p12) của bạn. 
                                            Vui lòng tải về, lưu trữ ở nơi an toàn và <strong>TUYỆT ĐỐI KHÔNG CHIA SẺ</strong> cho bất kỳ ai.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-sm">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu bảo vệ Khóa (Passphrase)</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Nhập tối thiểu 6 ký tự..."
                                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleGenerateKeystore}
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Khởi tạo & Tải file .p12 xuống
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
