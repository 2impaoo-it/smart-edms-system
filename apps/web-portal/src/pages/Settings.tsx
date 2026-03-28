import { useState, useEffect } from 'react';
import { ShieldAlert, Key, Download, AlertTriangle, User, Server, Database, HardDrive, Wifi, RefreshCw, Shield, Globe, LogOut, Save, Lock, Mail, UserCircle, Camera } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import { generateKeystore } from '../services/signatureService';
import { useNavigate } from 'react-router';
import { cn } from '../lib/utils';
import axiosClient from '../lib/axiosClient';

export const Settings = () => {
    const [user, setUser] = useState<any>(null);
    const [keystorePassword, setKeystorePassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();

    // Profile edit state
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password change state
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setEditName(parsed.name || parsed.username || '');
            setEditEmail(parsed.email || '');
        }
    }, []);

    const isAdmin = user?.role === 'ADMIN';

    // ─── Generate Keystore ───
    const handleGenerateKeystore = async () => {
        if (!keystorePassword || keystorePassword.length < 6) {
            toast.error("Thiếu thông tin", { description: "Vui lòng nhập mật khẩu tối thiểu 6 ký tự." });
            return;
        }
        try {
            setIsGenerating(true);
            const commonName = user?.name || user?.username || "Manager";
            const blob = await generateKeystore(commonName, keystorePassword);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'keystore.p12');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Khởi tạo thành công", { description: "Đã tải xuống khóa riêng tư (keystore.p12). Hãy cất giữ cẩn thận!" });
            setKeystorePassword('');
        } catch (error) {
            console.error(error);
            toast.error("Tạo khóa thất bại", { description: "Lỗi khi tạo chứng thư số. Vui lòng thử lại." });
        } finally {
            setIsGenerating(false);
        }
    };

    // ─── Save Profile ───
    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast.error("Lỗi", { description: "Tên hiển thị không được để trống." });
            return;
        }
        setIsSavingProfile(true);
        try {
            // Update localStorage with new profile
            const updatedUser = { ...user, name: editName.trim(), email: editEmail.trim() };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success("Cập nhật hồ sơ", { description: "Thông tin cá nhân đã được lưu thành công." });
        } catch {
            toast.error("Lỗi", { description: "Không thể cập nhật hồ sơ." });
        } finally {
            setIsSavingProfile(false);
        }
    };

    // ─── Change Password ───
    const handleChangePassword = async () => {
        if (!currentPass || !newPass) {
            toast.error("Thiếu thông tin", { description: "Vui lòng nhập đầy đủ mật khẩu cũ và mới." });
            return;
        }
        if (newPass !== confirmPass) {
            toast.error("Mật khẩu không khớp", { description: "Mật khẩu xác nhận không giống mật khẩu mới." });
            return;
        }
        if (newPass.length < 6) {
            toast.error("Mật khẩu quá ngắn", { description: "Mật khẩu mới cần tối thiểu 6 ký tự." });
            return;
        }
        setIsChangingPass(true);
        const tId = toast("Đang đổi mật khẩu...", { duration: 15000 });
        try {
            await axiosClient.put('/auth/change-password', {
                currentPassword: currentPass,
                newPassword: newPass
            });
            toast.dismiss(tId);
            toast.success("Đổi mật khẩu thành công!", { description: "Mật khẩu đã được cập nhật." });
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
        } catch (err: any) {
            toast.dismiss(tId);
            toast.error("Đổi mật khẩu thất bại", { description: err.response?.data?.message || "Sai mật khẩu hiện tại hoặc lỗi hệ thống." });
        } finally {
            setIsChangingPass(false);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic gradient-text flex items-center gap-3">
                        {isAdmin ? <Server className="w-8 h-8 text-primary" /> : <User className="w-8 h-8 text-primary" />}
                        {isAdmin ? 'Cài Đặt Hệ Thống' : 'Hồ Sơ & Cài Đặt'}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        {isAdmin ? 'Theo dõi trạng thái hạ tầng Server và quản lý tài khoản.' : 'Quản lý tài khoản, mật khẩu và khóa bảo mật của bạn.'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        toast.success('Đã đăng xuất', { description: 'Hẹn gặp lại bạn!' });
                        navigate('/');
                    }}
                    className="px-5 py-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all text-xs font-black uppercase flex items-center gap-2 shadow-sm shrink-0"
                >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </button>
            </div>

            {/* ═══ PROFILE SECTION ═══ */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Profile Info Card */}
                <div className="glass-panel rounded-[32px] border border-white/20 bg-white/40 overflow-hidden">
                    <div className="p-6 bg-white/40 border-b border-white/40">
                        <h3 className="font-bold flex items-center gap-2"><UserCircle className="w-5 h-5 text-primary" /> Thông tin cá nhân</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Avatar */}
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-3xl font-black shadow-lg">
                                    {(editName || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-lg">{user?.name || user?.username || 'Người dùng'}</p>
                                <span className={cn(
                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                    user?.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' :
                                    user?.role === 'MANAGER' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                                )}>
                                    {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'MANAGER' ? 'Trưởng phòng' : 'Nhân viên'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tên hiển thị</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="w-full py-3.5 rounded-xl cyber-gradient text-white text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Lưu Thay Đổi
                        </button>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="glass-panel rounded-[32px] border border-white/20 bg-white/40 overflow-hidden">
                    <div className="p-6 bg-white/40 border-b border-white/40">
                        <h3 className="font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-amber-500" /> Đổi mật khẩu</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={currentPass}
                                onChange={e => setCurrentPass(e.target.value)}
                                placeholder="Nhập mật khẩu cũ..."
                                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="Tối thiểu 6 ký tự..."
                                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới..."
                                className={cn(
                                    "w-full bg-white/50 border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20",
                                    confirmPass && confirmPass !== newPass ? "border-destructive" : "border-white/60"
                                )}
                            />
                            {confirmPass && confirmPass !== newPass && (
                                <p className="text-[10px] text-destructive font-bold">Mật khẩu xác nhận không khớp!</p>
                            )}
                        </div>

                        <button
                            onClick={handleChangePassword}
                            disabled={isChangingPass || !currentPass || !newPass || newPass !== confirmPass}
                            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Lock className="w-4 h-4" /> Đổi Mật Khẩu
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ ADMIN INFRASTRUCTURE DASHBOARD ═══ */}
            {isAdmin && (
                <>
                    <div className="pt-4">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6">
                            <Server className="w-5 h-5 text-primary" /> Trạng thái Hạ tầng
                        </h3>
                    </div>
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

                        {/* Nginx */}
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
                                <div className="flex justify-between"><span className="text-muted-foreground">Ngrok</span><span className="font-bold text-primary">Active</span></div>
                            </div>
                        </div>

                        {/* JWT */}
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
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ KEYSTORE GENERATOR (MANAGER/ADMIN) ═══ */}
            {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                <div className="glass-panel p-6 rounded-[32px] border border-white/20 bg-white/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-[32px]"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">Khởi tạo Chứng thư số cá nhân</h3>
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800 text-sm mb-1">CẢNH BÁO BẢO MẬT:</h4>
                                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                            Hệ thống <strong>KHÔNG</strong> lưu trữ mật khẩu cấp 2 và file Khóa bí mật (.p12). 
                                            Hãy tải về, lưu trữ an toàn và <strong>TUYỆT ĐỐI KHÔNG CHIA SẺ</strong>.
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
                                            value={keystorePassword}
                                            onChange={(e) => setKeystorePassword(e.target.value)}
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
