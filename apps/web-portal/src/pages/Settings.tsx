import React, { useState, useEffect } from 'react';
import { ShieldAlert, Key, Download, AlertTriangle, User } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import { generateKeystore } from '../services/signatureService';

export const Settings = () => {
    const [user, setUser] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleGenerateKeystore = async () => {
        if (!password || password.length < 6) {
            toast.error("Thiếu thông tin", { description: "Vui lòng nhập mật khẩu tối thiểu 6 ký tự." });
            return;
        }

        try {
            setIsGenerating(true);
            const commonName = user?.name || user?.username || "Manager";
            const blob = await generateKeystore(commonName, password);
            
            // Create download link
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
        <div className="p-6 max-w-4xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-black gradient-text mb-2">Hồ sơ cá nhân & Cài đặt</h1>
                <p className="text-muted-foreground text-sm">Quản lý tài khoản, mật khẩu và khóa bảo mật của bạn</p>
            </div>

            <div className="grid gap-6">
                {/* Thông tin cơ bản */}
                <div className="glass-panel p-6 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.name || user?.username || 'Người dùng'}</h2>
                            <p className="text-sm text-primary font-semibold tracking-wider">
                                {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'MANAGER' ? 'Trưởng phòng / Quản lý' : 'Nhân viên'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Khu vực tạo Keystore cho Manager/Admin */}
                {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                    <div className="glass-panel p-6 rounded-2xl border border-white/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-2xl"></div>
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
                                                Vui lòng tải về, lưu trữ ở nơi an toàn (không để trên máy tính chung) và <strong>TUYỆT ĐỐI KHÔNG CHIA SẺ</strong> cho bất kỳ ai. 
                                                Nếu làm mất file hoặc quên mật khẩu, bạn bắt buộc phải khởi tạo lại từ đầu, các tài liệu cũ sẽ không bị mất giá trị pháp lý nhưng bản thân bạn phải báo cáo mất khóa.
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
        </div>
    );
};
